import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  BarChart3, 
  Shield, 
  Zap, 
  Globe, 
  TrendingUp, 
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-widest uppercase mb-8">
              <Zap size={14} /> Forex Futures Trading
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-8 bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent leading-[1.1]">
              Invista com inteligência <br className="hidden md:block" /> em Forex Futures.
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
              Nossa IA opera contratos de futuros Forex 24 horas, aproveitando oportunidades em mercados globais. Maximize seus retornos com trading automatizado.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-10 h-14 text-lg font-semibold shadow-[0_0_30px_rgba(37,99,235,0.4)]">
                <Link to="/register">Começar a Investir <ArrowRight className="ml-2" size={20} /></Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="text-white border border-white/10 hover:bg-white/5 rounded-full px-10 h-14 text-lg font-semibold">
                <a href="#performance">Ver Resultados</a>
              </Button>
            </div>

          </motion.div>

          {/* Hero Image/Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-20 relative"
          >
            <div className="relative mx-auto max-w-5xl rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur-sm">
              <div className="rounded-xl overflow-hidden border border-white/10 bg-[#0a0a0a]">
                <img 
                  src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=2000" 
                  alt="Forex Market Trading" 
                  className="w-full h-auto opacity-80"
                />
              </div>
              {/* Floating elements */}
              <div className="absolute -top-6 -right-6 bg-blue-600 p-4 rounded-2xl shadow-2xl hidden md:block">
                <TrendingUp size={32} className="text-white" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-[#111] border border-white/10 p-6 rounded-2xl shadow-2xl hidden md:block">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">Status do Sistema</p>
                    <p className="text-sm font-bold">Trading Ativo 24/7</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-[#080808]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Tecnologia de Forex Futures</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Nossa IA opera contratos de futuros Forex em múltiplas bolsas, identificando as melhores oportunidades de trading 24 horas por dia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Globe,
                title: "Mercados Globais",
                desc: "Acesso a contratos de futuros em CME, EUREX e outras principais bolsas internacionais."
              },
              {
                icon: Zap,
                title: "Execução Precisa",
                desc: "Trading automatizado com latência ultrabaixa para aproveitar movimentos do mercado em tempo real."
              },
              {
                icon: Shield,
                title: "Gestão de Risco",
                desc: "Algoritmos avançados de gerenciamento de risco com stop-loss automático e position sizing."
              }
            ].map((feature, i) => (
              <div key={i} className="group p-8 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300">
                <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="text-blue-500" size={28} />
                </div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-20 items-center">
            <div className="flex-1">
              <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
                Como funciona nosso <br /> Forex Futures?
              </h2>
              <div className="space-y-8">
                {[
                  { step: "01", title: "Abra sua conta", desc: "Cadastre-se e deposite seu capital através dos métodos seguros disponíveis na plataforma." },
                  { step: "02", title: "IA opera futuros", desc: "Nossa inteligência artificial analisa e opera contratos de futuros Forex 24 horas nas principais bolsas." },
                  { step: "03", title: "Retornos consistentes", desc: "Acompanhe seus lucros em tempo real enquanto nossa IA maximiza oportunidades no mercado." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6">
                    <span className="text-blue-600 font-black text-2xl opacity-50">{item.step}</span>
                    <div>
                      <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                      <p className="text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 flex items-center justify-center p-12">
                <div className="w-full h-full bg-[#0d0d0d] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono">ALGORIX_INVEST_FUTURES_V2.0</span>
                    </div>
                    <div className="flex-1 p-6 font-mono text-xs text-blue-400 space-y-2">
  
                    <p>{">"} Initializing Forex futures engine...</p>
                    <p className="text-green-500">{">"} Connected to CME, EUREX, SGX exchanges.</p>
                    <p>{">"} Monitoring EUR/USD, GBP/USD, USD/JPY futures...</p>
                    <p className="text-yellow-500">{">"} Opportunity: EUR/USD Mar 25 spread detected</p>
                    <p>{">"} Executing futures contract...</p>
                    <p className="text-blue-500 font-bold">{">"} Profit: +$385.00 (0.67%)</p>
                    <div className="pt-4">
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="w-2/3 h-full bg-blue-600 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Performance Section */}
      <section id="performance" className="py-32 bg-[#080808]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-[40px] p-12 md:p-20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 -skew-x-12 translate-x-1/2"></div>
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Performance em Futures.</h2>
                <p className="text-blue-100 text-lg mb-10 opacity-80">
                  Nossos investidores alcançam retornos excepcionais através de trading automatizado de Forex Futures.
                </p>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-4xl font-black text-white mb-1">22.4%</p>
                    <p className="text-blue-200 text-sm">Retorno Mensal Médio</p>
                  </div>
                  <div>
                    <p className="text-4xl font-black text-white mb-1">94.3%</p>
                    <p className="text-blue-200 text-sm">Taxa de Acerto</p>
                  </div>
                </div>
              </div>
              <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-3xl p-8">
                <div className="flex items-center justify-between mb-8">
                  <span className="font-bold">Performance em Futures</span>
                  <span className="text-green-400 text-sm font-bold">+418% (12 meses)</span>
                </div>
                <div className="h-48 flex items-end gap-2">
                  {[40, 60, 45, 70, 55, 90, 80, 100].map((h, i) => (
                    <div 
                      key={i} 
                      className="flex-1 bg-blue-500/40 rounded-t-lg hover:bg-blue-400 transition-all cursor-pointer"
                      style={{ height: `${h}%` }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-32">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center">Perguntas Frequentes</h2>
          <div className="space-y-4">
            {[
              { q: "O que são Forex Futures?", a: "Forex Futures são contratos para compra ou venda de moedas em data futura, negociados em bolsas como CME e EUREX, permitindo alavancagem e liquidez." },
              { q: "Como a IA opera os contratos?", a: "Nossa inteligência artificial analisa padrões do mercado em tempo real e executa ordens automaticamente nas principais bolsas de futuros." },
              { q: "Qual é o retorno médio?", a: "Nossos investidores alcançam em média 22.4% ao mês, com taxa de acerto de 94.3% nas operações de Forex Futures." },
              { q: "É seguro investir em futuros?", a: "Sim, utilizamos gerenciamento de risco avançado, stop-loss automático e operamos apenas com bolsas regulamentadas." }
            ].map((item, i) => (

              <div key={i} className="border border-white/5 bg-white/[0.02] rounded-2xl p-6">
                <button className="w-full flex items-center justify-between text-left group">
                  <span className="text-lg font-bold group-hover:text-blue-500 transition-colors">{item.q}</span>
                  <ChevronDown className="text-gray-500" />
                </button>
                <p className="mt-4 text-gray-500 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/5 -z-10"></div>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-8">Pronto para operar?</h2>
          <p className="text-gray-400 text-xl mb-12 max-w-2xl mx-auto">
            Junte-se a centenas de investidores e comece a operar Forex Futures com nossa IA hoje mesmo.
          </p>
          <Button asChild size="lg" className="bg-white text-black hover:bg-gray-200 rounded-full px-12 h-16 text-xl font-bold shadow-2xl">
            <Link to="/register">Começar Agora</Link>
          </Button>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
