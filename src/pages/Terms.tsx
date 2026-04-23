import React from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Link } from 'react-router-dom';
import { FileText, ChevronRight } from 'lucide-react';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-10">
    <h2 className="text-xl font-bold mb-4 text-white">{title}</h2>
    <div className="text-gray-400 text-sm leading-relaxed space-y-3">{children}</div>
  </div>
);

const Terms = () => {
  return (
    <MainLayout>
      <div className="min-h-screen pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6">

          {/* Header */}
          <div className="flex items-center gap-2 text-xs text-gray-600 mb-8">
            <Link to="/" className="hover:text-blue-500 transition-colors">Início</Link>
            <ChevronRight size={12} />
            <span className="text-gray-400">Termos de Uso</span>
          </div>

          <div className="flex items-center gap-4 mb-12">
            <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center flex-shrink-0">
              <FileText className="text-blue-500" size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Termos de Uso</h1>
              <p className="text-gray-500 text-sm mt-1">Última atualização: {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          <div className="bg-blue-600/5 border border-blue-600/20 rounded-2xl p-5 mb-12 text-sm text-blue-300 leading-relaxed">
            Ao acessar ou utilizar a plataforma Algorix, você concorda integralmente com os presentes Termos de Uso. Leia com atenção antes de prosseguir.
          </div>

          <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl p-10">

            <Section title="1. Definições">
              <p><strong className="text-white">Algorix</strong> ou <strong className="text-white">Plataforma</strong> refere-se ao sistema de gestão de operações automatizadas em mercados forex operado pela Algorix Technologies Pte. Ltd., empresa constituída segundo as leis de Singapura.</p>
              <p><strong className="text-white">Usuário</strong> é qualquer pessoa física que acesse, cadastre-se ou utilize os serviços disponibilizados pela Plataforma.</p>
              <p><strong className="text-white">Operações</strong> são as ordens de compra e venda de pares de moedas no mercado forex executadas automaticamente pelo sistema algorítmico da Algorix.</p>
              <p><strong className="text-white">Saldo</strong> é o valor depositado pelo Usuário e gerenciado pela Plataforma para fins de participação nas operações automatizadas.</p>
            </Section>

            <Section title="2. Elegibilidade">
              <p>Para utilizar a Plataforma, o Usuário deve:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Ter no mínimo 18 anos de idade;</li>
                <li>Possuir capacidade jurídica plena para contratar;</li>
                <li>Fornecer informações verídicas no cadastro, incluindo nome completo, CPF, e-mail e telefone;</li>
                <li>Não estar impedido por legislação de seu país de origem de participar de operações nos mercados financeiros internacionais.</li>
              </ul>
              <p>A Algorix reserva-se o direito de recusar ou cancelar cadastros que não atendam aos requisitos acima.</p>
            </Section>

            <Section title="3. Descrição dos Serviços">
              <p>A Algorix disponibiliza um sistema de inteligência artificial que opera autonomamente no mercado de câmbio (forex), executando abertura e fechamento de posições em contratos futuros de pares de moedas. O algoritmo foi desenvolvido em Singapura e opera 24 horas por dia, 5 dias por semana, conforme o calendário de mercado internacional.</p>
              <p>O sistema não utiliza a estratégia Martingale nem qualquer método que exponha o capital do Usuário a perdas progressivas e ilimitadas. Todas as operações possuem gestão de risco integrada com parâmetros de stop loss automático.</p>
              <p>A rentabilidade média divulgada de 20% a 30% ao mês é baseada no histórico de testes e operações realizadas. <strong className="text-white">Não constitui garantia de rentabilidade futura.</strong></p>
            </Section>

            <Section title="4. Cadastro e Segurança da Conta">
              <p>O Usuário é o único responsável pela confidencialidade de suas credenciais de acesso. Em caso de suspeita de uso não autorizado, o Usuário deve notificar imediatamente o suporte da Plataforma.</p>
              <p>É vedado compartilhar, ceder ou transferir o acesso à conta para terceiros. Cada conta é estritamente pessoal e intransferível.</p>
              <p>A Algorix implementa criptografia de dados e autenticação segura, porém não se responsabiliza por perdas decorrentes de negligência do Usuário na proteção de suas credenciais.</p>
            </Section>

            <Section title="5. Depósitos e Saques">
              <p>Os depósitos são realizados exclusivamente via PIX, através do gateway integrado à Plataforma. O crédito ocorre após a confirmação do pagamento pelo sistema.</p>
              <p>As solicitações de saque estão sujeitas à análise e aprovação pela equipe da Algorix, podendo ocorrer em até 3 dias úteis após a solicitação.</p>
              <p>A Algorix reserva-se o direito de solicitar documentação comprobatória de identidade (KYC) antes de processar saques acima de determinados valores, em conformidade com as regulamentações anti-lavagem de dinheiro.</p>
            </Section>

            <Section title="6. Limitação de Responsabilidade">
              <p>O mercado forex é altamente volátil. A Algorix não garante resultados positivos em todas as operações. Ao utilizar a Plataforma, o Usuário reconhece e aceita os riscos inerentes às operações financeiras automatizadas.</p>
              <p>A Algorix não será responsável por perdas decorrentes de:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Volatilidade extrema de mercado ou eventos macroeconômicos imprevisíveis;</li>
                <li>Falhas em infraestrutura de terceiros (internet, energia, sistemas bancários);</li>
                <li>Decisões do Usuário que contrariem as orientações da Plataforma;</li>
                <li>Uso inadequado ou não autorizado da conta.</li>
              </ul>
            </Section>

            <Section title="7. Propriedade Intelectual">
              <p>Todo o conteúdo da Plataforma — incluindo algoritmos, interfaces, logotipo, textos e dados — é de propriedade exclusiva da Algorix Technologies Pte. Ltd. e está protegido por leis de propriedade intelectual.</p>
              <p>É proibida a reprodução, engenharia reversa, cópia ou distribuição de qualquer elemento da Plataforma sem autorização prévia e escrita da Algorix.</p>
            </Section>

            <Section title="8. Rescisão">
              <p>O Usuário pode encerrar sua conta a qualquer momento, desde que não haja saldo pendente em operações em aberto. A Algorix poderá suspender ou encerrar contas em caso de violação destes Termos, suspeita de fraude ou atividade ilegal.</p>
            </Section>

            <Section title="9. Alterações nos Termos">
              <p>A Algorix reserva-se o direito de modificar estes Termos a qualquer momento. As alterações entrarão em vigor imediatamente após publicação na Plataforma. O uso continuado dos serviços após a publicação das alterações constitui aceitação dos novos Termos.</p>
            </Section>

            <Section title="10. Lei Aplicável e Foro">
              <p>Estes Termos são regidos pelas leis da República de Singapura. Quaisquer disputas decorrentes do uso da Plataforma serão submetidas à jurisdição dos tribunais competentes de Singapura, sem prejuízo do direito do Usuário de acionar as autoridades de defesa do consumidor de seu país de residência.</p>
            </Section>

            <div className="pt-8 border-t border-white/5 mt-8">
              <p className="text-xs text-gray-600">Algorix Technologies Pte. Ltd. — 1 Raffles Place, #20-61 One Raffles Place Tower 2, Singapura 048616. Contato: <span className="text-blue-500">legal@algorixinvest.com</span></p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Terms;
