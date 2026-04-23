import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { useStore } from '@/lib/store';
import {
  Users,
  DollarSign,
  Search,
  MoreVertical,
  Power,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Activity,
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet,
  Clock,
  AlertCircle,
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
import { fmtUSD, fmtBRL } from '@/lib/currency';

const AdminDashboard = () => {
  const { users, fetchAllUsers, updateUserBalance, addTransaction, toggleUserStatus, allTransactions, fetchAllTransactions, conversionRate } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
  const [yieldModalOpen, setYieldModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [yieldAmount, setYieldAmount] = useState('');
  const [depositNote, setDepositNote] = useState('');
  const [withdrawalNote, setWithdrawalNote] = useState('');
  const [yieldNote, setYieldNote] = useState('');

  useEffect(() => {
    fetchAllUsers();
    fetchAllTransactions();
  }, [fetchAllUsers, fetchAllTransactions]);

  const filteredUsers = users.filter(u => {
    const name = u.name?.toLowerCase() || '';
    const email = u.email?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return name.includes(search) || email.includes(search);
  });

  const handleYield = async () => {
    if (!selectedUser || !yieldAmount) return;
    
    const success = await updateUserBalance(selectedUser.id, Number(yieldAmount), yieldNote);
    if (success) {
      toast.success('Rendimento registrado com sucesso!');
      setYieldModalOpen(false);
      setYieldAmount('');
      setYieldNote('');
      setSelectedUser(null);
    } else {
      toast.error('Erro ao atualizar rendimento. Verifique as permissões.');
    }
  };

  const openDepositModal = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setDepositModalOpen(true);
    }
  };

  const openWithdrawalModal = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setWithdrawalModalOpen(true);
    }
  };

  const openYieldModal = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setYieldAmount(user.balance?.toString() || '0');
      setYieldModalOpen(true);
    }
  };

  const handleDeposit = async () => {
    if (!selectedUser || !depositAmount || Number(depositAmount) <= 0) return;
    
    const success = await addTransaction(selectedUser.id, 'DEPOSIT', Number(depositAmount), depositNote);
    if (success) {
      toast.success('Aporte registrado com sucesso!');
      setDepositModalOpen(false);
      setDepositAmount('');
      setDepositNote('');
      setSelectedUser(null);
    } else {
      toast.error('Erro ao registrar aporte.');
    }
  };

  const handleWithdrawal = async () => {
    if (!selectedUser || !withdrawalAmount || Number(withdrawalAmount) <= 0) return;
    
    if (Number(withdrawalAmount) > (selectedUser.balance || 0)) {
      toast.error('Saldo insuficiente.');
      return;
    }
    
    const success = await addTransaction(selectedUser.id, 'WITHDRAWAL', Number(withdrawalAmount), withdrawalNote);
    if (success) {
      toast.success('Saque registrado com sucesso!');
      setWithdrawalModalOpen(false);
      setWithdrawalAmount('');
      setWithdrawalNote('');
      setSelectedUser(null);
    } else {
      toast.error('Erro ao registrar saque.');
    }
  };

  const handleToggleStatus = async (userId: string) => {
    await toggleUserStatus(userId);
    toast.success('Status da conta modificado com sucesso.');
  };

  const totalBalance = users.reduce((acc, user) => acc + (user.balance || 0), 0);

  return (
    <AdminLayout>
      <div className="mb-12">
        <h1 className="text-4xl font-black tracking-tight mb-3">Visão Geral do Sistema</h1>
        <p className="text-gray-500 text-lg">Monitoramento em tempo real de usuários e ativos sob custódia.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-[#0d0d0d] border border-white/10 rounded-[32px] p-8 hover:border-blue-500/50 transition-all group">
          <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
            <Users className="text-blue-500 group-hover:text-white" size={28} />
          </div>
          <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-1">Total de Usuários</p>
          <h4 className="text-4xl font-black">{users.length}</h4>
        </div>
        
        <div className="bg-[#0d0d0d] border border-white/10 rounded-[32px] p-8 hover:border-green-500/50 transition-all group">
          <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-500 transition-colors">
            <DollarSign className="text-green-500 group-hover:text-white" size={28} />
          </div>
          <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-1">Custódia Total</p>
          <h4 className="text-4xl font-black">{fmtUSD(totalBalance)}</h4>
          {fmtBRL(totalBalance) && <p className="text-gray-500 text-sm mt-1">{fmtBRL(totalBalance)}</p>}
        </div>

        <div className="bg-[#0d0d0d] border border-white/10 rounded-[32px] p-8 hover:border-purple-500/50 transition-all group">
          <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-500 transition-colors">
            <Activity className="text-purple-500 group-hover:text-white" size={28} />
          </div>
          <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-1">Contas Ativas</p>
          <h4 className="text-4xl font-black">{users.filter(u => u.status === 'ACTIVE').length}</h4>
        </div>
      </div>

      <div className="bg-[#0d0d0d] border border-white/10 rounded-[40px] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold mb-1">Lista de Usuários</h3>
            <p className="text-sm text-gray-500">Gerencie permissões e saldos individuais.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <Input 
              placeholder="Buscar por nome ou e-mail..." 
              className="bg-white/5 border-white/10 pl-12 h-12 rounded-2xl focus:ring-blue-500/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-500 text-[10px] uppercase font-black tracking-[0.2em] border-b border-white/5">
                <th className="px-8 py-5">Identificação</th>
                <th className="px-8 py-5">Nível</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Saldo</th>
                <th className="px-8 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center font-bold text-lg shadow-lg">
                        {(user.name || 'U').charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-sm group-hover:text-blue-400 transition-colors">{user.name || 'Sem Nome'}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-8 py-6">
                    <span className={cn(
                      "text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-wider",
                      user.role === 'ADMIN' ? "bg-purple-500/10 text-purple-500" : "bg-blue-500/10 text-blue-500"
                    )}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                      user.status === 'ACTIVE' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                    )}>
                      <div className={cn("w-1.5 h-1.5 rounded-full", user.status === 'ACTIVE' ? "bg-green-500" : "bg-red-500")} />
                      {user.status === 'ACTIVE' ? 'Ativo' : 'Bloqueado'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-mono font-bold text-sm">{fmtUSD(user.balance || 0)}</p>
                    {fmtBRL(user.balance || 0) && <p className="text-xs text-gray-500">{fmtBRL(user.balance || 0)}</p>}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:bg-white/10 rounded-xl">
                          <MoreVertical size={20} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#111] border-white/10 text-white p-2 rounded-2xl min-w-[200px]">
                        <DropdownMenuItem onClick={() => openDepositModal(user.id)} className="gap-3 p-3 cursor-pointer hover:bg-white/5 rounded-xl text-green-400">
                          <ArrowDownCircle size={16} />
                          <span className="font-semibold text-sm">Registrar Aporte</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openWithdrawalModal(user.id)} className="gap-3 p-3 cursor-pointer hover:bg-white/5 rounded-xl text-red-400">
                          <ArrowUpCircle size={16} />
                          <span className="font-semibold text-sm">Registrar Saque</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/10 my-1" />
                        <DropdownMenuItem onClick={() => openYieldModal(user.id)} className="gap-3 p-3 cursor-pointer hover:bg-white/5 rounded-xl text-blue-400">
                          <TrendingUp size={16} />
                          <span className="font-semibold text-sm">Atualizar Rendimento</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/10 my-1" />
                        <DropdownMenuItem onClick={() => handleToggleStatus(user.id)} className="gap-3 p-3 cursor-pointer hover:bg-white/5 rounded-xl">
                          <Power size={16} className={user.status === 'ACTIVE' ? "text-red-500" : "text-green-500"} />
                          <span className="font-semibold text-sm">{user.status === 'ACTIVE' ? 'Bloquear Conta' : 'Ativar Conta'}</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Aporte */}
      <Dialog open={depositModalOpen} onOpenChange={setDepositModalOpen}>
        <DialogContent className="bg-[#0d0d0d] border border-white/10 text-white max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center">
                <ArrowDownCircle className="text-green-500" size={24} />
              </div>
              Registrar Aporte
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Adicionar fundos à conta de {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Label htmlFor="deposit-amount" className="text-sm font-semibold text-gray-300 mb-2 block">
                Valor do Aporte (USD)
              </Label>
              <Input
                id="deposit-amount"
                type="number"
                placeholder="0.00"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-12 rounded-2xl focus:ring-green-500/50"
              />
            </div>
            <div>
              <Label htmlFor="deposit-note" className="text-sm font-semibold text-gray-300 mb-2 block">
                Observação (opcional)
              </Label>
              <Input
                id="deposit-note"
                placeholder="Detalhes do aporte..."
                value={depositNote}
                onChange={(e) => setDepositNote(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-12 rounded-2xl focus:ring-green-500/50"
              />
            </div>
            {selectedUser && (
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <p className="text-xs text-gray-500 mb-1">Saldo Atual</p>
                <p className="text-xl font-bold">{fmtUSD(selectedUser.balance || 0)}</p>
                {fmtBRL(selectedUser.balance || 0) && <p className="text-sm text-gray-500">{fmtBRL(selectedUser.balance || 0)}</p>}
                {depositAmount && Number(depositAmount) > 0 && (
                  <>
                    <p className="text-xs text-gray-500 mb-1 mt-3">Novo Saldo</p>
                    <p className="text-xl font-bold text-green-500">{fmtUSD((selectedUser.balance || 0) + Number(depositAmount))}</p>
                    {fmtBRL((selectedUser.balance || 0) + Number(depositAmount)) && <p className="text-sm text-gray-400">{fmtBRL((selectedUser.balance || 0) + Number(depositAmount))}</p>}
                  </>
                )}
              </div>
            )}
          </div>
          <DialogFooter className="gap-3 mt-8">
            <Button
              variant="ghost"
              onClick={() => {
                setDepositModalOpen(false);
                setDepositAmount('');
                setDepositNote('');
                setSelectedUser(null);
              }}
              className="flex-1 h-12 rounded-2xl border border-white/10 hover:bg-white/5"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDeposit}
              disabled={!depositAmount || Number(depositAmount) <= 0}
              className="flex-1 h-12 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg disabled:opacity-50"
            >
              Confirmar Aporte
              <ArrowRight className="ml-2" size={16} />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Saque */}
      <Dialog open={withdrawalModalOpen} onOpenChange={setWithdrawalModalOpen}>
        <DialogContent className="bg-[#0d0d0d] border border-white/10 text-white max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center">
                <ArrowUpCircle className="text-red-500" size={24} />
              </div>
              Registrar Saque
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Retirar fundos da conta de {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Label htmlFor="withdrawal-amount" className="text-sm font-semibold text-gray-300 mb-2 block">
                Valor do Saque (USD)
              </Label>
              <Input
                id="withdrawal-amount"
                type="number"
                placeholder="0.00"
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-12 rounded-2xl focus:ring-red-500/50"
              />
            </div>
            <div>
              <Label htmlFor="withdrawal-note" className="text-sm font-semibold text-gray-300 mb-2 block">
                Observação (opcional)
              </Label>
              <Input
                id="withdrawal-note"
                placeholder="Detalhes do saque..."
                value={withdrawalNote}
                onChange={(e) => setWithdrawalNote(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-12 rounded-2xl focus:ring-red-500/50"
              />
            </div>
            {selectedUser && (
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <p className="text-xs text-gray-500 mb-1">Saldo Disponível</p>
                <p className="text-xl font-bold">{fmtUSD(selectedUser.balance || 0)}</p>
                {fmtBRL(selectedUser.balance || 0) && <p className="text-sm text-gray-500">{fmtBRL(selectedUser.balance || 0)}</p>}
                {withdrawalAmount && Number(withdrawalAmount) > 0 && (
                  <>
                    <p className="text-xs text-gray-500 mb-1 mt-3">Saldo Restante</p>
                    <p className={`text-xl font-bold ${Number(withdrawalAmount) > (selectedUser.balance || 0) ? 'text-red-500' : 'text-blue-500'}`}>
                      {fmtUSD(Math.max(0, (selectedUser.balance || 0) - Number(withdrawalAmount)))}
                    </p>
                    {fmtBRL(Math.max(0, (selectedUser.balance || 0) - Number(withdrawalAmount))) && <p className="text-sm text-gray-500">{fmtBRL(Math.max(0, (selectedUser.balance || 0) - Number(withdrawalAmount)))}</p>}
                  </>
                )}
              </div>
            )}
          </div>
          <DialogFooter className="gap-3 mt-8">
            <Button
              variant="ghost"
              onClick={() => {
                setWithdrawalModalOpen(false);
                setWithdrawalAmount('');
                setWithdrawalNote('');
                setSelectedUser(null);
              }}
              className="flex-1 h-12 rounded-2xl border border-white/10 hover:bg-white/5"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleWithdrawal}
              disabled={!withdrawalAmount || Number(withdrawalAmount) <= 0 || Number(withdrawalAmount) > (selectedUser?.balance || 0)}
              className="flex-1 h-12 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg disabled:opacity-50"
            >
              Confirmar Saque
              <ArrowRight className="ml-2" size={16} />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Rendimento */}
      <Dialog open={yieldModalOpen} onOpenChange={setYieldModalOpen}>
        <DialogContent className="bg-[#0d0d0d] border border-white/10 text-white max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                <TrendingUp className="text-blue-500" size={24} />
              </div>
              Atualizar Rendimento
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Atualizar saldo final de {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Label htmlFor="yield-amount" className="text-sm font-semibold text-gray-300 mb-2 block">
                Novo Saldo Final (USD)
              </Label>
              <Input
                id="yield-amount"
                type="number"
                placeholder="0.00"
                value={yieldAmount}
                onChange={(e) => setYieldAmount(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-12 rounded-2xl focus:ring-blue-500/50"
              />
            </div>
            <div>
              <Label htmlFor="yield-note" className="text-sm font-semibold text-gray-300 mb-2 block">
                Observação (opcional)
              </Label>
              <Input
                id="yield-note"
                placeholder="Detalhes do rendimento..."
                value={yieldNote}
                onChange={(e) => setYieldNote(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-12 rounded-2xl focus:ring-blue-500/50"
              />
            </div>
            {selectedUser && (
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <p className="text-xs text-gray-500 mb-1">Saldo Anterior</p>
                <p className="text-xl font-bold">{fmtUSD(selectedUser.balance || 0)}</p>
                {fmtBRL(selectedUser.balance || 0) && <p className="text-sm text-gray-500">{fmtBRL(selectedUser.balance || 0)}</p>}
                {yieldAmount && Number(yieldAmount) > 0 && (
                  <>
                    <p className="text-xs text-gray-500 mb-1 mt-3">Rendimento</p>
                    <p className={`text-xl font-bold ${Number(yieldAmount) >= (selectedUser.balance || 0) ? 'text-green-500' : 'text-red-500'}`}>
                      {Number(yieldAmount) >= (selectedUser.balance || 0) ? '+' : ''}
                      {fmtUSD(Number(yieldAmount) - (selectedUser.balance || 0))}
                    </p>
                    {fmtBRL(Number(yieldAmount) - (selectedUser.balance || 0)) && (
                      <p className="text-sm text-gray-500">
                        {Number(yieldAmount) >= (selectedUser.balance || 0) ? '+' : ''}
                        {fmtBRL(Number(yieldAmount) - (selectedUser.balance || 0))}
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          <DialogFooter className="gap-3 mt-8">
            <Button
              variant="ghost"
              onClick={() => {
                setYieldModalOpen(false);
                setYieldAmount('');
                setYieldNote('');
                setSelectedUser(null);
              }}
              className="flex-1 h-12 rounded-2xl border border-white/10 hover:bg-white/5"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleYield}
              disabled={!yieldAmount || Number(yieldAmount) <= 0}
              className="flex-1 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg disabled:opacity-50"
            >
              Atualizar Saldo
              <ArrowRight className="ml-2" size={16} />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminDashboard;