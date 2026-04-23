import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { useStore } from '@/lib/store';
import { FileText, TrendingUp, ArrowUpRight, ArrowDownRight, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fmtUSD, fmtBRL } from '@/lib/currency';

type Tab = 'rendimentos' | 'movimentacoes';

const Reports = () => {
  const { currentUser, dailyReports, transactions, fetchDailyReports, fetchTransactions, conversionRate } = useStore();
  const [tab, setTab] = useState<Tab>('rendimentos');

  useEffect(() => {
    if (currentUser) {
      fetchDailyReports(currentUser.id);
      fetchTransactions(currentUser.id);
    }
  }, [currentUser?.id]);

  if (!currentUser) return null;

  const totalProfit = dailyReports.reduce((acc, r) => acc + r.profit, 0);
  const totalDeposits = transactions.filter(t => t.type === 'DEPOSIT').reduce((acc, t) => acc + t.amount, 0);
  const totalWithdrawals = transactions.filter(t => t.type === 'WITHDRAWAL').reduce((acc, t) => acc + t.amount, 0);

  return (
    <DashboardLayout>
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Meus Relatórios</h1>
        <p className="text-gray-500">Histórico completo de rendimentos, aportes e saques.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl p-6">
          <div className="w-10 h-10 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-3">
            <FileText className="text-blue-500" size={20} />
          </div>
          <p className="text-gray-500 text-xs mb-1">Rendimentos registrados</p>
          <h4 className="text-2xl font-bold">{dailyReports.length}</h4>
        </div>
        <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl p-6">
          <div className="w-10 h-10 bg-green-500/10 rounded-2xl flex items-center justify-center mb-3">
            <TrendingUp className="text-green-500" size={20} />
          </div>
          <p className="text-gray-500 text-xs mb-1">Lucro total gerado</p>
          <h4 className={cn("text-2xl font-bold", totalProfit >= 0 ? "text-green-400" : "text-red-400")}>
            {totalProfit >= 0 ? '+' : ''}{fmtUSD(totalProfit)}
          </h4>
          {fmtBRL(totalProfit) && <p className="text-sm text-gray-500 mt-0.5">{totalProfit >= 0 ? '+' : ''}{fmtBRL(totalProfit)}</p>}
        </div>
        <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl p-6">
          <div className="w-10 h-10 bg-green-500/10 rounded-2xl flex items-center justify-center mb-3">
            <ArrowDownCircle className="text-green-500" size={20} />
          </div>
          <p className="text-gray-500 text-xs mb-1">Total aportado</p>
          <h4 className="text-2xl font-bold text-green-400">{fmtUSD(totalDeposits)}</h4>
          {fmtBRL(totalDeposits) && <p className="text-sm text-gray-500 mt-0.5">{fmtBRL(totalDeposits)}</p>}
        </div>
        <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl p-6">
          <div className="w-10 h-10 bg-red-500/10 rounded-2xl flex items-center justify-center mb-3">
            <ArrowUpCircle className="text-red-500" size={20} />
          </div>
          <p className="text-gray-500 text-xs mb-1">Total sacado</p>
          <h4 className="text-2xl font-bold text-red-400">{fmtUSD(totalWithdrawals)}</h4>
          {fmtBRL(totalWithdrawals) && <p className="text-sm text-gray-500 mt-0.5">{fmtBRL(totalWithdrawals)}</p>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('rendimentos')}
          className={cn(
            "px-5 py-2 rounded-xl text-sm font-bold transition-all",
            tab === 'rendimentos' ? "bg-blue-600 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"
          )}
        >
          Rendimentos Diários
        </button>
        <button
          onClick={() => setTab('movimentacoes')}
          className={cn(
            "px-5 py-2 rounded-xl text-sm font-bold transition-all",
            tab === 'movimentacoes' ? "bg-blue-600 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"
          )}
        >
          Aportes e Saques
        </button>
      </div>

      {/* Rendimentos tab */}
      {tab === 'rendimentos' && (
        <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <h3 className="text-lg font-bold">Histórico de Rendimentos</h3>
          </div>
          {dailyReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <FileText size={48} className="text-gray-700 mb-4" />
              <p className="text-gray-400 font-semibold">Nenhum rendimento registrado ainda.</p>
              <p className="text-gray-600 text-sm mt-1">Os rendimentos aparecerão aqui após o administrador atualizar seu saldo.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Data</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Saldo Anterior</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Saldo Novo</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rendimento</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">%</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Observação</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyReports.map((r, i) => (
                    <tr key={r.id} className={cn("border-b border-white/5 hover:bg-white/[0.02] transition-colors", i % 2 !== 0 && 'bg-white/[0.01]')}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", r.profit >= 0 ? "bg-green-500/10" : "bg-red-500/10")}>
                            {r.profit >= 0 ? <ArrowUpRight size={15} className="text-green-500" /> : <ArrowDownRight size={15} className="text-red-500" />}
                          </div>
                          <span className="text-sm font-semibold">{new Date(r.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-400 font-mono block">{fmtUSD(r.previousBalance)}</span>
                        {fmtBRL(r.previousBalance) && <span className="text-xs text-gray-600">{fmtBRL(r.previousBalance)}</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold font-mono block">{fmtUSD(r.newBalance)}</span>
                        {fmtBRL(r.newBalance) && <span className="text-xs text-gray-500">{fmtBRL(r.newBalance)}</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn("text-sm font-bold font-mono block", r.profit >= 0 ? "text-green-400" : "text-red-400")}>
                          {r.profit >= 0 ? '+' : ''}{fmtUSD(r.profit)}
                        </span>
                        {fmtBRL(r.profit) && <span className="text-xs text-gray-500">{r.profit >= 0 ? '+' : ''}{fmtBRL(r.profit)}</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn("text-xs font-bold px-2 py-1 rounded-lg", r.profitPercentage >= 0 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400")}>
                          {r.profitPercentage >= 0 ? '+' : ''}{r.profitPercentage.toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{r.notes || <span className="text-gray-700">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Movimentações tab */}
      {tab === 'movimentacoes' && (
        <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <h3 className="text-lg font-bold">Aportes e Saques</h3>
          </div>
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <ArrowDownCircle size={48} className="text-gray-700 mb-4" />
              <p className="text-gray-400 font-semibold">Nenhuma movimentação registrada.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Data</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Valor</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Observação</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t, i) => (
                    <tr key={t.id} className={cn("border-b border-white/5 hover:bg-white/[0.02] transition-colors", i % 2 !== 0 && 'bg-white/[0.01]')}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", t.type === 'DEPOSIT' ? "bg-green-500/10" : "bg-red-500/10")}>
                            {t.type === 'DEPOSIT' ? <ArrowDownCircle size={15} className="text-green-500" /> : <ArrowUpCircle size={15} className="text-red-500" />}
                          </div>
                          <span className="text-sm font-semibold">{new Date(t.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn("text-xs font-bold px-2 py-1 rounded-lg", t.type === 'DEPOSIT' ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400")}>
                          {t.type === 'DEPOSIT' ? 'Aporte' : 'Saque'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn("text-sm font-bold font-mono block", t.type === 'DEPOSIT' ? "text-green-400" : "text-red-400")}>
                          {t.type === 'DEPOSIT' ? '+' : '-'}{fmtUSD(t.amount)}
                        </span>
                        {fmtBRL(t.amount) && <span className="text-xs text-gray-500">{t.type === 'DEPOSIT' ? '+' : '-'}{fmtBRL(t.amount)}</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{t.notes || <span className="text-gray-700">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Reports;
