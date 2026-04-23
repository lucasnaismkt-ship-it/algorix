import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  History,
  User as UserIcon,
  Settings,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  FileText,
  Wallet,
  TrendingUp,
  RefreshCw,
  HeadphonesIcon,
  Share2,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const FloatingRateWidget = () => {
  const { fetchConversionRate } = useStore();
  const [visible, setVisible] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [rate, setRate] = React.useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null);

  const fetchRate = React.useCallback(async () => {
    try {
      const res = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL');
      const data = await res.json();
      const value = parseFloat(data?.USDBRL?.bid);
      if (value > 0) {
        setRate(value);
        setLastUpdated(new Date());
        fetchConversionRate(); // sync store too
      }
    } catch {
      // keep previous value
    }
  }, [fetchConversionRate]);

  React.useEffect(() => {
    fetchRate();
    const interval = setInterval(fetchRate, 5 * 60 * 1000); // every 5 min
    return () => clearInterval(interval);
  }, [fetchRate]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRate();
    setTimeout(() => setRefreshing(false), 600);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 p-4 min-w-[220px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", rate ? "bg-green-500 animate-pulse" : "bg-yellow-500 animate-pulse")} />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Câmbio ao Vivo</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleRefresh}
              className="p-1 text-gray-600 hover:text-gray-300 transition-colors"
              title="Atualizar"
            >
              <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => setVisible(false)}
              className="p-1 text-gray-600 hover:text-gray-300 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Rate */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <TrendingUp size={18} className="text-blue-400" />
          </div>
          <div>
            {rate ? (
              <>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs text-gray-500 font-medium">1 USD</span>
                  <span className="text-gray-600">=</span>
                  <span className="text-lg font-black text-white">
                    R$ {rate.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                {lastUpdated && (
                  <p className="text-[10px] text-gray-600 mt-0.5">
                    Atualizado {lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2">
                <RefreshCw size={14} className="animate-spin text-gray-500" />
                <span className="text-sm text-gray-500">Carregando...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
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
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: FileText, label: 'Relatórios', path: '/dashboard/reports' },
    { icon: History, label: 'Operações', path: '/dashboard/operations' },
    { icon: Wallet, label: 'Carteira', path: '/dashboard/wallet' },
    { icon: Share2, label: 'Algorix Network', path: '/dashboard/network' },
    { icon: UserIcon, label: 'Perfil', path: '/dashboard/profile' },
    { icon: HeadphonesIcon, label: 'Suporte', path: '/dashboard/support' },
    { icon: Settings, label: 'Configurações', path: '/dashboard/settings' },
  ];

  if (currentUser?.role === 'ADMIN') {
    menuItems.push({ icon: ShieldCheck, label: 'Admin', path: '/admin' });
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/10 bg-[#0d0d0d] p-6">
        <div className="flex items-center mb-10">
          <img src="/logo.png" alt="Algorix Invest Logo" className="w-full max-w-[176px] h-auto object-contain" />
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                location.pathname === item.path 
                  ? "bg-blue-600/10 text-blue-500 border border-blue-600/20" 
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon size={20} className={cn(
                "transition-colors",
                location.pathname === item.path ? "text-blue-500" : "group-hover:text-white"
              )} />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold">
              {(currentUser?.name || 'U').charAt(0)}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold truncate">{currentUser?.name || 'Usuário'}</span>
              <span className="text-xs text-gray-500 truncate">{currentUser?.email}</span>
            </div>
          </div>

          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-400/10"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            Sair
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0d0d0d] border-b border-white/10 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Algorix Invest Logo" className="h-8 w-auto object-contain" />
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/90 z-40 pt-20 px-6">
          <nav className="space-y-4">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl",
                  location.pathname === item.path ? "bg-blue-600 text-white" : "text-gray-400"
                )}
              >
                <item.icon size={24} />
                <span className="text-lg font-medium">{item.label}</span>
              </Link>
            ))}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-4 p-4 rounded-xl text-red-400 w-full"
            >
              <LogOut size={24} />
              <span className="text-lg font-medium">Sair</span>
            </button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 pt-24 md:pt-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      <FloatingRateWidget />
    </div>
  );
};