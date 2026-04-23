import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { useStore } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MessageCircle, Mail, Send, CheckCircle, XCircle, HeadphonesIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Support = () => {
  const { currentUser, paymentSettings, fetchPaymentSettings } = useStore();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => { fetchPaymentSettings(); }, [fetchPaymentSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setLoading(true);
    setMsg(null);

    const { error } = await supabase.functions.invoke('send-support-email', {
      body: {
        name: currentUser?.name || 'Usuário',
        email: currentUser?.email || '',
        subject,
        message,
        supportEmail: paymentSettings.supportEmail,
      },
    });

    if (error) {
      setMsg({ type: 'error', text: 'Erro ao enviar a mensagem. Tente novamente.' });
    } else {
      setMsg({ type: 'success', text: 'Mensagem enviada com sucesso! Responderemos em breve.' });
      setSubject('');
      setMessage('');
    }
    setLoading(false);
  };

  const handleWhatsApp = () => {
    const number = paymentSettings.whatsappNumber?.replace(/\D/g, '');
    if (!number) return;
    window.open(`https://wa.me/${number}`, '_blank');
  };

  return (
    <DashboardLayout>
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Suporte</h1>
        <p className="text-gray-500">Entre em contato com nossa equipe. Respondemos em até 24 horas.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center">
                <Mail className="text-blue-500" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Formulário de Contato</h3>
                <p className="text-sm text-gray-500">Preencha abaixo e enviaremos uma resposta ao seu e-mail.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    value={currentUser?.name || ''}
                    disabled
                    className="bg-white/5 border-white/10 h-12 rounded-xl opacity-60"
                  />
                </div>
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input
                    value={currentUser?.email || ''}
                    disabled
                    className="bg-white/5 border-white/10 h-12 rounded-xl opacity-60"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Assunto</Label>
                <Input
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="Ex: Problema com depósito, dúvida sobre saldo..."
                  className="bg-white/5 border-white/10 h-12 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Mensagem</Label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Descreva sua dúvida ou problema em detalhes..."
                  rows={6}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all resize-none text-sm"
                />
              </div>

              {msg && (
                <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl border ${
                  msg.type === 'success'
                    ? 'text-green-400 bg-green-500/10 border-green-500/20'
                    : 'text-red-400 bg-red-500/10 border-red-500/20'
                }`}>
                  {msg.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                  {msg.text}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl px-8 gap-2"
              >
                <Send size={16} />
                {loading ? 'Enviando...' : 'Enviar Mensagem'}
              </Button>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">

          {/* WhatsApp */}
          {paymentSettings.whatsappNumber && (
            <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-600/10 rounded-2xl flex items-center justify-center">
                  <MessageCircle className="text-green-500" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">WhatsApp</h3>
                  <p className="text-sm text-gray-500">Atendimento rápido</p>
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                Prefere falar diretamente? Clique abaixo para iniciar uma conversa no WhatsApp com nossa equipe.
              </p>
              <Button
                onClick={handleWhatsApp}
                className="w-full bg-green-600 hover:bg-green-700 rounded-xl gap-2 font-bold"
              >
                <MessageCircle size={18} />
                Abrir WhatsApp
              </Button>
            </div>
          )}

          {/* Info */}
          <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <HeadphonesIcon size={20} className="text-blue-500" />
              <h3 className="text-lg font-bold">Informações</h3>
            </div>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Tempo de resposta</span>
                <span className="font-bold">Até 24h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Horário de atendimento</span>
                <span className="font-bold">Seg–Sex 9h–18h</span>
              </div>
              {paymentSettings.supportEmail && (
                <div className="flex justify-between">
                  <span className="text-gray-500">E-mail</span>
                  <span className="font-bold text-blue-400 text-xs">{paymentSettings.supportEmail}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Support;
