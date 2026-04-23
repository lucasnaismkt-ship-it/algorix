import React from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Link } from 'react-router-dom';
import { Shield, ChevronRight } from 'lucide-react';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-10">
    <h2 className="text-xl font-bold mb-4 text-white">{title}</h2>
    <div className="text-gray-400 text-sm leading-relaxed space-y-3">{children}</div>
  </div>
);

const Privacy = () => {
  return (
    <MainLayout>
      <div className="min-h-screen pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6">

          <div className="flex items-center gap-2 text-xs text-gray-600 mb-8">
            <Link to="/" className="hover:text-blue-500 transition-colors">Início</Link>
            <ChevronRight size={12} />
            <span className="text-gray-400">Política de Privacidade</span>
          </div>

          <div className="flex items-center gap-4 mb-12">
            <div className="w-14 h-14 bg-purple-600/10 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Shield className="text-purple-500" size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Política de Privacidade</h1>
              <p className="text-gray-500 text-sm mt-1">Última atualização: {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          <div className="bg-purple-600/5 border border-purple-600/20 rounded-2xl p-5 mb-12 text-sm text-purple-300 leading-relaxed">
            A Algorix valoriza e respeita a sua privacidade. Esta Política descreve como coletamos, usamos, armazenamos e protegemos seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD) do Brasil e a Personal Data Protection Act (PDPA) de Singapura.
          </div>

          <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl p-10">

            <Section title="1. Dados que Coletamos">
              <p>Ao se cadastrar e utilizar a Plataforma Algorix, coletamos as seguintes categorias de dados:</p>
              <div className="space-y-3">
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <p className="text-white font-semibold mb-1">Dados de Identificação</p>
                  <p>Nome completo, CPF, data de nascimento, endereço de e-mail, número de telefone/WhatsApp.</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <p className="text-white font-semibold mb-1">Dados Financeiros</p>
                  <p>Histórico de depósitos, saques, operações realizadas e saldo na plataforma. Não armazenamos dados de cartões bancários.</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <p className="text-white font-semibold mb-1">Dados de Acesso</p>
                  <p>Endereço IP, tipo de dispositivo, navegador, sistema operacional, data e hora de acesso.</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <p className="text-white font-semibold mb-1">Comunicações</p>
                  <p>Mensagens enviadas via formulário de suporte ou e-mail para fins de atendimento.</p>
                </div>
              </div>
            </Section>

            <Section title="2. Como Utilizamos seus Dados">
              <p>Os dados coletados são utilizados exclusivamente para:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Criar e gerenciar sua conta na Plataforma;</li>
                <li>Processar depósitos e saques com segurança;</li>
                <li>Exibir seu histórico de operações e relatórios de rentabilidade;</li>
                <li>Enviar notificações sobre sua conta, operações e atualizações da Plataforma;</li>
                <li>Cumprir obrigações legais e regulatórias (KYC/AML);</li>
                <li>Melhorar a experiência do usuário e a segurança da Plataforma;</li>
                <li>Prevenir fraudes e atividades suspeitas.</li>
              </ul>
              <p>A Algorix <strong className="text-white">não vende, aluga ou comercializa</strong> seus dados pessoais a terceiros para fins publicitários.</p>
            </Section>

            <Section title="3. Base Legal para o Tratamento">
              <p>O tratamento dos seus dados pessoais é fundamentado nas seguintes bases legais previstas na LGPD:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li><strong className="text-white">Execução de contrato:</strong> para prestação dos serviços contratados;</li>
                <li><strong className="text-white">Consentimento:</strong> para envio de comunicações de marketing (opcional);</li>
                <li><strong className="text-white">Obrigação legal:</strong> para cumprimento de normas regulatórias financeiras;</li>
                <li><strong className="text-white">Legítimo interesse:</strong> para prevenção de fraudes e segurança da plataforma.</li>
              </ul>
            </Section>

            <Section title="4. Compartilhamento de Dados">
              <p>Seus dados podem ser compartilhados apenas nas seguintes situações:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li><strong className="text-white">Parceiros de pagamento:</strong> Mercado Pago e demais gateways, exclusivamente para processamento de transações;</li>
                <li><strong className="text-white">Infraestrutura tecnológica:</strong> Supabase (banco de dados) e Vercel (hospedagem), sob acordos de confidencialidade;</li>
                <li><strong className="text-white">Autoridades competentes:</strong> quando exigido por lei, ordem judicial ou regulação financeira.</li>
              </ul>
            </Section>

            <Section title="5. Segurança dos Dados">
              <p>Implementamos medidas técnicas e organizacionais robustas para proteger seus dados:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Criptografia em trânsito (TLS/HTTPS) e em repouso;</li>
                <li>Autenticação segura com tokens JWT;</li>
                <li>Controle de acesso baseado em funções (RBAC);</li>
                <li>Monitoramento contínuo de atividades suspeitas;</li>
                <li>Backup automático com redundância geográfica;</li>
                <li>Servidores em conformidade com ISO 27001.</li>
              </ul>
            </Section>

            <Section title="6. Retenção de Dados">
              <p>Mantemos seus dados pelo período necessário para a prestação dos serviços e cumprimento de obrigações legais. Após o encerramento da conta:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Dados financeiros são retidos por 5 anos conforme exigência regulatória;</li>
                <li>Dados de identificação são anonimizados ou excluídos após 90 dias do encerramento;</li>
                <li>Logs de acesso são mantidos por 6 meses.</li>
              </ul>
            </Section>

            <Section title="7. Seus Direitos (LGPD)">
              <p>Como titular dos dados, você tem direito a:</p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li><strong className="text-white">Acesso:</strong> solicitar cópia dos seus dados pessoais;</li>
                <li><strong className="text-white">Correção:</strong> atualizar dados incompletos ou incorretos;</li>
                <li><strong className="text-white">Exclusão:</strong> solicitar a eliminação dos seus dados;</li>
                <li><strong className="text-white">Portabilidade:</strong> receber seus dados em formato estruturado;</li>
                <li><strong className="text-white">Revogação de consentimento:</strong> retirar consentimentos previamente concedidos;</li>
                <li><strong className="text-white">Oposição:</strong> opor-se ao tratamento de dados.</li>
              </ul>
              <p>Para exercer seus direitos, entre em contato pelo e-mail <span className="text-blue-500">privacidade@algorixinvest.com</span>.</p>
            </Section>

            <Section title="8. Cookies">
              <p>Utilizamos cookies essenciais para o funcionamento da Plataforma (autenticação e sessão) e cookies analíticos para melhorar a experiência do usuário. Você pode configurar seu navegador para recusar cookies, mas isso pode impactar o funcionamento de algumas funcionalidades.</p>
            </Section>

            <Section title="9. Transferência Internacional de Dados">
              <p>Como empresa operada a partir de Singapura, seus dados podem ser processados em servidores fora do Brasil. Garantimos que tais transferências ocorrem com as salvaguardas adequadas exigidas pela LGPD e pela PDPA de Singapura.</p>
            </Section>

            <Section title="10. Contato — Encarregado de Dados (DPO)">
              <p>Para dúvidas, solicitações ou reclamações relacionadas ao tratamento dos seus dados pessoais, entre em contato com nosso Encarregado de Proteção de Dados:</p>
              <div className="bg-white/5 rounded-xl p-4 border border-white/5 mt-2">
                <p className="text-white font-semibold">Algorix Technologies Pte. Ltd.</p>
                <p>E-mail: <span className="text-blue-500">privacidade@algorixinvest.com</span></p>
                <p>Endereço: 1 Raffles Place, #20-61 One Raffles Place Tower 2, Singapura 048616</p>
              </div>
            </Section>

          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Privacy;
