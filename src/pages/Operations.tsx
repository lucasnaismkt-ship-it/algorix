import React from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { useStore } from '@/lib/store';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Filter, 
  Download,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Operations = () => {
  const { operations } = useStore();

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold mb-2">Histórico de Operações</h1>
          <p className="text-gray-500">Acompanhe todas as simulações de arbitragem realizadas.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-white/10 bg-white/5 gap-2 rounded-xl">
            <Download size={18} /> Exportar CSV
          </Button>
        </div>
      </div>

      <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <Input 
                placeholder="Filtrar por par ou exchange..." 
                className="bg-white/5 border-white/10 pl-10 h-10 rounded-xl"
              />
            </div>
            <Button variant="ghost" size="icon" className="border border-white/10 rounded-xl">
              <Filter size={18} />
            </Button>
          </div>
          <div className="flex gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase">Total: {operations.length} operações</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-white/5">
                <th className="px-6 py-4 font-bold">Tipo / Par</th>
                <th className="px-6 py-4 font-bold">Exchange</th>
                <th className="px-6 py-4 font-bold">Preço</th>
                <th className="px-6 py-4 font-bold">Quantidade</th>
                <th className="px-6 py-4 font-bold">Lucro</th>
                <th className="px-6 py-4 font-bold">Data / Hora</th>
                <th className="px-6 py-4 font-bold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {operations.map((op) => (
                <tr key={op.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        op.type === 'BUY' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                      )}>
                        {op.type === 'BUY' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{op.pair}</p>
                        <p className="text-[10px] text-gray-500 uppercase font-bold">{op.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium">{op.exchange}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono">${op.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono">{op.amount.toFixed(4)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-green-400">+${op.profit.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-400">{new Date(op.timestamp).toLocaleDateString()}</p>
                    <p className="text-[10px] text-gray-500">{new Date(op.timestamp).toLocaleTimeString()}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase">
                      Concluído
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Operations;
