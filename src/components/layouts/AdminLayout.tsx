import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Users,
  ShieldAlert,
  BarChart3,
  Settings,
  LogOut,
  ArrowLeft,
  Menu,
  X,
  Wallet,
  Share2,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { currentUser } = useStore();
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const menuItems = [
    { icon: ShieldAlert, label: 'Visão Geral', path: '/admin' },
    { icon: Users, label: 'Gerenciar Usuários', path: '/admin/users' },
    { icon: Wallet, label: 'Saques', path: '/admin/withdrawals' },
    { icon: Share2, label: 'Algorix Network', path: '/admin/network' },
    { icon: BarChart3, label: 'Relatórios', path: '/admin/reports' },
    { icon: Settings, label: 'Configurações Sistema', path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-72 border-r border-white/10 bg-[#080808] p-8">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)]">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h2 className="font-bold text-lg leading-none">Algorix Invest</h2>
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Admin Panel</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] mb-4 px-4">Menu Principal</p>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group",
                location.pathname === item.path 
                  ? "bg-blue-600 text-white shadow-[0_10px_20px_rgba(37,99,235,0.2)]" 
                  : "text-gray-500 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon size={20} />
              <span className="font-semibold text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-white/5">
          <Button 
            asChild
            variant="ghost" 
            className="w-full justify-start gap-3 text-gray-400 hover:text-white mb-4 rounded-xl"
          >
            <Link to="/dashboard">
              <ArrowLeft size={18} />
              Visão do Usuário
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Encerrar Sessão
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-20 bg-[#080808] border-b border-white/10 flex items-center justify-between px-8 z-50">
        <div className="flex items-center gap-3">
          <ShieldAlert className="text-blue-500" />
          <span className="font-bold">Admin Panel</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-white/5 rounded-lg">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/95 z-40 pt-24 px-8">
          <nav className="space-y-4">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-4 p-5 rounded-2xl",
                  location.pathname === item.path ? "bg-blue-600 text-white" : "bg-white/5 text-gray-400"
                )}
              >
                <item.icon size={24} />
                <span className="text-lg font-bold">{item.label}</span>
              </Link>
            ))}
            <div className="pt-8 space-y-4">
              <Link to="/dashboard" className="flex items-center gap-4 p-5 text-gray-400">
                <ArrowLeft size={24} />
                <span>Visão do Usuário</span>
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-4 p-5 text-red-400 w-full">
                <LogOut size={24} />
                <span className="font-bold">Sair</span>
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-8 md:p-12 pt-28 md:pt-12 overflow-y-auto bg-[#050505]">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};