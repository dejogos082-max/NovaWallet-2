export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  kycStatus: 'pending' | 'verified' | 'rejected' | 'none';
  createdAt: number;
  // New fields
  phone?: string;
  cpf?: string;
  address?: string;
  city?: string;
  zipCode?: string;
}

export interface Wallet {
  uid: string;
  balance: number; // in cents
  currency: string;
  updatedAt: number;
}

export type TransactionStatus = 'created' | 'pending' | 'paid' | 'settled' | 'canceled' | 'expired' | 'failed';

export interface Transaction {
  id: string; // Internal ID
  invictusId?: string; // External ID
  userId: string;
  amount: number; // in cents
  type: 'deposit' | 'transfer' | 'withdrawal';
  method: 'pix' | 'internal';
  status: TransactionStatus;
  description?: string;
  pixQrCode?: string;
  pixCopyPaste?: string;
  expiresAt?: number;
  createdAt: number;
  updatedAt: number;
  hash?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CreatePixDepositResponse {
  transactionId: string;
  hash: string;
  status: TransactionStatus;
  qrCode: string;
  pixPayload: string;
  expiresAt: string;
}

// ReCaptcha Window Extension
declare global {
  interface Window {
    grecaptcha: any;
  }
}