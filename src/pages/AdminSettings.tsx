import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import {
  Globe,
  Database,
  Lock,
  Cpu,
  CreditCard,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Copy,
  Check,
  BookOpen,
  X,
  ExternalLink,
  Key,
  Webhook,
  ToggleRight,
  AlertTriangle,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useStore, PaymentGatewaySettings } from '@/lib/store';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const WEBHOOK_URL = 'https://uvppermvkskacfwduqfc.supabase.co/functions/v1/mercadopago-webhook';

const steps = [
  {
    icon: Key,
    color: 'text-blue-400',
    bg: 'bg-blue-600/10',
    title: 'Obter o Access Token de Produção',
    description: 'O Access Token autentica as requisições da plataforma na API do Mercado Pago.',
    items: [
      'Acesse mercadopago.com.br e faça login na sua conta',
      'No menu lateral, clique em "Seu negócio" → "Configurações" → "Credenciais"',
      'Clique na aba "Produção" (não use Sandbox em produção)',
      'Copie o campo "Access token" — começa com APP_USR-...',
      'Cole o token no campo "Access Token (Produção)" acima e clique em Salvar',
    ],
    warning: 'Nunca compartilhe o Access Token. Ele dá acesso total à sua conta MP.',
  },
  {
    icon: Webhook,
    color: 'text-purple-400',
    bg: 'bg-purple-600/10',
    title: 'Configurar o Webhook no Mercado Pago',
    description: 'O webhook notifica a plataforma automaticamente quando um PIX é pago.',
    items: [
      'No painel do MP, acesse "Seu negócio" → "Notificações" → "Webhooks"',
      'Clique em "Adicionar URL de produção"',
      `Cole a URL: ${WEBHOOK_URL}`,
      'Em "Eventos", marque apenas "Pagamentos"',
      'Clique em "Salvar" e certifique-se que o status aparece como "Ativo"',
    ],
    tip: 'Após salvar, o MP envia uma notificação de teste. Você pode verificar nos logs do Supabase.',
  },
  {
    icon: ToggleRight,
    color: 'text-green-400',
    bg: 'bg-green-600/10',
    title: 'Habilitar o Gateway na Plataforma',
    description: 'Após salvar as credenciais, ative o toggle para liberar depósitos via PIX.',
    items: [
      'Certifique-se de que o Access Token foi salvo corretamente',
      'Clique no toggle "Ativo / Inativo" no topo da seção Mercado Pago',
      'Clique em "Salvar Configurações"',
      'O status "PIX / Mercado Pago" no painel lateral deve mudar para OPERACIONAL',
      'Teste fazendo um depósito de valor mínimo pela área do usuário',
    ],
  },
];

