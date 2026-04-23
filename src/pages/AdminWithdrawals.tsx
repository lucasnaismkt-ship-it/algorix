import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { useStore } from '@/lib/store';
import {
  Wallet,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  X,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const AdminWithdrawals = () => {
  const { allTransactions, fetchAllTransactions, approveWithdrawal, rejectWithdrawal } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedWithdrawalId, setSelectedWithdrawalId] = useState<string>('');
  const [rejectReason, setRejectReason] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

  useEffect(() => {
    fetchAllTransactions();
    // Force refresh every 30 seconds to ensure data consistency
    const interval = setInterval(() => {
      console.log('Refresh automático das transações...');
      fetchAllTransactions();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchAllTransactions]);

  const withdrawals = allTransactions.filter(t => t.type === 'WITHDRAWAL');

  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    const search = searchTerm.toLowerCase();
    const userName = (withdrawal.userName || '').toLowerCase();
    const userEmail = (withdrawal.userEmail || '').toLowerCase();
    const notes = (withdrawal.notes || '').toLowerCase();
    
    const matchesSearch = userName.includes(search) || userEmail.includes(search) || notes.includes(search);
    
    const matchesStatus = statusFilter === 'ALL' || withdrawal.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status?: string) => {
    if (status === 'APPROVED') return 'text-green-500 bg-green-500/10 border-green-500/20';
    if (status === 'REJECTED') return 'text-red-500 bg-red-500/10 border-red-500/20';
    return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
  };

  const getStatusText = (status?: string) => {
    if (status === 'APPROVED') return 'Aprovado';
    if (status === 'REJECTED') return 'Rejeitado';
    return 'Pendente';
  };

  const getStatusIcon = (status?: string) => {
    if (status === 'APPROVED') return <CheckCircle2 size={12} />;
    if (status === 'REJECTED') return <XCircle size={12} />;
    return <AlertCircle size={12} />;
  };

  const handleApprove = async (withdrawalId: string, userId: string, amount: number) => {
    // Check if withdrawal is already processed
    const withdrawal = allTransactions.find(t => t.id === withdrawalId);
    if (withdrawal?.status === 'APPROVED') {
      toast.error('Este saque já foi aprovado!');
      return;
    }
    
    if (withdrawal?.status === 'REJECTED') {
      toast.error('Este saque já foi rejeitado!');
      return;
    }
    
    console.log('Botão aprovar saque clicado:', { withdrawalId, userId, amount });
    
    const success = await approveWithdrawal(withdrawalId, userId, amount);
    if (success) {
      console.log('Saque aprovado com sucesso, atualizando interfaces...');
      toast.success('Saque aprovado com sucesso!');
      fetchAllTransactions(); // Refresh admin data
      
      // Multiple refresh attempts to ensure user interface updates
      setTimeout(() => {
        console.log('Primeiro refresh forçado...');
        fetchAllTransactions();
        
        setTimeout(() => {
          console.log('Segundo refresh forçado...');
          fetchAllTransactions();
          
          setTimeout(() => {
            console.log('Terceiro refresh forçado...');
            fetchAllTransactions();
          }, 500);
        }, 500);
      }, 500);
      
    } else {
      console.error('Falha ao aprovar saque');
      toast.error('Erro ao aprovar saque. Tente novamente.');
    }
  };

  const handleReject = async () => {
    if (!selectedWithdrawalId || !rejectReason) {
      toast.error('Por favor, informe o motivo da rejeição.');
      return;
    }
    
    const withdrawal = allTransactions.find(t => t.id === selectedWithdrawalId);
    if (withdrawal?.status === 'APPROVED') {
      toast.error('Este saque já foi aprovado!');
      return;
    }
    
    if (withdrawal?.status === 'REJECTED') {
      toast.error('Este saque já foi rejeitado!');
      return;
    }
    
    const success = await rejectWithdrawal(selectedWithdrawalId, rejectReason);
    if (success) {
      toast.success('Saque rejeitado com sucesso!');
      fetchAllTransactions(); // Refresh data
      setRejectModalOpen(false);
      setRejectReason('');
      setSelectedWithdrawalId('');
    } else {
      toast.error('Erro ao rejeitar saque. Tente novamente.');
    }
  };

  const openRejectModal = (withdrawalId: string) => {
    setSelectedWithdrawalId(withdrawalId);
    setRejectModalOpen(true);
  };

  const totalWithdrawals = withdrawals.length;
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'PENDING').length;
  const totalAmount = withdrawals.reduce((sum, w) => sum + (w.amount * 5.50), 0);

  return (
    <AdminLayout>
      <div className="mb-12">
        <h1 className="text-4xl font-black tracking-tight mb-3">Gerenciamento de Saques</h1>
        <p className="text-gray-500 text-lg">Aprovar ou rejeitar solicitações de saque dos usuários.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-[#0d0d0d] border border-white/10 rounded-[32px] p-8 hover:border-red-500/50 transition-all group">
          <div className="w-14 h-14 bg-red-600/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-red-600 transition-colors">
            <Wallet className="text-red-500 group-hover:text-white" size={28} />
          </div>
          <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-1">Total de Saques</p>
          <h4 className="text-4xl font-black">{totalWithdrawals}</h4>
        </div>
        
        <div className="bg-[#0d0d0d] border border-white/10 rounded-[32px] p-8 hover:border-yellow-500/50 transition-all group">
          <div className="w-14 h-14 bg-yellow-600/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-yellow-600 transition-colors">
            <Clock className="text-yellow-500 group-hover:text-white" size={28} />
          </div>
          <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-1">Pendentes</p>
          <h4 className="text-4xl font-black">{pendingWithdrawals}</h4>
        </div>

        <div className="bg-[#0d0d0d] border border-white/10 rounded-[32px] p-8 hover:border-green-500/50 transition-all group">
          <div className="w-14 h-14 bg-green-600/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-600 transition-colors">
            <AlertCircle className="text-green-500 group-hover:text-white" size={28} />
          </div>
          <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-1">Valor Total (BRL)</p>
          <h4 className="text-4xl font-black">R${totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
        </div>
      </div>

      {/* Withdrawals Table */}
      <div className="bg-[#0d0d0d] border border-white/10 rounded-[40px] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold mb-1">Solicitações de Saque</h3>
            <p className="text-sm text-gray-500">Gerencie todas as solicitações em um único lugar.</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:flex-initial">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <Input 
                placeholder="Buscar por usuário..." 
                className="bg-white/5 border-white/10 pl-12 h-12 rounded-2xl focus:ring-blue-500/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 rounded-2xl h-12 px-4">
                  <Filter size={18} className="mr-2" />
                  {statusFilter === 'ALL' && 'Todos'}
                  {statusFilter === 'PENDING' && 'Pendentes'}
                  {statusFilter === 'APPROVED' && 'Aprovados'}
                  {statusFilter === 'REJECTED' && 'Rejeitados'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#111] border-white/10 text-white p-2 rounded-2xl">
                <DropdownMenuItem onClick={() => setStatusFilter('ALL')} className="cursor-pointer">
                  Todos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('PENDING')} className="cursor-pointer">
                  Pendentes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('APPROVED')} className="cursor-pointer">
                  Aprovados
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('REJECTED')} className="cursor-pointer">
                  Rejeitados
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-500 text-[10px] uppercase font-black tracking-[0.2em] border-b border-white/5">
                <th className="px-6 py-4">Usuário</th>
                <th className="px-6 py-4">Valor</th>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Observações</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredWithdrawals.map((withdrawal) => (
                <tr key={withdrawal.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center font-bold text-white">
                        {(withdrawal.userName || 'U').charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{withdrawal.userName || 'Sem Nome'}</p>
                        <p className="text-xs text-gray-500">{withdrawal.userEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-red-400">
                        R${(withdrawal.amount * 5.50).toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500">
                        (${withdrawal.amount.toFixed(2)} USD)
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {new Date(withdrawal.date).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(withdrawal.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border",
                      getStatusColor(withdrawal.status)
                    )}>
                      {getStatusIcon(withdrawal.status)}
                      {getStatusText(withdrawal.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-400 max-w-xs truncate" title={withdrawal.notes}>
                      {withdrawal.notes || 'Sem observações'}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:bg-white/10 rounded-xl">
                          <MoreVertical size={20} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#111] border-white/10 text-white p-2 rounded-2xl min-w-[200px]">
                        <DropdownMenuItem 
                          onClick={() => handleApprove(withdrawal.id, withdrawal.userId || '', withdrawal.amount)} 
                          className="gap-3 p-3 cursor-pointer hover:bg-white/5 rounded-xl text-green-400"
                          disabled={withdrawal.status === 'APPROVED' || withdrawal.status === 'REJECTED'}
                        >
                          <CheckCircle2 size={16} />
                          <span className="font-semibold text-sm">Aprovar Saque</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => openRejectModal(withdrawal.id)} 
                          className="gap-3 p-3 cursor-pointer hover:bg-white/5 rounded-xl text-red-400"
                          disabled={withdrawal.status === 'APPROVED' || withdrawal.status === 'REJECTED'}
                        >
                          <XCircle size={16} />
                          <span className="font-semibold text-sm">Rejeitar Saque</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {filteredWithdrawals.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-4 text-gray-500">
                      <Wallet size={48} className="mx-auto mb-4" />
                      <p className="text-lg font-medium">Nenhuma solicitação encontrada</p>
                      <p className="text-sm">Tente ajustar os filtros ou aguarde novas solicitações</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Rejeição */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="bg-[#0d0d0d] border border-white/10 text-white max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center">
                <XCircle className="text-red-500" size={24} />
              </div>
              Rejeitar Saque
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Informe o motivo da rejeição deste saque
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Label htmlFor="reject-reason" className="text-sm font-semibold text-gray-300 mb-2 block">
                Motivo da Rejeição
              </Label>
              <Input
                id="reject-reason"
                placeholder="Descreva o motivo..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-12 rounded-2xl focus:ring-red-500/50"
              />
            </div>
          </div>
          <DialogFooter className="gap-3 mt-8">
            <Button
              variant="ghost"
              onClick={() => {
                setRejectModalOpen(false);
                setRejectReason('');
                setSelectedWithdrawalId('');
              }}
              className="flex-1 h-12 rounded-2xl border border-white/10 hover:bg-white/5"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleReject}
              disabled={!rejectReason.trim()}
              className="flex-1 h-12 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg disabled:opacity-50"
            >
              Rejeitar Saque
              <ArrowRight className="ml-2" size={16} />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminWithdrawals;
