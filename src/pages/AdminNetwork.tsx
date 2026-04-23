import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import {
  Users,
  DollarSign,
  TrendingUp,
  Search,
  Share2,
  ChevronDown,
  ChevronRight,
  UserCheck,
  Calendar,
  ArrowUpRight,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ReferralNode {
  referrerId: string;
  referrerName: string;
  referrerEmail: string;
  referrerCode: string;
  referralCount: number;
  totalCommission: number;
  activeReferrals: number;
  referrals: {
    id: string;
    name: string;
    email: string;
    status: 'ACTIVE' | 'INACTIVE';
    joinedAt: string;
    commission: number;
  }[];
}

interface CommissionEntry {
  id: string;
  referrerName: string;
  referrerEmail: string;
  referredName: string;
  referredEmail: string;
  profitAmount: number;
  commissionAmount: number;
  date: string;
  createdAt: string;
}

const AdminNetwork = () => {
  const [nodes, setNodes] = useState<ReferralNode[]>([]);
  const [commissions, setCommissions] = useState<CommissionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'tree' | 'commissions'>('tree');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      // All profiles with referral info
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, email, status, created_at, referral_code, referred_by')
        .order('created_at', { ascending: false });

      // All commissions with referrer and referred profiles
      const { data: comms } = await supabase
        .from('referral_commissions')
        .select('*, referrer:profiles!referrer_id(name, email), referred:profiles!referred_id(name, email)')
        .order('created_at', { ascending: false });

      if (profiles) {
        // Build referral tree
        const profileMap: Record<string, any> = {};
        profiles.forEach((p: any) => { profileMap[p.id] = p; });

        // Group referred users by their referrer
        const referrerMap: Record<string, any[]> = {};
        profiles.forEach((p: any) => {
          if (p.referred_by) {
            if (!referrerMap[p.referred_by]) referrerMap[p.referred_by] = [];
            referrerMap[p.referred_by].push(p);
          }
        });

        // Commission totals per (referrer, referred) pair
        const commByReferred: Record<string, Record<string, number>> = {};
        (comms || []).forEach((c: any) => {
          if (!commByReferred[c.referrer_id]) commByReferred[c.referrer_id] = {};
          commByReferred[c.referrer_id][c.referred_id] =
            (commByReferred[c.referrer_id][c.referred_id] || 0) + Number(c.commission_amount);
        });

        // Only show users who have at least 1 referral
        const nodeList: ReferralNode[] = Object.keys(referrerMap).map(referrerId => {
          const referrer = profileMap[referrerId];
          if (!referrer) return null;
          const refs = referrerMap[referrerId];
          const totalComm = refs.reduce((sum: number, r: any) =>
            sum + (commByReferred[referrerId]?.[r.id] || 0), 0);
          return {
            referrerId,
            referrerName: referrer.name,
            referrerEmail: referrer.email,
            referrerCode: referrer.referral_code || '—',
            referralCount: refs.length,
            activeReferrals: refs.filter((r: any) => r.status === 'ACTIVE').length,
            totalCommission: totalComm,
            referrals: refs.map((r: any) => ({
              id: r.id,
              name: r.name,
              email: r.email,
              status: r.status as 'ACTIVE' | 'INACTIVE',
              joinedAt: r.created_at,
              commission: commByReferred[referrerId]?.[r.id] || 0,
            })),
          };
        }).filter(Boolean) as ReferralNode[];

        // Sort by total commission desc
        nodeList.sort((a, b) => b.totalCommission - a.totalCommission);
        setNodes(nodeList);
      }

      if (comms) {
        setCommissions(comms.map((c: any) => ({
          id: c.id,
          referrerName: c.referrer?.name || '—',
          referrerEmail: c.referrer?.email || '—',
          referredName: c.referred?.name || '—',
          referredEmail: c.referred?.email || '—',
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

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const fmt = (v: number) =>
    v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const filteredNodes = nodes.filter(n =>
    n.referrerName.toLowerCase().includes(search.toLowerCase()) ||
    n.referrerEmail.toLowerCase().includes(search.toLowerCase()) ||
    n.referrerCode.toLowerCase().includes(search.toLowerCase())
  );

  const filteredCommissions = commissions.filter(c =>
    c.referrerName.toLowerCase().includes(search.toLowerCase()) ||
    c.referredName.toLowerCase().includes(search.toLowerCase()) ||
    c.referrerEmail.toLowerCase().includes(search.toLowerCase())
  );

  // Summary stats
  const totalComm = commissions.reduce((s, c) => s + c.commissionAmount, 0);
  const now = new Date();
  const monthlyComm = commissions
    .filter(c => {
      const d = new Date(c.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, c) => s + c.commissionAmount, 0);
  const totalReferrals = nodes.reduce((s, n) => s + n.referralCount, 0);
  const totalReferrers = nodes.length;

  return (
    <AdminLayout>
      <div className="space-y-8">

        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Share2 size={22} className="text-blue-400" />
            <h1 className="text-2xl font-black">Algorix Network — Admin</h1>
          </div>
          <p className="text-gray-500 text-sm">Visão completa do programa de indicações: quem indicou quem, comissões geradas e desempenho.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total de Indicadores', value: totalReferrers.toString(), icon: Share2, color: 'text-blue-400', bg: 'bg-blue-600/10' },
            { label: 'Total de Indicados', value: totalReferrals.toString(), icon: Users, color: 'text-green-400', bg: 'bg-green-600/10' },
            { label: 'Comissões Totais', value: `R$ ${fmt(totalComm)}`, icon: DollarSign, color: 'text-yellow-400', bg: 'bg-yellow-600/10' },
            { label: 'Comissões do Mês', value: `R$ ${fmt(monthlyComm)}`, icon: Calendar, color: 'text-purple-400', bg: 'bg-purple-600/10' },
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

        {/* Tabs + Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex gap-1 bg-white/5 rounded-xl p-1 w-fit">
            {(['tree', 'commissions'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-5 py-2 rounded-lg text-sm font-semibold transition-all',
                  activeTab === tab ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'
                )}
              >
                {tab === 'tree' ? '🌐 Árvore de Indicações' : '💰 Histórico de Comissões'}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nome, e-mail ou código..."
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 pl-9 rounded-xl w-72"
            />
          </div>
        </div>

        {/* Tree Tab */}
        {activeTab === 'tree' && (
          <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h2 className="font-bold">Indicadores e suas redes</h2>
              <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full">{filteredNodes.length} indicador{filteredNodes.length !== 1 ? 'es' : ''}</span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-gray-500 text-sm">Carregando...</div>
            ) : filteredNodes.length === 0 ? (
              <div className="p-12 text-center">
                <Share2 size={40} className="text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500">Nenhum indicador encontrado ainda.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {filteredNodes.map(node => {
                  const expanded = expandedRows.has(node.referrerId);
                  return (
                    <div key={node.referrerId}>
                      {/* Referrer row */}
                      <button
                        className="w-full flex items-center gap-4 px-6 py-4 hover:bg-white/[0.03] transition-colors text-left"
                        onClick={() => toggleRow(node.referrerId)}
                      >
                        <div className={cn('transition-transform', expanded ? 'rotate-90' : '')}>
                          <ChevronRight size={16} className="text-gray-500" />
                        </div>
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0">
                          {node.referrerName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white truncate">{node.referrerName}</p>
                          <p className="text-xs text-gray-500 truncate">{node.referrerEmail}</p>
                        </div>
                        <div className="hidden md:flex items-center gap-6 text-sm">
                          <div className="text-center">
                            <p className="text-xs text-gray-500 mb-0.5">Código</p>
                            <span className="font-mono text-xs font-bold text-blue-400 bg-blue-600/10 px-2 py-0.5 rounded">
                              {node.referrerCode}
                            </span>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500 mb-0.5">Indicados</p>
                            <p className="font-bold text-white">{node.referralCount}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500 mb-0.5">Ativos</p>
                            <p className="font-bold text-green-400">{node.activeReferrals}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500 mb-0.5">Comissão Total</p>
                            <p className="font-bold text-yellow-400">R$ {fmt(node.totalCommission)}</p>
                          </div>
                        </div>
                      </button>

                      {/* Expanded referrals sub-table */}
                      {expanded && (
                        <div className="bg-white/[0.02] border-t border-white/5">
                          <div className="px-16 py-2">
                            <table className="w-full text-sm">
                              <thead>
                                <tr>
                                  <th className="text-left py-2 px-3 text-xs text-gray-600 font-semibold uppercase tracking-wider">Indicado</th>
                                  <th className="text-left py-2 px-3 text-xs text-gray-600 font-semibold uppercase tracking-wider">Cadastro</th>
                                  <th className="text-left py-2 px-3 text-xs text-gray-600 font-semibold uppercase tracking-wider">Status</th>
                                  <th className="text-right py-2 px-3 text-xs text-gray-600 font-semibold uppercase tracking-wider">Comissão Gerada</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                {node.referrals.map(ref => (
                                  <tr key={ref.id} className="hover:bg-white/[0.02]">
                                    <td className="py-3 px-3">
                                      <div>
                                        <p className="font-semibold text-white text-sm">{ref.name}</p>
                                        <p className="text-xs text-gray-500">{ref.email}</p>
                                      </div>
                                    </td>
                                    <td className="py-3 px-3 text-gray-400 text-xs">
                                      {new Date(ref.joinedAt).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="py-3 px-3">
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
                                    <td className="py-3 px-3 text-right">
                                      <span className={cn(
                                        'font-bold text-sm',
                                        ref.commission > 0 ? 'text-green-400' : 'text-gray-600'
                                      )}>
                                        R$ {fmt(ref.commission)}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Commissions Tab */}
        {activeTab === 'commissions' && (
          <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h2 className="font-bold">Todas as Comissões</h2>
              <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full">
                {filteredCommissions.length} registro{filteredCommissions.length !== 1 ? 's' : ''}
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-gray-500 text-sm">Carregando...</div>
            ) : filteredCommissions.length === 0 ? (
              <div className="p-12 text-center">
                <DollarSign size={40} className="text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500">Nenhuma comissão encontrada.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Data</th>
                        <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Indicador</th>
                        <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Indicado</th>
                        <th className="text-right px-6 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Rendimento</th>
                        <th className="text-right px-6 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Comissão (10%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredCommissions.map(c => (
                        <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4 text-gray-400 whitespace-nowrap">
                            {new Date(c.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-semibold text-white">{c.referrerName}</p>
                              <p className="text-xs text-gray-500">{c.referrerEmail}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5">
                              <ArrowUpRight size={14} className="text-blue-400 flex-shrink-0" />
                              <div>
                                <p className="font-semibold text-white">{c.referredName}</p>
                                <p className="text-xs text-gray-500">{c.referredEmail}</p>
                              </div>
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
                        <td colSpan={4} className="px-6 py-4 text-right text-sm text-gray-500 font-semibold">Total de comissões:</td>
                        <td className="px-6 py-4 text-right font-black text-green-400 text-lg">
                          R$ {fmt(totalComm)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default AdminNetwork;
