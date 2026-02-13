import { CreatePixDepositResponse, ApiResponse, Transaction } from '../types';

// In a real scenario, this points to your Node.js/Firebase Functions backend
// For this standalone demo, we default to a local path which would need a proxy or local server.
const API_BASE_URL = '/api';

class ApiService {
  private async getHeaders(token: string | null) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async createPixDeposit(amount: number, token: string): Promise<CreatePixDepositResponse> {
    const response = await fetch(`${API_BASE_URL}/pix/deposit`, {
      method: 'POST',
      headers: await this.getHeaders(token),
      body: JSON.stringify({ amount }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create deposit');
    }

    const data = await response.json();
    return data;
  }

  async createWithdrawal(payload: { amount: number, keyType: string, key: string }, token: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/pix/withdraw`, {
      method: 'POST',
      headers: await this.getHeaders(token),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Falha ao processar saque');
    }

    return await response.json();
  }

  async getTransactions(token: string): Promise<Transaction[]> {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'GET',
      headers: await this.getHeaders(token),
    });

    if (!response.ok) {
      // Fallback for demo if backend isn't running
      console.warn("Backend unreachable, returning empty list for demo");
      return []; 
    }

    return await response.json();
  }

  async getTransaction(hash: string, token: string): Promise<Transaction> {
    const response = await fetch(`${API_BASE_URL}/transactions/${hash}`, {
      method: 'GET',
      headers: await this.getHeaders(token),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch transaction');
    }

    return await response.json();
  }
}

export const apiService = new ApiService();
