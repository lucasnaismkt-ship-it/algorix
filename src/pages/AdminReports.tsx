import React, { useEffect, useMemo } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { useStore } from '@/lib/store';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Download,
  TrendingUp,
  Users,
  Zap,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Globe,
  Calendar,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const COLORS = ['#2563eb', '#7c3aed', '#db2777', '#f59e0b', '#10b981', '#6366f1'];

const MetricCard = ({ title, value, icon: Icon, trend, color }: any) => {
  const colorClasses: any = {
    blue: "bg-blue-600/10 text-blue-500",
    green: "bg-green-500/10 text-green-500",
    yellow: "bg-yellow-500/10 text-yellow-500",
    purple: "bg-purple-500/10 text-purple-500",
  };
  return (
    <div className="bg-[#0d0d0d] border border-white/10 rounded-[32px] p-8 hover:border-white/20 transition-all group">
      <div className="flex items-center justify-between mb-6">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", colorClasses[color])}>
          <Icon size={24} />
        </div>
        {trend && (
          <span className="text-xs font-black text-green-500 bg-green-500/10 px-2 py-1 rounded-lg">{trend}</span>
        )}
      </div>
      <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.2em] mb-1">{title}</p>
      <h4 className="text-3xl font-black tracking-tight">{value}</h4>
    </div>
  );
};

const AdminReports = () => {
  const { users, operations, allDailyReports, fetchAllUsers, fetchAllOperations, fetchAllDailyReports } = useStore();

  useEffect(() => {
    fetchAllUsers();
    fetchAllOperations();
    fetchAllDailyReports();
  }, [fetchAllUsers, fetchAllOperations, fetchAllDailyReports]);

  const metrics = useMemo(() => {
    const totalProfit = operations.reduce((acc, op) => acc + op.profit, 0);
    const totalVolume = operations.reduce((acc, op) => acc + (op.price * op.amount), 0);
    const avgProfit = operations.length > 0 ? totalProfit / operations.length : 0;

    const pairDistribution = operations.reduce((acc: any, op) => {
      acc[op.pair] = (acc[op.pair] || 0) + 1;
      return acc;
    }, {});
    const pieData = Object.keys(pairDistribution)
      .map(name => ({ name, value: pairDistribution[name] }))
      .sort((a, b) => b.value - a.value).slice(0, 5);

    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const volumeData = last7Days.map(date => {
      const dayOps = operations.filter(op => op.timestamp.startsWith(date));
      return {
        name: new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short' }),
        volume: dayOps.reduce((acc, op) => acc + (op.price * op.amount), 0),
        profit: dayOps.reduce((acc, op) => acc + op.profit, 0),
      };
    });

    const growthData = [
      { name: 'Jan', users: Math.floor(users.length * 0.4) },
      { name: 'Fev', users: Math.floor(users.length * 0.5) },
      { name: 'Mar', users: Math.floor(users.length * 0.7) },
      { name: 'Abr', users: Math.floor(users.length * 0.8) },
      { name: 'Mai', users: Math.floor(users.length * 0.9) },
      { name: 'Jun', users: users.length },
    ];

    // Daily reports summary
    const dailyTotalProfit = allDailyReports.reduce((acc, r) => acc + r.profit, 0);
    const dailyPositiveDays = allDailyReports.filter(r => r.profit > 0).length;

    return { totalProfit, totalVolume, avgProfit, pieData, volumeData, growthData, dailyTotalProfit, dailyPositiveDays };
  }, [users, operations, allDailyReports]);

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-3">Relatórios</h1>
          <p className="text-gray-500 text-lg">Atualizações de saldo diárias e análises da plataforma.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 rounded-2xl gap-2 h-12 px-6 shadow-lg shadow-blue-600/20">
          <Download size={18} /> Exportar Dados
        </Button>
      </div>

      {/* Daily Reports Section */}
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <FileText size={20} className="text-blue-500" /> Relatórios Diários de Saldo
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <MetricCard title="Total de Relatórios" value={allDailyReports.length} icon={FileText} color="blue" />
          <MetricCard
            title="Lucro Total Distribuído"
            value={`$${metrics.dailyTotalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={TrendingUp}
            color="green"
          />
          <MetricCard title="Dias com Resultado Positivo" value={metrics.dailyPositiveDays} icon={Activity} color="purple" />
        </div>

        <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl overflow-hidden">
          {allDailyReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText size={48} className="text-gray-700 mb-4" />
              <p className="text-gray-400 font-semibold">Nenhum relatório gerado ainda.</p>
              <p className="text-gray-600 text-sm mt-1">Atualize o saldo de um usuário para gerar o primeiro relatório.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Data</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Usuário</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Saldo Anterior</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Saldo Novo</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Resultado</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rentabilidade</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Observação</th>
                  </tr>
                </thead>
                <tbody>
                  {allDailyReports.map((r, i) => (
                    <tr key={r.id} className={cn("border-b border-white/5 hover:bg-white/[0.03] transition-colors", i % 2 !== 0 && 'bg-white/[0.01]')}>
                      <td className="px-6 py-4 text-sm font-semibold">
                        {new Date(r.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-bold">{r.userName || '—'}</p>
                          <p className="text-xs text-gray-500">{r.userEmail}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400 font-mono">
                        ${r.previousBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold font-mono">
                        ${r.newBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          {r.profit >= 0
                            ? <ArrowUpRight size={14} className="text-green-500" />
                            : <ArrowDownRight size={14} className="text-red-500" />}
                          <span className={cn("text-sm font-bold font-mono", r.profit >= 0 ? "text-green-400" : "text-red-400")}>
                            {r.profit >= 0 ? '+' : ''}${r.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "text-xs font-bold px-2 py-1 rounded-lg",
                          r.profitPercentage >= 0 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                        )}>
                          {r.profitPercentage >= 0 ? '+' : ''}{r.profitPercentage.toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {r.notes || <span className="text-gray-700">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Operations Analytics */}
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Activity size={20} className="text-purple-500" /> Análise de Operações
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard title="Volume Total" value={`$${(metrics.totalVolume / 1000).toFixed(1)}k`} icon={Globe} color="blue" />
        <MetricCard title="Lucro Gerado" value={`$${metrics.totalProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={TrendingUp} color="green" />
        <MetricCard title="Média por Trade" value={`$${metrics.avgProfit.toFixed(2)}`} icon={Zap} color="yellow" />
        <MetricCard title="Usuários Ativos" value={users.filter(u => u.status === 'ACTIVE').length} icon={Users} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#0d0d0d] border border-white/10 rounded-[40px] p-10">
          <h3 className="text-2xl font-bold mb-8">Volume vs Lucro (7 dias)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.volumeData}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" stroke="#444" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis stroke="#444" fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '16px' }} />
                <Area type="monotone" dataKey="volume" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorVolume)" />
                <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0d0d0d] border border-white/10 rounded-[40px] p-10">
          <h3 className="text-2xl font-bold mb-2">Ativos Populares</h3>
          <p className="text-sm text-gray-500 mb-8">Por número de operações.</p>
          {metrics.pieData.length > 0 ? (
            <>
              <div className="h-[220px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={metrics.pieData} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                      {metrics.pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black">{operations.length}</span>
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Trades</span>
                </div>
              </div>
              <div className="space-y-3 mt-6">
                {metrics.pieData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                      <span className="text-sm text-gray-400">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-gray-600 text-sm">Sem operações registradas.</div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReports;