const TutorialModal = ({ onClose }: { onClose: () => void }) => {
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(WEBHOOK_URL);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#0d0d0d] border-b border-white/10 px-8 py-6 flex items-center justify-between rounded-t-3xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center">
              <BookOpen className="text-blue-400" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black">Tutorial de Integração</h2>
              <p className="text-xs text-gray-500">Mercado Pago — PIX</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <div className="px-8 py-6 space-y-8">
          {/* Intro */}
          <div className="bg-blue-600/10 border border-blue-600/20 rounded-2xl p-4 text-sm text-blue-300">
            Siga os <strong>3 passos</strong> abaixo para ativar depósitos via PIX na plataforma. O processo leva menos de 5 minutos.
          </div>

          {/* Steps */}
          {steps.map((step, i) => (
            <div key={i} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${step.bg}`}>
                  <step.icon className={step.color} size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Passo {i + 1}</span>
                  </div>
                  <h3 className="font-bold text-lg leading-tight">{step.title}</h3>
                </div>
              </div>

              <p className="text-sm text-gray-400 ml-13 pl-[52px]">{step.description}</p>

              <div className="ml-[52px] space-y-2">
                {step.items.map((item, j) => (
                  <div key={j} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/10 text-xs font-bold flex items-center justify-center mt-0.5 text-gray-400">{j + 1}</span>
                    {item === WEBHOOK_URL ? (
                      <div className="flex-1 flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                        <code className="text-xs text-blue-400 font-mono flex-1 break-all">{WEBHOOK_URL}</code>
                        <button
                          onClick={handleCopyWebhook}
                          className="flex-shrink-0 p-1 hover:text-white transition-colors text-gray-500"
                        >
                          {copiedWebhook ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-300">{item}</p>
                    )}
                  </div>
                ))}
              </div>

              {step.warning && (
                <div className="ml-[52px] flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                  <AlertTriangle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-300">{step.warning}</p>
                </div>
              )}
              {step.tip && (
                <div className="ml-[52px] flex items-start gap-2 bg-purple-500/10 border border-purple-500/20 rounded-xl p-3">
                  <CheckCircle2 size={14} className="text-purple-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-purple-300">{step.tip}</p>
                </div>
              )}

              {i < steps.length - 1 && <div className="border-t border-white/5 ml-[52px]" />}
            </div>
          ))}

          {/* Footer */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 flex items-start gap-3">
            <CheckCircle2 size={18} className="text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-green-300 mb-1">Tudo pronto!</p>
              <p className="text-xs text-gray-400">
                Após concluir os 3 passos, os usuários verão o botão "Gerar QR Code PIX" na Carteira.
                Cada pagamento confirmado pelo MP credita o saldo automaticamente em segundos.
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <a
              href="https://www.mercadopago.com.br/developers/pt/docs/your-integrations/credentials"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ExternalLink size={13} /> Documentação oficial do MP
            </a>
            <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 rounded-xl px-6">
              Entendido
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SecretInput = ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-white/5 border-white/10 h-12 rounded-xl pr-12 font-mono text-sm"
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        className="absolute right-3 top-3 text-gray-500 hover:text-gray-300 transition-colors"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
};

const CopyField = ({ value }: { value: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex items-center gap-2">
      <code className="flex-1 text-xs text-blue-400 bg-blue-600/10 border border-blue-600/20 px-3 py-2 rounded-xl font-mono break-all">{value}</code>
      <button onClick={handleCopy} className="flex-shrink-0 p-2 text-gray-500 hover:text-white transition-colors">
        {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
      </button>
    </div>
  );
};

const AdminSettings = () => {
  const { paymentSettings, fetchPaymentSettings, savePaymentSettings } = useStore();
  const [form, setForm] = useState<PaymentGatewaySettings>(paymentSettings);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchPaymentSettings(); }, [fetchPaymentSettings]);
  useEffect(() => { setForm(paymentSettings); }, [paymentSettings]);

  const handleSave = async () => {
    setSaving(true);
    const ok = await savePaymentSettings(form);
    setSaving(false);
    if (ok) toast.success('Configurações salvas com sucesso!');
    else toast.error('Erro ao salvar. Tente novamente.');
  };

  return (
    <AdminLayout>
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Configurações do Sistema</h1>
        <p className="text-gray-500">Gerencie parâmetros globais e integrações de pagamento.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">

          {/* General */}
          <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center">
                <Globe className="text-blue-500" size={24} />
              </div>
              <h3 className="text-xl font-bold">Parâmetros Globais</h3>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <div>
                  <p className="font-bold">Modo Manutenção</p>
                  <p className="text-sm text-gray-500">Bloqueia o acesso de usuários comuns ao dashboard.</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <div>
                  <p className="font-bold">Novos Cadastros</p>
                  <p className="text-sm text-gray-500">Permitir que novos usuários criem contas.</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>

          {/* Suporte */}
          <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-green-600/10 rounded-2xl flex items-center justify-center">
                <Globe className="text-green-500" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Canais de Suporte</h3>
                <p className="text-sm text-gray-500">Configure WhatsApp e e-mail exibidos para os usuários.</p>
              </div>
            </div>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label>WhatsApp da Plataforma</Label>
                <Input
                  value={form.whatsappNumber}
                  onChange={e => setForm(f => ({ ...f, whatsappNumber: e.target.value }))}
                  placeholder="5511999999999 (somente números, com DDI)"
                  className="bg-white/5 border-white/10 h-12 rounded-xl"
                />
                <p className="text-xs text-gray-600">Formato: 5511999999999 — DDI + DDD + número, sem espaços ou símbolos.</p>
              </div>
              <div className="space-y-2">
                <Label>E-mail de Suporte</Label>
                <Input
                  type="email"
                  value={form.supportEmail}
                  onChange={e => setForm(f => ({ ...f, supportEmail: e.target.value }))}
                  placeholder="suporte@algorixinvest.com"
                  className="bg-white/5 border-white/10 h-12 rounded-xl"
                />
                <p className="text-xs text-gray-600">Endereço que receberá as mensagens enviadas pelo formulário de suporte.</p>
              </div>
            </div>
            <div className="pt-6 mt-6 border-t border-white/5 flex justify-end">
              <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 rounded-xl px-8 h-11">
                {saving ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </div>
          </div>

          {/* Mercado Pago PIX */}
          <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center">
                  <CreditCard className="text-blue-500" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Mercado Pago — PIX</h3>
                  <p className="text-sm text-gray-500">Receba depósitos via PIX diretamente na plataforma.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">{form.gatewayEnabled ? 'Ativo' : 'Inativo'}</span>
                <Switch
                  checked={form.gatewayEnabled}
                  onCheckedChange={v => setForm(f => ({ ...f, gatewayEnabled: v }))}
                />
              </div>
            </div>

            {/* Status */}
            <div className={cn(
              'flex items-center gap-3 p-4 rounded-2xl mb-6 text-sm font-semibold',
              form.gatewayEnabled
                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
            )}>
              {form.gatewayEnabled
                ? <><CheckCircle2 size={16} /> PIX habilitado — usuários podem depositar via QR Code.</>
                : <><XCircle size={16} /> PIX desabilitado. Ative o toggle para permitir depósitos.</>}
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label>Access Token (Produção)</Label>
                <SecretInput
                  value={form.mercadopagoAccessToken}
                  onChange={v => setForm(f => ({ ...f, mercadopagoAccessToken: v }))}
                  placeholder="APP_USR-..."
                />
                <p className="text-xs text-gray-600">Mercado Pago → Suas integrações → Credenciais de produção → Access token.</p>
              </div>
              <div className="space-y-2">
                <Label>Public Key <span className="text-gray-600 font-normal">(opcional)</span></Label>
                <Input
                  value={form.mercadopagoPublicKey}
                  onChange={e => setForm(f => ({ ...f, mercadopagoPublicKey: e.target.value }))}
                  placeholder="APP_USR-..."
                  className="bg-white/5 border-white/10 h-12 rounded-xl font-mono text-sm"
                />
              </div>

              {/* Webhook info */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <Label>URL do Webhook <span className="text-gray-600 font-normal">(configure no painel MP)</span></Label>
                <CopyField value={WEBHOOK_URL} />
                <p className="text-xs text-gray-600">
                  No Mercado Pago: Seu negócio → Notificações → Webhooks → Adicionar URL acima.
                  Evento: <code className="text-blue-400">payment</code>.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-white/5 flex justify-end">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 rounded-xl px-8 h-11"
              >
                {saving ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl p-8">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Cpu size={20} className="text-green-500" /> Saúde do Sistema
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Banco de Dados', ok: true },
                { label: 'Auth Service', ok: true },
                { label: 'Edge Functions', ok: true },
                { label: 'PIX / Mercado Pago', ok: form.gatewayEnabled && !!form.mercadopagoAccessToken },
              ].map(({ label, ok }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{label}</span>
                  <span className={cn('text-xs font-bold px-2 py-1 rounded-md', ok ? 'text-green-500 bg-green-500/10' : 'text-yellow-500 bg-yellow-500/10')}>
                    {ok ? 'OPERACIONAL' : 'INATIVO'}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-white/5">
              <Button variant="outline" className="w-full border-white/10 rounded-xl gap-2">
                <Database size={16} /> Limpar Cache
              </Button>
            </div>
          </div>

          <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl p-8">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Lock size={20} className="text-purple-500" /> Acesso Restrito
            </h3>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              Alterações nestas configurações afetam todos os usuários da plataforma instantaneamente.
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Gateway</span>
                <span className="font-bold text-blue-400">Mercado Pago</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Método</span>
                <span className="font-bold">PIX</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Access Token</span>
                <span className="font-mono text-xs text-gray-400">
                  {form.mercadopagoAccessToken ? `${form.mercadopagoAccessToken.slice(0, 12)}...` : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
