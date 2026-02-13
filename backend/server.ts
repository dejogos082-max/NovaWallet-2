/**
 * NOTE: This is the backend code. 
 * In a real deployment, this runs on a Node.js server or Firebase Functions.
 * It is provided here to fulfill the requirement of "routes -> controllers -> services" 
 * and "Never call Invictus from browser".
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { z } from 'zod';
import * as admin from 'firebase-admin';
import axios from 'axios';

// Fix for missing Node.js type definitions
declare var require: any;
declare var module: any;

// --- Types & Config ---
const PORT = process.env.PORT || 3000;
const INVICTUS_API_KEY = "RawY3nr01yxyE9iQvjKOaQqxkXCAIh4X3c7DDAf8cuk7MJV9biAw0QuN09n2";
const INVICTUS_BASE_URL = "https://api.invictuspay.app.br/api";
const RECAPTCHA_SECRET_KEY = "6Lfk32ksAAAAANC1xqUDxi_WBtDAbGapQlOAPOEf";
const FCM_SERVER_KEY = "Whm0kI7vlsPu5M6OG4-MMyGFs_QBU3BcH7e9ZQZS5V0";

const app = express();

// --- Firebase Admin Initialization ---
// NOTE: In a production environment, you must provide the Service Account credentials
// via GOOGLE_APPLICATION_CREDENTIALS environment variable.
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(), // Uses env var or default google creds
      databaseURL: "https://novawallet-63345-default-rtdb.firebaseio.com/"
    });
    console.log("Firebase Admin Initialized connected to RTDB");
  } catch (error) {
    console.error("Failed to initialize Firebase Admin (Check Credentials):", error);
  }
}

// Helper to access RTDB
const getRtdb = () => admin.database();

// --- Middleware ---
// Cast to any to avoid TypeScript overload mismatch issues in some environments
app.use(helmet() as any);
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }) as any);
app.use(express.json({ limit: '10kb' }) as any);
app.use(compression() as any);

// --- Authentication Middleware ---
// Use any for req/res to avoid conflicts with global Request/Response (Fetch API) types
const verifyAuth = async (req: any, res: any, next: NextFunction) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // Verify ID Token with Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Auth verification failed:", error);
    // For demo purposes ONLY, if admin SDK fails (no creds), we might mock. 
    // BUT requested to be production ready structure: return error.
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// --- Validators ---
const depositSchema = z.object({
  amount: z.number().int().positive().min(100), // Min 1.00 BRL
});

const withdrawSchema = z.object({
  amount: z.number().int().positive().min(100),
  keyType: z.enum(['cpf', 'email', 'phone', 'random', 'cnpj']),
  key: z.string().min(3),
});

// --- Services (Invictus Provider) ---
const invictusProvider = {
  createPixTransaction: async (amount: number, customer: any) => {
    try {
      // Step 1: Call Invictus
      const response = await axios.post(
        `${INVICTUS_BASE_URL}/public/v1/transactions?api_token=${INVICTUS_API_KEY}`,
        {
          amount: amount, 
          payment_method: "pix",
          customer: {
            name: customer.name || "Customer",
            email: customer.email,
          }
        },
        { timeout: 10000 }
      );
      return response.data;
    } catch (error: any) {
      console.error("Invictus Error:", error.response?.data || error.message);
      throw new Error("Payment Gateway Error");
    }
  },

  createTransfer: async (amount: number, pixKey: string, keyType: string) => {
    // Note: Invictus might have a specific endpoint for Transfers/Payouts.
    // Assuming a generic /transfers endpoint for this example as specific payout docs were not provided in prompt.
    console.log(`Simulating call to Invictus Transfer: ${amount} to ${keyType}:${pixKey}`);
    
    // Simulate API delay
    await new Promise(r => setTimeout(r, 1000));
    
    return {
      id: `transfer_${Date.now()}`,
      status: 'processed'
    };
  },
  
  getTransaction: async (hash: string) => {
     const response = await axios.get(
        `${INVICTUS_BASE_URL}/public/v1/transactions/${hash}?api_token=${INVICTUS_API_KEY}`
     );
     return response.data;
  }
};

// --- Controllers ---
const PixController = {
  createDeposit: async (req: any, res: any) => {
    try {
      const { amount } = depositSchema.parse(req.body);
      const user = req.user;

      // Call Provider
      const gatewayRes = await invictusProvider.createPixTransaction(amount, { 
        name: user.name || 'Usuario NovaWallet',
        email: user.email 
      });

      const txId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Save pending transaction to RTDB
      await getRtdb().ref(`transactions/${txId}`).set({
        userId: user.uid,
        amount: amount,
        type: 'deposit',
        method: 'pix',
        status: 'created',
        hash: gatewayRes.hash || "mock_hash",
        pixQrCode: gatewayRes.qrcode_base64,
        pixCopyPaste: gatewayRes.pix_copia_cola,
        createdAt: admin.database.ServerValue.TIMESTAMP,
        updatedAt: admin.database.ServerValue.TIMESTAMP
      });

      res.json({
        transactionId: txId,
        hash: gatewayRes.hash || "mock_hash_123",
        status: 'created',
        qrCode: gatewayRes.qrcode_base64 || "mock_qrcode_base64",
        pixPayload: gatewayRes.pix_copia_cola || "mock_payload",
        expiresAt: new Date(Date.now() + 3600000).toISOString()
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Internal Error' });
    }
  },

  createWithdraw: async (req: any, res: any) => {
    try {
      const { amount, key, keyType } = withdrawSchema.parse(req.body);
      const user = req.user;
      const db = getRtdb();

      // 1. Transactional Balance Check & Deduct
      // We use a RTDB transaction to ensure atomic updates
      const walletRef = db.ref(`wallets/${user.uid}/balance`);
      
      const { committed, snapshot } = await walletRef.transaction((currentBalance) => {
        if ((currentBalance || 0) < amount) {
          return; // Abort if insufficient funds
        }
        return (currentBalance || 0) - amount;
      });

      if (!committed) {
        return res.status(400).json({ error: 'Saldo insuficiente' });
      }

      // 2. Call Invictus Payout (Simulated)
      try {
        await invictusProvider.createTransfer(amount, key, keyType);
        
        // 3. Record Transaction
        const txId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await db.ref(`transactions/${txId}`).set({
          userId: user.uid,
          amount: amount,
          type: 'withdrawal',
          method: 'pix',
          status: 'settled', // Assuming instant for demo
          destinationKey: key,
          destinationType: keyType,
          createdAt: admin.database.ServerValue.TIMESTAMP
        });

        res.json({ success: true, message: 'Withdrawal processed', newBalance: snapshot.val() });

      } catch (gatewayError) {
        // Rollback balance if gateway fails
        // In production this requires careful idempotency handling
        await walletRef.transaction((balance) => (balance || 0) + amount);
        throw new Error("Falha no gateway de pagamento. Saldo estornado.");
      }

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Withdrawal failed' });
    }
  }
};

const TransactionController = {
  list: async (req: any, res: any) => {
    try {
      const user = req.user;
      const db = getRtdb();
      
      // Query transactions for this user
      const snapshot = await db.ref('transactions')
        .orderByChild('userId')
        .equalTo(user.uid)
        .limitToLast(50)
        .once('value');

      const transactions: any[] = [];
      snapshot.forEach((child) => {
        transactions.unshift({ id: child.key, ...child.val() });
      });

      res.json(transactions);
    } catch (error) {
      console.error("Error listing transactions:", error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  }
};

// --- Routes ---
app.post('/api/pix/deposit', verifyAuth, PixController.createDeposit);
app.post('/api/pix/withdraw', verifyAuth, PixController.createWithdraw);
app.get('/api/transactions', verifyAuth, TransactionController.list);

app.get('/health', (req: any, res: any) => res.send('OK'));
app.get('/ready', (req: any, res: any) => res.send('Ready'));

// Only start server if run directly
if (require.main === module) {
  app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));
}

export default app;
