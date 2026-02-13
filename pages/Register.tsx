import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, rtdb } from '../firebase';
import { ref, set } from 'firebase/database';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ReCaptcha } from '../components/ReCaptcha';
import { Wallet, AlertCircle } from 'lucide-react';
import { RECAPTCHA_SITE_KEY } from '../constants';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaToken) {
      setError('Complete o ReCaptcha.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await updateProfile(user, { displayName: name });
      
      // Initialize wallet in RTDB
      await set(ref(rtdb, 'wallets/' + user.uid), {
        balance: 0,
        currency: 'BRL',
        updatedAt: Date.now()
      });

      // Initialize user profile in RTDB (or Firestore)
      await set(ref(rtdb, 'users/' + user.uid), {
        email: user.email,
        displayName: name,
        kycStatus: 'pending',
        createdAt: Date.now()
      });

      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError('Erro ao criar conta: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4 relative overflow-hidden">
       {/* Background Decor */}
       <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
         <div className="absolute bottom-1/3 left-1/3 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-500 mb-4 border border-brand-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <Wallet className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-white">Crie sua conta</h1>
        </div>

        <Card className="backdrop-blur-sm bg-dark-card/90">
          <form onSubmit={handleRegister} className="space-y-4">
             {error && (
              <div className="p-3 bg-red-900/20 border border-red-900/50 text-red-400 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nome Completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg bg-dark-bg border-dark-border text-white shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 py-2.5 px-3 border transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg bg-dark-bg border-dark-border text-white shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 py-2.5 px-3 border transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg bg-dark-bg border-dark-border text-white shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 py-2.5 px-3 border transition-colors"
                required
                minLength={6}
              />
            </div>

            <ReCaptcha 
              siteKey={RECAPTCHA_SITE_KEY} 
              onVerify={(token) => setCaptchaToken(token)} 
            />

            <Button type="submit" className="w-full py-2.5 shadow-[0_0_15px_rgba(16,185,129,0.2)]" isLoading={loading}>
              Cadastrar
            </Button>

            <div className="text-center text-sm text-slate-400 mt-4">
              Já tem uma conta? <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Entrar</Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
