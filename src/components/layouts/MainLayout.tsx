import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useStore();

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Algorix Invest Logo" className="h-12 w-auto object-contain" />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Recursos</a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Como Funciona</a>
            <a href="#performance" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Performance</a>
            <a href="#faq" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-4">
            {currentUser ? (
              <Button asChild variant="outline" className="border-white/10 hover:bg-white/5 rounded-full px-6">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" className="text-gray-400 hover:text-white hidden sm:flex">
                  <Link to="/login">Entrar</Link>
                </Button>
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                  <Link to="/register">Começar Agora</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="bg-[#080808] border-t border-white/5 py-20">
        <div className="max-w-7xl mx-auto px-6">

          {/* Badges */}
          <div className="flex flex-wrap gap-3 mb-14">
            {[
              '🇸🇬 Desenvolvido em Singapura',
              '🤖 IA Algorítmica Autônoma',
              '📈 20–30% ao mês em média',
              '🏦 Utilizado por grandes bancos',
              '🚫 Sem Martingale',
              '🔬 Fase de testes otimistas',
            ].map(badge => (
              <span key={badge} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400">
                {badge}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            {/* Brand */}
            <div className="col-span-1 md:col-span-1">
              <div className="mb-6">
                <img src="/logo.png" alt="Algorix Invest Logo" className="h-10 w-auto object-contain" />
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                Plataforma de inteligência algorítmica que gerencia operações automatizadas no mercado forex, com foco em eficiência, consistência e análise de dados em tempo real.
              </p>
            </div>

            {/* Plataforma */}
            <div>
              <h4 className="font-bold mb-6">Plataforma</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                <li><a href="#features" className="hover:text-blue-500 transition-colors">Recursos</a></li>
                <li><a href="#how-it-works" className="hover:text-blue-500 transition-colors">Como Funciona</a></li>
                <li><a href="#performance" className="hover:text-blue-500 transition-colors">Performance</a></li>
                <li><Link to="/register" className="hover:text-blue-500 transition-colors">Criar Conta</Link></li>
              </ul>
            </div>

            {/* Empresa */}
            <div>
              <h4 className="font-bold mb-6">Empresa</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                <li><a href="#faq" className="hover:text-blue-500 transition-colors">FAQ</a></li>
                <li><span className="text-gray-600">Singapura, SG</span></li>
                <li><span className="text-gray-600">Operações 24/5</span></li>
                <li><span className="text-gray-600">Suporte multilíngue</span></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold mb-6">Legal</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                <li><Link to="/termos" className="hover:text-blue-500 transition-colors">Termos de Uso</Link></li>
                <li><Link to="/privacidade" className="hover:text-blue-500 transition-colors">Política de Privacidade</Link></li>
                <li><Link to="/gestao-de-risco" className="hover:text-blue-500 transition-colors">Gestão de Risco</Link></li>
              </ul>
              <div className="mt-6 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
                <p className="text-xs text-yellow-600 leading-relaxed">
                  Operações no mercado financeiro envolvem riscos. Resultados passados não garantem retornos futuros.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-xs">
              © {new Date().getFullYear()} Algorix Invest. Todos os direitos reservados. Plataforma operada por Algorix Technologies Pte. Ltd. — Singapura.
            </p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs text-gray-600">Sistemas operacionais</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
