import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ReCaptcha } from '../components/ReCaptcha';
import { Wallet, AlertCircle } from 'lucide-react';
import { RECAPTCHA_SITE_KEY } from '../constants';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaToken) {
      setError('Por favor, complete a verificação de segurança.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError('Falha no login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl"></div>
         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-500 mb-4 border border-brand-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <Wallet className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">NovaWallet</h1>
          <p className="text-slate-400 mt-2">Segurança institucional para seus ativos.</p>
        </div>

        <Card className="backdrop-blur-sm bg-dark-card/90">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-900/20 border border-red-900/50 text-red-400 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg bg-dark-bg border-dark-border text-white shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 py-3 px-4 border transition-colors"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg bg-dark-bg border-dark-border text-white shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 py-3 px-4 border transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            <ReCaptcha 
              siteKey={RECAPTCHA_SITE_KEY} 
              onVerify={(token) => setCaptchaToken(token)} 
            />

            <Button type="submit" className="w-full py-3 text-base shadow-[0_0_15px_rgba(16,185,129,0.2)]" isLoading={loading}>
              Acessar Conta
            </Button>

            <div className="text-center text-sm text-slate-400 mt-4">
              Não tem uma conta? <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">Cadastre-se</Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
