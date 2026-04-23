import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { useStore } from '@/lib/store';
import { supabase } from '@/integrations/supabase/client';
import {
  Users,
  Copy,
  Check,
  Share2,
  TrendingUp,
  DollarSign,
  UserCheck,
  Calendar,
  ChevronRight,
  Gift,
  Zap,
  Link2,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ReferralUser {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  status: 'ACTIVE' | 'INACTIVE';
  totalCommission: number;
}

interface Commission {
  id: string;
  referredName: string;
  referredEmail: string;
  profitAmount: number;
  commissionAmount: number;
  date: string;
  createdAt: string;
}

const Network = () => {
  const { currentUser } = useStore();
  const [copied, setCopied] = useState(false);
  const [referrals, setReferrals] = useState<ReferralUser[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);

  const referralCode = (currentUser as any)?.referralCode || null;
  const referralLink = referralCode
    ? `${window.location.origin}/register?ref=${referralCode}`
    : null;

  useEffect(() => {
    if (!currentUser?.id) return;
    fetchReferralData();
  }, [currentUser?.id]);

  const fetchReferralData = async () => {
    setLoading(true);
    try {
      // Fetch who this user referred
      const { data: refs } = await supabase
        .from('profiles')
        .select('id, name, email, status, created_at')
        .eq('referred_by', currentUser!.id)
        .order('created_at', { ascending: false });

      // Fetch commissions earned
      const { data: comms } = await supabase
        .from('referral_commissions')
        .select('*, profiles!referred_id(name, email)')
        .eq('referrer_id', currentUser!.id)
        .order('created_at', { ascending: false });

      if (refs) {
        // For each referral, sum their commissions
        const commByUser: Record<string, number> = {};
        (comms || []).forEach((c: any) => {
          commByUser[c.referred_id] = (commByUser[c.referred_id] || 0) + Number(c.commission_amount);
        });

        setReferrals(refs.map((r: any) => ({
          id: r.id,
          name: r.name,
          email: r.email,
          joinedAt: r.created_at,
          status: r.status as 'ACTIVE' | 'INACTIVE',
          totalCommission: commByUser[r.id] || 0,
        })));
      }

      if (comms) {
        setCommissions(comms.map((c: any) => ({
          id: c.id,
          referredName: c.profiles?.name || '—',
          referredEmail: c.profiles?.email || '—',
          profitAmount: Number(c.profit_amount),
          commissionAmount: Number(c.commission_amount),
          date: c.date,
          createdAt: c.created_at,
        })));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Link copiado para a área de transferência!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    if (!referralLink) return;
    const text = encodeURIComponent(
      `🚀 Invisto na Algorix e tô tendo resultados incríveis! Se você quiser começar também, use meu link de convite:\n\n${referralLink}\n\nA plataforma usa IA algorítmica para operar nos maiores bancos do mundo. Vale muito a pena!`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // Stats
  const totalReferrals = referrals.length;
  const activeReferrals = referrals.filter(r => r.status === 'ACTIVE').length;
  const totalCommissions = commissions.reduce((sum, c) => sum + c.commissionAmount, 0);
  const now = new Date();
  const monthlyCommissions = commissions
    .filter(c => {
      const d = new Date(c.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, c) => sum + c.commissionAmount, 0);

  const fmt = (v: number) =>
    v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-transparent border border-blue-500/20 p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                <Share2 size={20} />
              </div>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Programa de Indicação</span>
            </div>
            <h1 className="text-3xl font-black mb-2">Algorix Network</h1>
            <p className="text-gray-400 max-w-xl leading-relaxed">
              Indique amigos e ganhe <span className="text-blue-400 font-bold">10% sobre os rendimentos</span> gerados por eles, de forma contínua, enquanto estiverem ativos na plataforma.
            </p>
            <div className="flex flex-wrap gap-3 mt-5">
              {[
                { icon: Zap, text: 'Totalmente automatizado' },
                { icon: TrendingUp, text: 'Comissões em tempo real' },
                { icon: Gift, text: 'Sem limite de indicações' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-gray-300">
                  <Icon size={12} className="text-blue-400" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Indicados', value: totalReferrals.toString(), icon: Users, color: 'text-blue-400', bg: 'bg-blue-600/10' },
            { label: 'Indicados Ativos', value: activeReferrals.toString(), icon: UserCheck, color: 'text-green-400', bg: 'bg-green-600/10' },
            { label: 'Comissões Totais', value: `R$ ${fmt(totalCommissions)}`, icon: DollarSign, color: 'text-yellow-400', bg: 'bg-yellow-600/10' },
            { label: 'Comissões do Mês', value: `R$ ${fmt(monthlyCommissions)}`, icon: Calendar, color: 'text-purple-400', bg: 'bg-purple-600/10' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-[#0d0d0d] border border-white/10 rounded-2xl p-5">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', bg)}>
                <Icon size={20} className={color} />
              </div>
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className="text-xl font-black text-white">{value}</p>
            </div>
          ))}
        </div>

        {/* Referral Link */}
        <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Link2 size={18} className="text-blue-400" />
            <h2 className="font-bold text-lg">Seu Link de Convite</h2>
          </div>

          {referralCode ? (
            <>
              <div className="flex gap-3 mb-4">
                <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-gray-300 overflow-x-auto whitespace-nowrap">
                  {referralLink}
                </div>
                <Button
                  onClick={handleCopy}
                  className={cn(
                    'rounded-xl px-5 font-semibold transition-all',
                    copied ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                  )}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  <span className="ml-2">{copied ? 'Copiado!' : 'Copiar'}</span>
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">Compartilhar via:</span>
                <button
                  onClick={handleWhatsAppShare}
                  className="flex items-center gap-2 bg-green-600/10 border border-green-600/20 text-green-400 hover:bg-green-600/20 transition-colors rounded-xl px-4 py-2 text-sm font-semibold"
                >
                  <MessageCircle size={14} />
                  WhatsApp
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-3">
                <span className="text-xs text-gray-500">Seu código:</span>
                <span className="font-mono text-sm font-bold text-blue-400 bg-blue-600/10 px-3 py-1 rounded-lg tracking-widest">
                  {referralCode}
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-yellow-600/10 border border-yellow-600/20 rounded-xl text-sm text-yellow-400">
              <Zap size={16} />
              Seu código de indicação está sendo gerado. Recarregue a página em instantes.
            </div>
          )}
        </div>

        {/* How it works */}
        <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl p-6">
          <h2 className="font-bold text-lg mb-5">Como funciona</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { step: '1', title: 'Copie seu link', desc: 'Cada usuário tem um link exclusivo e intransferível.' },
              { step: '2', title: 'Compartilhe', desc: 'Envie para amigos, família ou sua rede de contatos.' },
              { step: '3', title: 'Eles se cadastram', desc: 'Quando se registrarem pelo seu link, ficam vinculados a você.' },
              { step: '4', title: 'Você recebe 10%', desc: 'Automaticamente sobre os rendimentos diários gerados por eles.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-sm font-black flex-shrink-0">
                  {step}
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1">{title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Referrals Table */}
        <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-blue-400" />
              <h2 className="font-bold text-lg">Minhas Indicações</h2>
            </div>
            <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full">{totalReferrals} usuário{totalReferrals !== 1 ? 's' : ''}</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500 text-sm">Carregando...</div>
          ) : referrals.length === 0 ? (
            <div className="p-12 text-center">
              <Users size={40} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 font-semibold mb-1">Nenhuma indicação ainda</p>
              <p className="text-gray-600 text-sm">Compartilhe seu link e comece a ganhar comissões.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Usuário</th>
                    <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Cadastro</th>
                    <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Status</th>
                    <th className="text-right px-6 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Comissão Gerada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {referrals.map(ref => (
                    <tr key={ref.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-white">{ref.name}</p>
                          <p className="text-xs text-gray-500">{ref.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {new Date(ref.joinedAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
                          ref.status === 'ACTIVE'
                            ? 'bg-green-600/10 text-green-400'
                            : 'bg-red-600/10 text-red-400'
                        )}>
                          <span className={cn('w-1.5 h-1.5 rounded-full', ref.status === 'ACTIVE' ? 'bg-green-400' : 'bg-red-400')} />
                          {ref.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={cn(
                          'font-bold',
                          ref.totalCommission > 0 ? 'text-green-400' : 'text-gray-600'
                        )}>
                          R$ {fmt(ref.totalCommission)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Commissions History */}
        <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-white/5">
            <div className="flex items-center gap-2">
              <DollarSign size={18} className="text-yellow-400" />
              <h2 className="font-bold text-lg">Histórico de Comissões</h2>
            </div>
            <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full">{commissions.length} registro{commissions.length !== 1 ? 's' : ''}</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500 text-sm">Carregando...</div>
          ) : commissions.length === 0 ? (
            <div className="p-12 text-center">
              <DollarSign size={40} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 font-semibold mb-1">Nenhuma comissão ainda</p>
              <p className="text-gray-600 text-sm">As comissões aparecerão aqui quando seus indicados gerarem rendimentos.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Data</th>
                    <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Indicado</th>
                    <th className="text-right px-6 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Rendimento deles</th>
                    <th className="text-right px-6 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Sua Comissão (10%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {commissions.map(c => (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-gray-400">
                        {new Date(c.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-white">{c.referredName}</p>
                          <p className="text-xs text-gray-500">{c.referredEmail}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-400">
                        R$ {fmt(c.profitAmount)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-green-400">+ R$ {fmt(c.commissionAmount)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-white/10">
                    <td colSpan={3} className="px-6 py-4 text-right text-sm text-gray-500 font-semibold">Total recebido:</td>
                    <td className="px-6 py-4 text-right font-black text-green-400 text-lg">
                      R$ {fmt(totalCommissions)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Network;
