import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../firebase';
import { ArrowUpRight, ShieldAlert, BadgeCheck, Building2, User } from 'lucide-react';

type PixKeyType = 'cpf' | 'email' | 'phone' | 'random' | 'cnpj';

export const Withdraw: React.FC = () => {
  const { currentUser, getToken } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  
  const [amount, setAmount] = useState<string>('');
  const [pixKeyType, setPixKeyType] = useState<PixKeyType>('cpf');
  const [pixKey, setPixKey] = useState<string>('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch balance for validation
  useEffect(() => {
    if (!currentUser) return;
    const walletRef = ref(rtdb, `wallets/${currentUser.uid}/balance`);
    const unsubscribe = onValue(walletRef, (snapshot) => {
      setBalance(snapshot.val() || 0);
    });
    return () => unsubscribe();
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const token = await getToken();
      if (!token) throw new Error('Autenticação expirada');

      const amountCents = Math.round(parseFloat(amount.replace(',', '.')) * 100);

      if (isNaN(amountCents) || amountCents <= 0) {
        throw new Error('Valor inválido para saque.');
      }

      if (amountCents > balance) {
        throw new Error('Saldo insuficiente.');
      }

      if (pixKey.length < 5) {
        throw new Error('Chave PIX inválida.');
      }

      // Call API
      await apiService.createWithdrawal({
        amount: amountCents,
        keyType: pixKeyType,
        key: pixKey
      }, token);

      setSuccess(true);
      setAmount('');
      setPixKey('');
    } catch (err: any) {
      setError(err.message || 'Erro ao processar saque. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const pixTypes: {id: PixKeyType, label: string}[] = [
    { id: 'cpf', label: 'CPF' },
    { id: 'cnpj', label: 'CNPJ' },
    { id: 'email', label: 'E-mail' },
    { id: 'phone', label: 'Celular' },
    { id: 'random', label: 'Chave Aleatória' },
  ];

  if (success) {
    return (
      <Layout>
         <div className="max-w-xl mx-auto pt-12">
            <Card className="text-center p-12">
               <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                 <BadgeCheck className="w-10 h-10 text-green-500" />
               </div>
               <h2 className="text-2xl font-bold text-white mb-2">Saque Solicitado!</h2>
               <p className="text-slate-400 mb-8">
                 Sua transferência PIX está sendo processada e deve chegar na conta de destino em instantes.
               </p>
               <Button onClick={() => setSuccess(false)} className="w-full shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                 Realizar novo saque
               </Button>
            </Card>
         </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
           <h1 className="text-2xl font-bold text-white flex items-center gap-2">
             <div className="p-2 bg-brand-900/50 border border-brand-500/20 rounded-lg">
                <ArrowUpRight className="w-6 h-6 text-brand-500" />
             </div>
             Realizar Saque (PIX)
           </h1>
           <p className="text-slate-400 mt-2 ml-12">Transfira dinheiro da sua carteira para qualquer conta via PIX.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-900/20 border border-red-900/50 text-red-400 px-4 py-3 rounded-xl flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Valor do Saque</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-slate-500 font-semibold">R$</span>
                    </div>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0,00"
                      step="0.01"
                      className="block w-full pl-12 pr-4 py-4 bg-dark-bg border border-dark-border rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-lg font-medium transition-all text-white placeholder-slate-600"
                      required
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs">
                     <span className="text-slate-500">Saldo disponível:</span>
                     <span className="font-bold text-brand-400">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balance / 100)}
                     </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-400">Tipo de Chave</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {pixTypes.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setPixKeyType(type.id)}
                        className={`py-2.5 px-3 text-sm font-medium rounded-lg border transition-all ${
                          pixKeyType === type.id
                            ? 'bg-brand-500/10 border-brand-500/30 text-brand-400 shadow-sm'
                            : 'bg-dark-bg border-dark-border text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Chave PIX</label>
                  <input
                    type="text"
                    value={pixKey}
                    onChange={(e) => setPixKey(e.target.value)}
                    placeholder={`Digite seu ${pixTypes.find(t => t.id === pixKeyType)?.label}`}
                    className="block w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-white placeholder-slate-600"
                    required
                  />
                </div>

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full py-4 text-lg font-semibold shadow-[0_0_20px_rgba(16,185,129,0.2)]" 
                    isLoading={loading}
                    disabled={balance <= 0}
                  >
                    Confirmar Saque
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          <div className="space-y-6">
             <Card title="Resumo" className="bg-dark-card border-dark-border">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Valor</span>
                    <span className="font-medium text-slate-200">
                       {amount ? `R$ ${amount}` : '--'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Taxa</span>
                    <span className="font-medium text-brand-400">Grátis</span>
                  </div>
                  <div className="h-px bg-slate-800 my-2" />
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-300">Total</span>
                    <span className="font-bold text-lg text-white">
                       {amount ? `R$ ${amount}` : '--'}
                    </span>
                  </div>
                </div>
             </Card>

             <div className="bg-brand-900/20 rounded-xl p-5 border border-brand-500/20">
                <div className="flex items-start gap-3">
                   <div className="p-2 bg-brand-500/10 rounded-lg text-brand-500">
                      <Building2 className="w-5 h-5" />
                   </div>
                   <div>
                      <h4 className="font-semibold text-brand-100 text-sm">Transferência Segura</h4>
                      <p className="text-xs text-brand-200/70 mt-1 leading-relaxed">
                        Suas transações são protegidas e processadas instantaneamente pelo sistema PIX do Banco Central.
                      </p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
