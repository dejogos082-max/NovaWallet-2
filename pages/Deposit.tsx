import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Copy, CheckCircle, AlertTriangle } from 'lucide-react';
import { CreatePixDepositResponse } from '../types';

export const Deposit: React.FC = () => {
  const { getToken } = useAuth();
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [depositData, setDepositData] = useState<CreatePixDepositResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      // Convert to cents
      const amountInCents = Math.round(parseFloat(amount.replace(',', '.')) * 100);
      if (isNaN(amountInCents) || amountInCents <= 0) {
        throw new Error('Valor inválido');
      }

      const data = await apiService.createPixDeposit(amountInCents, token);
      setDepositData(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar depósito. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (depositData?.pixPayload) {
      navigator.clipboard.writeText(depositData.pixPayload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-white">Depositar via PIX</h1>
        
        {!depositData ? (
          <Card>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Valor do depósito (R$)
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 sm:text-sm">R$</span>
                  </div>
                  <input
                    type="number"
                    name="amount"
                    id="amount"
                    className="focus:ring-brand-500 focus:border-brand-500 block w-full pl-10 pr-12 sm:text-lg bg-dark-bg border-dark-border text-white rounded-lg py-3"
                    placeholder="0,00"
                    step="0.01"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">Mínimo de R$ 1,00. Crédito em segundos.</p>
              </div>

              {error && (
                <div className="bg-red-900/20 border border-red-900/50 text-red-400 px-4 py-3 rounded-lg flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
              )}

              <Button type="submit" className="w-full py-4 text-lg shadow-[0_0_20px_rgba(16,185,129,0.2)]" isLoading={loading}>
                Gerar QR Code PIX
              </Button>
            </form>
          </Card>
        ) : (
          <Card className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mb-4 border border-green-500/20">
               <CheckCircle className="h-8 w-8" />
            </div>
            
            <h3 className="text-xl font-bold text-white">Pagamento Gerado!</h3>
            <p className="text-slate-400">Escaneie o QR Code abaixo ou use o Copia e Cola.</p>
            
            <div className="flex justify-center my-6">
                {/* Normally we'd render the QR code from the base64 string or URL provided by API */}
                {depositData.qrCode ? (
                    <img src={`data:image/png;base64,${depositData.qrCode}`} alt="Pix QR Code" className="border-4 border-white shadow-lg rounded-lg max-w-[200px]" />
                ) : (
                    <div className="w-48 h-48 bg-slate-800 flex items-center justify-center rounded text-xs text-slate-500">
                        QR Code Placeholder
                    </div>
                )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pix Copia e Cola</label>
              <div className="flex items-center space-x-2">
                <input 
                   readOnly 
                   value={depositData.pixPayload} 
                   className="w-full text-sm bg-dark-bg border border-dark-border rounded p-3 text-slate-300 font-mono truncate"
                />
                <Button variant="secondary" onClick={copyToClipboard} className="flex-shrink-0 bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
                  {copied ? <CheckCircle className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                </Button>
              </div>
            </div>

            <Button variant="ghost" onClick={() => setDepositData(null)} className="mt-4 text-slate-400 hover:text-white">
              Gerar novo depósito
            </Button>
          </Card>
        )}
      </div>
    </Layout>
  );
};
