import React from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Link } from 'react-router-dom';
import { AlertTriangle, ChevronRight, TrendingDown, Lock, BarChart2, Cpu, ShieldCheck } from 'lucide-react';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-10">
    <h2 className="text-xl font-bold mb-4 text-white">{title}</h2>
    <div className="text-gray-400 text-sm leading-relaxed space-y-3">{children}</div>
  </div>
);

const RiskCard = ({ icon: Icon, color, bg, title, description }: {
  icon: React.ElementType; color: string; bg: string; title: string; description: string;
}) => (
  <div className="bg-white/5 border border-white/5 rounded-2xl p-5 flex gap-4">
    <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
      <Icon className={color} size={20} />
    </div>
    <div>
      <p className="font-bold text-white mb-1">{title}</p>
      <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
    </div>
  </div>
);

const RiskManagement = () => {
  return (
    <MainLayout>
      <div className="min-h-screen pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6">

          <div className="flex items-center gap-2 text-xs text-gray-600 mb-8">
            <Link to="/" className="hover:text-blue-500 transition-colors">Início</Link>
            <ChevronRight size={12} />
            <span className="text-gray-400">Gestão de Risco</span>
          </div>

          <div className="flex items-center gap-4 mb-12">
            <div className="w-14 h-14 bg-yellow-600/10 rounded-2xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="text-yellow-500" size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Gestão de Risco</h1>
              <p className="text-gray-500 text-sm mt-1">Como a Algorix protege o seu capital</p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-5 mb-12">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-yellow-500 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-yellow-300 leading-relaxed">
                <strong>Aviso de risco obrigatório:</strong> Operações no mercado de câmbio (forex) e em contratos futuros envolvem risco substancial de perda. Resultados passados e médias históricas divulgadas não garantem rentabilidade futura. Invista apenas valores que você pode se dar ao luxo de perder. A Algorix não é um banco e não oferece garantias de capital.
              </p>
            </div>
          </div>

          <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl p-10">

            <Section title="Nossa Filosofia de Risco">
              <p>A Algorix foi desenvolvida com uma premissa fundamental: <strong className="text-white">a preservação do capital é tão importante quanto a rentabilidade.</strong> Nossa inteligência artificial foi treinada e otimizada em Singapura com foco em consistência a longo prazo, não em ganhos especulativos de curto prazo.</p>
              <p>Cada decisão de operação tomada pelo algoritmo passa por múltiplas camadas de verificação de risco antes da execução, garantindo que nenhuma operação isolada coloque em risco uma parcela significativa do portfólio gerenciado.</p>
            </Section>

            <Section title="Riscos Inerentes ao Mercado Forex">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RiskCard
                  icon={TrendingDown}
                  color="text-red-400"
                  bg="bg-red-600/10"
                  title="Risco de Mercado"
                  description="Flutuações nos preços dos pares de moedas podem resultar em perdas nas posições abertas, mesmo com gestão algorítmica."
                />
                <RiskCard
                  icon={BarChart2}
                  color="text-orange-400"
                  bg="bg-orange-600/10"
                  title="Risco de Liquidez"
                  description="Em condições extremas de mercado, pode haver dificuldade em executar ordens nos preços esperados."
                />
                <RiskCard
                  icon={AlertTriangle}
                  color="text-yellow-400"
                  bg="bg-yellow-600/10"
                  title="Risco de Volatilidade"
                  description="Eventos macroeconômicos como decisões de bancos centrais, crises geopolíticas ou dados econômicos inesperados podem causar movimentos bruscos."
                />
                <RiskCard
                  icon={Cpu}
                  color="text-blue-400"
                  bg="bg-blue-600/10"
                  title="Risco Tecnológico"
                  description="Falhas de infraestrutura, conectividade ou sistemas de terceiros podem impactar a execução das operações."
                />
              </div>
            </Section>

            <Section title="Mecanismos de Proteção da Algorix">
              <p>Para mitigar os riscos acima, o algoritmo da Algorix implementa os seguintes controles automatizados:</p>

              <div className="space-y-4 mt-4">
                <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <ShieldCheck className="text-green-500" size={20} />
                    <p className="font-bold text-white">Stop Loss Automático</p>
                  </div>
                  <p>Cada operação possui um limite máximo de perda predefinido. O sistema encerra posições automaticamente quando esse limite é atingido, evitando que uma única operação cause impacto significativo no capital total gerenciado.</p>
                </div>

                <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <Lock className="text-blue-500" size={20} />
                    <p className="font-bold text-white">Ausência de Martingale</p>
                  </div>
                  <p>A Algorix não utiliza a estratégia Martingale — método que dobra o tamanho da posição após cada perda. Essa abordagem é proibida em nosso algoritmo por expor o capital a riscos exponenciais e irrecuperáveis. Cada operação é dimensionada de forma independente e proporcional ao capital disponível.</p>
                </div>

                <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <BarChart2 className="text-purple-500" size={20} />
                    <p className="font-bold text-white">Limite de Exposição por Operação</p>
                  </div>
                  <p>O algoritmo nunca expõe mais de um percentual controlado do capital total em uma única operação. A diversificação entre múltiplos pares de moedas e janelas de tempo reduz a correlação entre as posições.</p>
                </div>

                <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <Cpu className="text-orange-500" size={20} />
                    <p className="font-bold text-white">Monitoramento em Tempo Real</p>
                  </div>
                  <p>Nossa equipe técnica em Singapura monitora o comportamento do algoritmo em tempo real, com capacidade de intervenção manual em situações de mercado extraordinárias, como interrupções de liquidez ou eventos de cisne negro.</p>
                </div>
              </div>
            </Section>

            <Section title="Sobre a Rentabilidade Divulgada">
              <p>A média de <strong className="text-white">20% a 30% ao mês</strong> divulgada pela Algorix é baseada em:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Histórico de backtesting com dados reais de mercado de 2018 a 2024;</li>
                <li>Resultados da fase de testes em ambiente real (live trading) iniciada em 2024;</li>
                <li>Performance consolidada de carteiras gerenciadas para clientes institucionais parceiros.</li>
              </ul>
              <p className="mt-3 text-yellow-400">Esta rentabilidade <strong>não é garantida</strong> e pode variar significativamente conforme as condições de mercado. Meses com rentabilidade abaixo da média ou negativa são possíveis.</p>
            </Section>

            <Section title="Recomendações para o Usuário">
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>Invista apenas valores que não comprometam sua estabilidade financeira;</li>
                <li>Não utilize recursos destinados a despesas essenciais (moradia, saúde, alimentação);</li>
                <li>Diversifique seus investimentos — não concentre todo o seu patrimônio em uma única plataforma;</li>
                <li>Acompanhe seus relatórios mensais regularmente;</li>
                <li>Em caso de dúvidas, consulte um assessor financeiro independente.</li>
              </ul>
            </Section>

            <div className="bg-white/5 rounded-2xl p-6 border border-white/5 mt-8">
              <p className="text-xs text-gray-500 leading-relaxed">
                A Algorix Technologies Pte. Ltd. atua em conformidade com as diretrizes da Monetary Authority of Singapore (MAS). As informações contidas nesta página têm caráter exclusivamente informativo e não constituem aconselhamento financeiro, jurídico ou de investimento.
              </p>
            </div>

          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default RiskManagement;
