import React, { useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { useStore } from '@/lib/store';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Wallet
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { cn } from '@/lib/utils';
import { fmtUSD, fmtBRL, toBRL } from '@/lib/currency';

const StatCard = ({ title, usd, brl, icon: Icon, trend, trendUp }: any) => (
  <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl p-6 hover:border-blue-500/30 transition-all group">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-blue-600/10 transition-colors">
        <Icon className="text-gray-400 group-hover:text-blue-500 transition-colors" size={24} />
      </div>
      {trend && (
        <span className={cn(
          "text-xs font-bold px-2 py-1 rounded-lg",
          trendUp ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
        )}>
          {trend}
        </span>
      )}
    </div>
    <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
    {usd !== undefined ? (
      <div>
        <h4 className="text-2xl font-bold tracking-tight">{usd}</h4>
        {brl && <p className="text-sm text-gray-500 font-medium mt-0.5">{brl}</p>}
      </div>
    ) : null}
  </div>
);

const Dashboard = () => {
  const { currentUser, operations, dailyReports, fetchDailyReports, conversionRate } = useStore();

  useEffect(() => {
    if (currentUser) {
      fetchDailyReports(currentUser.id);
    }
  }, [currentUser?.id]);

  if (!currentUser) return null;

  const latestReport = dailyReports[0];
  const dailyReturnPct = latestReport ? latestReport.profitPercentage : null;
  const dailyProfit = latestReport ? latestReport.profit : null;

  // Chart: cumulative daily profits starting from 0
  const chartData = (() => {
    const points: { name: string; value: number }[] = [{ name: 'Início', value: 0 }];
    let cumulative = 0;
    [...dailyReports].reverse().forEach(r => {
      cumulative = parseFloat((cumulative + r.profit).toFixed(2));
      points.push({
        name: new Date(r.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        value: cumulative,
      });
    });
    if (points.length === 1) points.push({ name: 'Hoje', value: 0 });
    return points;
  })();

  return (
    <DashboardLayout>
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Olá, {(currentUser.name || 'Usuário').split(' ')[0]}! 👋</h1>
          <p className="text-gray-500">Aqui está o resumo da sua performance hoje.</p>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard
          title="Saldo Total"
          usd={fmtUSD(currentUser.balance)}
          brl={fmtBRL(currentUser.balance)}
          icon={Wallet}
          trend={latestReport ? `${latestReport.profit >= 0 ? '+' : ''}${fmtUSD(latestReport.profit)} hoje` : undefined}
          trendUp={latestReport ? latestReport.profit >= 0 : true}
        />
        <StatCard
          title="Lucro Hoje"
          usd={latestReport ? `${latestReport.profit >= 0 ? '+' : ''}${fmtUSD(latestReport.profit)}` : '$0,00'}
          brl={latestReport ? `${latestReport.profit >= 0 ? '+' : ''}${fmtBRL(latestReport.profit)}` : 'R$\u00a00,00'}
          icon={TrendingUp}
          trend={latestReport ? `${latestReport.profitPercentage >= 0 ? '+' : ''}${latestReport.profitPercentage.toFixed(2)}%` : undefined}
          trendUp={latestReport ? latestReport.profit >= 0 : true}
        />
        <StatCard
          title="Rentabilidade Diária"
          usd={dailyReturnPct !== null ? `${dailyReturnPct >= 0 ? '+' : ''}${dailyReturnPct.toFixed(2)}%` : '—'}
          brl={dailyProfit !== null ? `${dailyProfit >= 0 ? '+' : ''}${fmtBRL(dailyProfit)}` : ''}
          icon={Percent}
          trend={dailyProfit !== null ? `${dailyProfit >= 0 ? '+' : ''}${fmtUSD(dailyProfit)}` : undefined}
          trendUp={dailyProfit !== null ? dailyProfit >= 0 : true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#0d0d0d] border border-white/10 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">Rendimentos Acumulados</h3>
            <span className="text-xs text-gray-500">Desde o início</span>
          </div>
          <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => v >= 1000 ? `$${(v/1000).toFixed(1)}k` : `$${v.toFixed(2)}`} />
                  <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} />
                  <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
        </div>

        <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">Últimos Relatórios</h3>
            <Activity size={20} className="text-blue-500" />
          </div>
          <div className="space-y-5">
            {dailyReports.length === 0 && (
              <p className="text-gray-600 text-sm text-center py-6">Nenhum relatório ainda.</p>
            )}
            {dailyReports.slice(0, 5).map((r) => (
              <div key={r.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                    r.profit >= 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                  )}>
                    {r.profit >= 0 ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{new Date(r.date + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[100px]">{r.notes || 'Atualização diária'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn("text-sm font-bold", r.profit >= 0 ? "text-green-400" : "text-red-400")}>
                    {r.profit >= 0 ? '+' : ''}{fmtUSD(r.profit)}
                  </p>
                  {fmtBRL(r.profit) && <p className="text-[10px] text-gray-500">{r.profit >= 0 ? '+' : ''}{fmtBRL(r.profit)}</p>}
                </div>
              </div>
            ))}
          </div>
          <Link to="/dashboard/reports" className="block w-full mt-8 py-3 text-sm font-bold text-gray-400 hover:text-white border border-white/5 hover:bg-white/5 rounded-xl transition-all text-center">
            Ver Histórico Completo
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
