import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { ref, get, update } from 'firebase/database';
import { rtdb } from '../firebase';
import { UserProfile } from '../types';
import { User, Shield, MapPin, Phone, Mail, FileText, Save, Edit2, Loader2, CheckCircle } from 'lucide-react';

export const Profile: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    const fetchProfile = async () => {
      try {
        const userRef = ref(rtdb, `users/${currentUser.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          setProfile(snapshot.val());
        } else {
          // Init profile if not exists
          const initialData = {
            displayName: currentUser.displayName,
            email: currentUser.email,
            kycStatus: 'pending' as const,
            createdAt: Date.now()
          };
          setProfile(initialData);
        }
      } catch (error) {
        console.error("Error fetching profile", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSaving(true);
    setMessage(null);

    try {
      const updates: any = { ...profile };
      // Remove undefined
      Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);
      
      await update(ref(rtdb, `users/${currentUser.uid}`), updates);
      
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
      setIsEditing(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao salvar alterações.' });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
           <Loader2 className="animate-spin text-brand-500 w-8 h-8" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 bg-dark-card border border-dark-border p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 blur-3xl rounded-full pointer-events-none"></div>
          
          <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center border-4 border-dark-bg shadow-lg z-10">
             <span className="text-3xl font-bold text-brand-500">
               {profile.displayName ? profile.displayName[0].toUpperCase() : 'U'}
             </span>
          </div>
          
          <div className="flex-1 text-center md:text-left z-10">
             <h1 className="text-2xl font-bold text-white">{profile.displayName || 'Usuário'}</h1>
             <p className="text-slate-400 flex items-center justify-center md:justify-start gap-2 mt-1">
               <Mail className="w-4 h-4" /> {currentUser?.email}
             </p>
             <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-3">
               <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                 profile.kycStatus === 'verified' 
                   ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                   : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
               }`}>
                 KYC: {profile.kycStatus === 'verified' ? 'Verificado' : 'Pendente'}
               </span>
               <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20">
                 Conta Digital
               </span>
             </div>
          </div>

          <Button 
            variant="secondary" 
            onClick={() => setIsEditing(!isEditing)}
            className="z-10 bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
          >
             {isEditing ? 'Cancelar' : <><Edit2 className="w-4 h-4 mr-2" /> Editar</>}
          </Button>
        </div>

        {message && (
          <div className={`p-4 rounded-xl border ${message.type === 'success' ? 'bg-green-900/20 border-green-800 text-green-400' : 'bg-red-900/20 border-red-800 text-red-400'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <Card title="Dados Pessoais">
              <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Nome Completo</label>
                    <div className="relative">
                       <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                       <input 
                         type="text" 
                         name="displayName"
                         value={profile.displayName || ''}
                         onChange={handleChange}
                         disabled={!isEditing}
                         className="w-full bg-dark-bg border border-dark-border rounded-lg py-2.5 pl-10 pr-4 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                       />
                    </div>
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">CPF</label>
                    <div className="relative">
                       <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                       <input 
                         type="text" 
                         name="cpf"
                         value={profile.cpf || ''}
                         onChange={handleChange}
                         disabled={!isEditing}
                         placeholder="000.000.000-00"
                         className="w-full bg-dark-bg border border-dark-border rounded-lg py-2.5 pl-10 pr-4 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                       />
                    </div>
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Telefone</label>
                    <div className="relative">
                       <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                       <input 
                         type="tel" 
                         name="phone"
                         value={profile.phone || ''}
                         onChange={handleChange}
                         disabled={!isEditing}
                         placeholder="(00) 00000-0000"
                         className="w-full bg-dark-bg border border-dark-border rounded-lg py-2.5 pl-10 pr-4 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                       />
                    </div>
                 </div>
              </div>
           </Card>

           <Card title="Endereço">
              <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Rua / Número</label>
                    <div className="relative">
                       <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                       <input 
                         type="text" 
                         name="address"
                         value={profile.address || ''}
                         onChange={handleChange}
                         disabled={!isEditing}
                         className="w-full bg-dark-bg border border-dark-border rounded-lg py-2.5 pl-10 pr-4 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Cidade</label>
                      <input 
                        type="text" 
                        name="city"
                        value={profile.city || ''}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full bg-dark-bg border border-dark-border rounded-lg py-2.5 px-4 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">CEP</label>
                      <input 
                        type="text" 
                        name="zipCode"
                        value={profile.zipCode || ''}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full bg-dark-bg border border-dark-border rounded-lg py-2.5 px-4 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      />
                   </div>
                 </div>
              </div>
           </Card>

           {isEditing && (
             <div className="md:col-span-2 flex justify-end">
               <Button type="submit" isLoading={saving} className="px-8 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                 <Save className="w-4 h-4 mr-2" /> Salvar Alterações
               </Button>
             </div>
           )}
        </form>

        <Card className="border-l-4 border-l-brand-500">
           <div className="flex items-start gap-4">
              <div className="p-3 bg-brand-500/10 rounded-lg">
                <Shield className="w-6 h-6 text-brand-500" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Segurança da Conta</h3>
                <p className="text-slate-400 text-sm mt-1">
                  Seus dados são criptografados e armazenados com segurança. 
                  A validação KYC é necessária para aumentar seus limites de transação.
                </p>
                {profile.kycStatus !== 'verified' && (
                  <button className="mt-3 text-sm text-brand-400 font-semibold hover:text-brand-300 underline">
                    Solicitar Verificação de Documentos
                  </button>
                )}
              </div>
           </div>
        </Card>
      </div>
    </Layout>
  );
};
