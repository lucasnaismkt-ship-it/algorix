import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { useStore } from '@/lib/store';
import {
  Search,
  MoreVertical,
  Edit2,
  Power,
  UserPlus,
  Filter,
  Mail,
  Calendar,
  ArrowDownCircle,
  ArrowUpCircle,
  TrendingUp,
  ArrowRight,
  Phone,
  CreditCard,
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

const AdminUsers = () => {
  const { users, fetchAllUsers, updateUserBalance, addTransaction, toggleUserStatus, conversionRate } = useStore();
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
  }, [fetchAllUsers]);

  const filteredUsers = users.filter(u => {
    const name = u.name?.toLowerCase() || '';
    const email = u.email?.toLowerCase() || '';
    const cpf = (u.cpf || '').replace(/\D/g, '');
    const search = searchTerm.toLowerCase();
    return name.includes(search) || email.includes(search) || cpf.includes(search.replace(/\D/g, ''));
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
      toast.error('Erro ao atualizar rendimento.');
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
      toast.error('Saldo insuficiente para este saque.');
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
    const success = await toggleUserStatus(userId);
    if (success) toast.success('Status alterado com sucesso!');
    else toast.error('Erro ao alterar status.');
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gerenciar Usuários</h1>
          <p className="text-gray-500">Visualize e controle todas as contas registradas na plataforma.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl gap-2">
          <UserPlus size={18} /> Novo Usuário
        </Button>
      </div>

      <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <Input
              placeholder="Buscar por nome ou e-mail..."
              className="bg-white/5 border-white/10 pl-10 h-12 rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="border-white/10 rounded-xl gap-2">
            <Filter size={18} /> Filtros
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-white/5">
                <th className="px-6 py-4 font-bold">Usuário</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Saldo Atual</th>
                <th className="px-6 py-4 font-bold">Cadastro</th>
                <th className="px-6 py-4 font-bold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-500 flex items-center justify-center font-bold">
                          {(user.name || 'U').charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{user.name || 'Sem Nome'}</p>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Mail size={10} /> {user.email}
                          </div>
                          {user.cpf && (
                            <div className="flex items-center gap-1 text-xs text-gray-600 mt-0.5">
                              <CreditCard size={10} /> {user.cpf}
                            </div>
                          )}
                          {user.phone && (
                            <div className="flex items-center gap-1 text-xs text-gray-600 mt-0.5">
                              <Phone size={10} /> {user.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-md text-[10px] font-bold uppercase",
                        user.status === 'ACTIVE' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                      )}>
                        {user.status === 'ACTIVE' ? 'Ativo' : 'Bloqueado'}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-bold text-sm font-mono">{fmtUSD(user.balance)}</p>
                      {fmtBRL(user.balance) && <p className="text-xs text-gray-500">{fmtBRL(user.balance)}</p>}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar size={12} /> {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="hover:bg-white/5">
                            <MoreVertical size={18} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#111] border-white/10 text-white w-52">
                          <DropdownMenuItem onClick={() => openDepositModal(user.id)} className="gap-2 cursor-pointer text-green-400 focus:text-green-300">
                            <ArrowDownCircle size={14} /> Registrar Aporte
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openWithdrawalModal(user.id)} className="gap-2 cursor-pointer text-red-400 focus:text-red-300">
                            <ArrowUpCircle size={14} /> Registrar Saque
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/10" />
                          <DropdownMenuItem onClick={() => openYieldModal(user.id)} className="gap-2 cursor-pointer text-blue-400 focus:text-blue-300">
                            <TrendingUp size={14} /> Atualizar Rendimento
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/10" />
                          <DropdownMenuItem onClick={() => handleToggleStatus(user.id)} className="gap-2 cursor-pointer">
                            <Power size={14} /> {user.status === 'ACTIVE' ? 'Bloquear' : 'Ativar'}
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

export default AdminUsers;
