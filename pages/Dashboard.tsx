import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../firebase';
import { TrendingUp, ArrowDownLeft, ArrowUpRight, MoreHorizontal, ShieldCheck, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Listen to realtime database for wallet balance
  useEffect(() => {
    if (!currentUser) return;
    
    // In a real app, ensure security rules protect this path
    const walletRef = ref(rtdb, `wallets/${currentUser.uid}/balance`);
    const unsubscribe = onValue(walletRef, (snapshot) => {
      const val = snapshot.val();
      setBalance(val || 0);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Mock data for chart
  const data = [
    { name: 'Seg', amount: 3500 },
    { name: 'Ter', amount: 3000 },
    { name: 'Qua', amount: 2000 },
    { name: 'Qui', amount: 2780 },
    { name: 'Sex', amount: 1890 },
    { name: 'Sáb', amount: 2390 },
    { name: 'Dom', amount: balance / 100 },
  ];

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Olá, {currentUser?.displayName?.split(' ')[0] || 'Usuário'}</h1>
            <p className="text-slate-400">Bem-vindo de volta à sua NovaWallet.</p>
          </div>
          <div className="flex items-center space-x-2 text-xs bg-brand-900/30 text-brand-400 px-3 py-1.5 rounded-full border border-brand-500/20 w-fit shadow-[0_0_10px_rgba(16,185,129,0.1)]">
            <ShieldCheck className="w-3 h-3" />
            <span className="font-semibold">Ambiente Seguro</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Balance Card - Dark Gradient */}
          <div className="relative overflow-hidden bg-gradient-to-br from-brand-900 to-slate-900 rounded-2xl p-8 text-white shadow-2xl shadow-brand-900/10 col-span-1 md:col-span-2 group border border-brand-500/20">
            {/* Background effects */}
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-brand-500 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse"></div>
            
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-brand-100/70 font-medium mb-1 flex items-center gap-2">
                    <Wallet className="w-4 h-4" /> Saldo Disponível
                  </p>
                  <h2 className="text-5xl font-bold tracking-tighter mt-2 text-white drop-shadow-md">
                    {loading ? (
                      <span className="animate-pulse bg-white/20 h-12 w-32 rounded block"></span>
                    ) : (
                      formatCurrency(balance)
                    )}
                  </h2>
                </div>
                <div className="bg-white/5 p-2 rounded-lg backdrop-blur-sm border border-white/10 hover:bg-white/10 cursor-pointer transition">
                  <MoreHorizontal className="text-white w-6 h-6" />
                </div>
              </div>
              
              <div className="mt-10 grid grid-cols-2 gap-4">
                <Link to="/deposit" className="group/btn relative overflow-hidden bg-brand-500 text-white hover:bg-brand-400 rounded-xl p-4 flex items-center justify-center space-x-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  <div className="bg-white/20 p-1.5 rounded-full">
                    <ArrowDownLeft className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-semibold">Depositar</span>
                </Link>
                <Link to="/withdraw" className="group/btn relative overflow-hidden bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl p-4 flex items-center justify-center space-x-2 transition-all">
                  <div className="bg-white/10 p-1.5 rounded-full">
                    <ArrowUpRight className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-semibold">Sacar</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <Card className="col-span-1 border-t-4 border-t-brand-500">
             <div className="flex justify-between items-start mb-4">
               <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Rendimento</h3>
               <span className="text-xs bg-brand-500/10 text-brand-400 px-2 py-0.5 rounded font-medium border border-brand-500/20">Hoje</span>
             </div>
             
             <div className="flex items-baseline space-x-1 mt-2">
               <span className="text-3xl font-bold text-white">102%</span>
               <span className="text-sm text-slate-400 font-medium">do CDI</span>
             </div>

             <div className="mt-6 flex items-center space-x-3 text-brand-400 bg-brand-900/20 p-3 rounded-lg border border-brand-500/20">
               <TrendingUp className="h-5 w-5" />
               <span className="text-sm font-semibold">Seu dinheiro está rendendo</span>
             </div>
             <p className="text-xs text-slate-500 mt-3 leading-relaxed">
               O saldo da sua conta rende automaticamente todo dia útil, mais que a poupança.
             </p>
          </Card>
        </div>

        {/* Chart Section */}
        <Card title="Fluxo de Caixa" className="overflow-hidden">
          <div className="h-72 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12}} 
                  tickFormatter={(val) => `R$${val}`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px', 
                    border: '1px solid #1e293b', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                    padding: '12px',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#10b981' }}
                  labelStyle={{ color: '#94a3b8' }}
                  formatter={(val: number) => [`R$ ${val.toFixed(2)}`, 'Saldo']}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorAmt)" 
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#34d399' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </Layout>
  );
};
