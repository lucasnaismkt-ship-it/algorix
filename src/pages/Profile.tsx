import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Bell, Lock, Eye, EyeOff, CheckCircle, XCircle, AlertTriangle, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const formatCPF = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

const validateCPF = (cpf: string) => {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  if (r !== parseInt(digits[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  return r === parseInt(digits[10]);
};

const Profile = () => {
  const { currentUser, fetchProfile } = useStore();

  // Personal info state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoMsg, setInfoMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setCpf(currentUser.cpf || '');
    }
  }, [currentUser]);

  if (!currentUser) return null;

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoMsg(null);
    if (!name.trim()) {
      setInfoMsg({ type: 'error', text: 'O nome não pode ficar vazio.' });
      return;
    }
    if (cpf && !validateCPF(cpf)) {
      setInfoMsg({ type: 'error', text: 'CPF inválido. Verifique e tente novamente.' });
      return;
    }
    setSavingInfo(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        name: name.trim(),
        phone: phone.trim() || null,
        cpf: cpf.trim() || null,
      })
      .eq('id', currentUser.id);

    if (error) {
      setInfoMsg({ type: 'error', text: 'Erro ao salvar. Tente novamente.' });
    } else {
      await fetchProfile(currentUser.id);
      setInfoMsg({ type: 'success', text: 'Informações atualizadas com sucesso!' });
      setTimeout(() => setInfoMsg(null), 3000);
    }
    setSavingInfo(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'A nova senha deve ter pelo menos 6 caracteres.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'As senhas não coincidem.' });
      return;
    }
    setSavingPassword(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: currentUser.email,
      password: currentPassword,
    });
    if (signInError) {
      setPasswordMsg({ type: 'error', text: 'Senha atual incorreta.' });
      setSavingPassword(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) {
      setPasswordMsg({ type: 'error', text: 'Erro ao atualizar a senha. Tente novamente.' });
    } else {
      setPasswordMsg({ type: 'success', text: 'Senha alterada com sucesso!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setShowPasswordForm(false);
        setPasswordMsg(null);
      }, 2000);
    }
    setSavingPassword(false);
  };

  return (
    <DashboardLayout>
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Meu Perfil</h1>
        <p className="text-gray-500">Gerencie suas informações pessoais e segurança.</p>
      </div>

      {!currentUser.cpf && (
        <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl px-5 py-4 mb-8">
          <AlertTriangle size={18} className="text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-300">CPF não cadastrado</p>
            <p className="text-xs text-yellow-500 mt-0.5">
              Para saques e conformidade regulatória, seu CPF é obrigatório. Preencha o campo abaixo e salve.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">

          {/* Personal Info */}
          <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center">
                <User className="text-blue-500" size={24} />
              </div>
              <h3 className="text-xl font-bold">Informações Pessoais</h3>
            </div>

            <form onSubmit={handleSaveInfo}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Nome Completo</Label>
                  <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="bg-white/5 border-white/10 h-12 rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input
                    value={currentUser.email}
                    className="bg-white/5 border-white/10 h-12 rounded-xl opacity-50"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone / WhatsApp</Label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+55 (11) 99999-9999"
                    className="bg-white/5 border-white/10 h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <CreditCard size={14} className="text-gray-400" />
                    CPF
                    {!currentUser.cpf && (
                      <span className="text-xs font-semibold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full">Pendente</span>
                    )}
                  </Label>
                  <Input
                    value={cpf}
                    onChange={e => setCpf(formatCPF(e.target.value))}
                    placeholder="000.000.000-00"
                    className={`bg-white/5 border-white/10 h-12 rounded-xl ${!currentUser.cpf ? 'border-yellow-500/40 focus:border-yellow-400' : ''}`}
                    maxLength={14}
                  />
                </div>
              </div>

              {infoMsg && (
                <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl border mt-6 ${
                  infoMsg.type === 'success'
                    ? 'text-green-400 bg-green-500/10 border-green-500/20'
                    : 'text-red-400 bg-red-500/10 border-red-500/20'
                }`}>
                  {infoMsg.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                  {infoMsg.text}
                </div>
              )}

              <Button
                type="submit"
                disabled={savingInfo}
                className="mt-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl px-8"
              >
                {savingInfo ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </form>
          </div>

          {/* Security */}
          <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-purple-600/10 rounded-2xl flex items-center justify-center">
                <Lock className="text-purple-500" size={24} />
              </div>
              <h3 className="text-xl font-bold">Segurança</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <div>
                  <p className="font-bold">Autenticação de Dois Fatores (2FA)</p>
                  <p className="text-sm text-gray-500">Adicione uma camada extra de segurança à sua conta.</p>
                </div>
                <Button variant="outline" className="border-white/10 rounded-xl">Ativar</Button>
              </div>

              <div className="bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
                <div className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-bold">Alterar Senha</p>
                    <p className="text-sm text-gray-500">Recomendamos trocar sua senha a cada 90 dias.</p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-white/10 rounded-xl"
                    onClick={() => {
                      setShowPasswordForm(!showPasswordForm);
                      setPasswordMsg(null);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                  >
                    {showPasswordForm ? 'Cancelar' : 'Alterar'}
                  </Button>
                </div>

                {showPasswordForm && (
                  <form onSubmit={handleChangePassword} className="px-4 pb-4 space-y-4 border-t border-white/5 pt-4">
                    <div className="space-y-2">
                      <Label>Senha atual</Label>
                      <div className="relative">
                        <Input
                          type={showCurrent ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={e => setCurrentPassword(e.target.value)}
                          required
                          placeholder="••••••••"
                          className="bg-white/5 border-white/10 h-12 rounded-xl pr-12"
                        />
                        <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                          {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nova senha</Label>
                        <div className="relative">
                          <Input
                            type={showNew ? 'text' : 'password'}
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            required
                            placeholder="Mínimo 6 caracteres"
                            className="bg-white/5 border-white/10 h-12 rounded-xl pr-12"
                          />
                          <button type="button" onClick={() => setShowNew(!showNew)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                            {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Confirmar nova senha</Label>
                        <Input
                          type={showNew ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          required
                          placeholder="Repita a nova senha"
                          className="bg-white/5 border-white/10 h-12 rounded-xl"
                        />
                      </div>
                    </div>

                    {passwordMsg && (
                      <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl border ${
                        passwordMsg.type === 'success'
                          ? 'text-green-400 bg-green-500/10 border-green-500/20'
                          : 'text-red-400 bg-red-500/10 border-red-500/20'
                      }`}>
                        {passwordMsg.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                        {passwordMsg.text}
                      </div>
                    )}

                    <Button type="submit" disabled={savingPassword}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl px-8">
                      {savingPassword ? 'Salvando...' : 'Salvar nova senha'}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Account Status */}
          <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl p-8">
            <h3 className="text-lg font-bold mb-6">Status da Conta</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold">
                {currentUser.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold">{currentUser.name}</p>
                <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Membro Premium</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Membro desde</span>
                <span className="font-bold">{new Date(currentUser.createdAt).toLocaleDateString()}</span>
              </div>
              {currentUser.phone && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Telefone</span>
                  <span className="font-bold">{currentUser.phone}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">CPF</span>
                {currentUser.cpf ? (
                  <span className="font-bold">{currentUser.cpf}</span>
                ) : (
                  <span className="text-yellow-400 font-semibold text-xs">Não cadastrado</span>
                )}
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span className="text-green-500 font-bold">Verificado</span>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Bell size={20} className="text-yellow-500" />
              <h3 className="text-lg font-bold">Notificações</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Alertas de Operação</span>
                <div className="w-10 h-5 bg-blue-600 rounded-full relative">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Relatórios Semanais</span>
                <div className="w-10 h-5 bg-white/10 rounded-full relative">
                  <div className="absolute left-1 top-1 w-3 h-3 bg-white/50 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
