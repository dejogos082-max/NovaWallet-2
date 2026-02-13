import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  User, 
  LogOut,
  Wallet,
  Menu,
  X
} from 'lucide-react';
import { auth } from '../firebase';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Visão Geral', path: '/dashboard' },
    { icon: ArrowDownLeft, label: 'Depositar', path: '/deposit' },
    { icon: ArrowUpRight, label: 'Sacar', path: '/withdraw' },
    { icon: History, label: 'Extrato', path: '/history' },
    { icon: User, label: 'Perfil', path: '/profile' },
  ];

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col md:flex-row font-sans selection:bg-brand-500 selection:text-white">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-dark-card border-r border-dark-border h-screen sticky top-0 z-20">
        <div className="p-8 flex items-center space-x-3">
          <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">NovaWallet</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Menu Principal</p>
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                  isActive
                    ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-brand-400' : 'text-slate-500 group-hover:text-white'}`} />
                <span className="font-medium z-10">{item.label}</span>
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500" />}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-dark-border bg-black/20">
          <div className="flex items-center space-x-3 px-4 py-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-brand-900/50 border border-brand-500/30 flex items-center justify-center">
              <span className="text-sm font-bold text-brand-400">{currentUser?.email?.[0].toUpperCase()}</span>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{currentUser?.displayName || 'Usuário'}</p>
              <p className="text-xs text-slate-500 truncate">{currentUser?.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded-lg transition-colors border border-transparent hover:border-red-900/30"
          >
            <LogOut className="h-4 w-4" />
            <span>Sair da conta</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-dark-card border-b border-dark-border text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
             <Wallet className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg">NovaWallet</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-400">
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-dark-bg pt-20 px-4">
           <nav className="space-y-2">
            {menuItems.map((item) => (
               <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-4 rounded-xl border ${
                   pathname === item.path ? 'bg-brand-500/10 border-brand-500/20 text-brand-400' : 'border-transparent text-slate-400'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
            <button 
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-4 mt-4 text-red-400 rounded-xl border border-red-900/20 bg-red-950/10"
            >
              <LogOut className="h-5 w-5" />
              <span>Sair</span>
            </button>
           </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8 bg-dark-bg text-slate-200">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
