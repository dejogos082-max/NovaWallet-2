import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Transaction } from '../types';
import { ArrowDownLeft, ArrowUpRight, Clock, CheckCircle, XCircle } from 'lucide-react';

export const History: React.FC = () => {
  const { getToken } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = await getToken();
        if (token) {
          const data = await apiService.getTransactions(token);
          setTransactions(data);
        }
      } catch (error) {
        console.error("Error fetching transactions", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [getToken]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
      case 'settled': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
      case 'created': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'deposit' 
      ? <div className="p-2 bg-green-500/10 rounded-full text-green-500 border border-green-500/20"><ArrowDownLeft className="h-4 w-4" /></div>
      : <div className="p-2 bg-red-500/10 rounded-full text-red-500 border border-red-500/20"><ArrowUpRight className="h-4 w-4" /></div>;
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Extrato</h1>
        <Card>
          {loading ? (
             <div className="text-center py-8 text-slate-500">Carregando transações...</div>
          ) : transactions.length === 0 ? (
             <div className="text-center py-8 text-slate-500">Nenhuma transação encontrada.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-dark-border text-slate-500 text-sm">
                    <th className="pb-3 font-medium">Tipo</th>
                    <th className="pb-3 font-medium">Data</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="group hover:bg-white/5 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center space-x-3">
                          {getTypeIcon(tx.type)}
                          <span className="font-medium text-slate-300 capitalize">{tx.type === 'deposit' ? 'Depósito Pix' : 'Transferência'}</span>
                        </div>
                      </td>
                      <td className="py-4 text-sm text-slate-500">{formatDate(tx.createdAt)}</td>
                      <td className="py-4">
                        <div className="flex items-center space-x-1.5 text-sm">
                          {getStatusIcon(tx.status)}
                          <span className="capitalize text-slate-400">{tx.status}</span>
                        </div>
                      </td>
                      <td className={`py-4 text-right font-medium ${tx.type === 'deposit' ? 'text-green-400' : 'text-slate-200'}`}>
                        {tx.type === 'deposit' ? '+' : '-'} {formatCurrency(tx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};
