import React, { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { useStore } from '@/lib/store';
import { supabase } from '@/integrations/supabase/client';
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  CreditCard,
  AlertCircle,
  CheckCircle,
  X,
  Clock,
  Ban,
  Loader2,
  Copy,
  Check,
  QrCode,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { fmtUSD, fmtBRL, fmtBRLRaw } from '@/lib/currency';

const SUPABASE_FUNCTIONS_URL = 'https://uvppermvkskacfwduqfc.supabase.co/functions/v1';
const CONVERSION_RATE = 5.50;

interface PixData {
  paymentId: string;
  qrCode: string;
  qrCodeBase64: string;
  amountBRL: number;
  expiresAt: string;
}

const PixModal = ({ pix, onClose, onConfirmed }: { pix: PixData; onClose: () => void; onConfirmed: () => void }) => {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { fetchAllTransactions, allTransactions, currentUser } = useStore();

  // Countdown timer
  useEffect(() => {
    const update = () => {
      const diff = new Date(pix.expiresAt).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft('Expirado'); return; }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${m}:${s.toString().padStart(2, '0')}`);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [pix.expiresAt]);

  // Poll for payment confirmation every 5s
  useEffect(() => {
    pollRef.current = setInterval(async () => {
      await fetchAllTransactions();
      const approved = allTransactions.find(
        t => t.userId === currentUser?.id &&
          t.type === 'DEPOSIT' &&
          t.status === 'APPROVED' &&
          t.notes?.includes(`MP ID: ${pix.paymentId}`)
      );
      if (approved) {
        clearInterval(pollRef.current!);
        onConfirmed();
      }
    }, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [pix.paymentId, allTransactions]);

  const handleCopy = () => {
    navigator.clipboard.writeText(pix.qrCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Código PIX copiado!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl p-8 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <QrCode className="text-blue-400" size={28} />
          </div>
          <h2 className="text-2xl font-black mb-1">Pagar via PIX</h2>
          <p className="text-gray-500 text-sm">Escaneie o QR Code ou copie o código abaixo</p>
        </div>

        {/* Amount */}
        <div className="bg-green-600/10 border border-green-600/20 rounded-2xl p-4 text-center mb-6">
          <p className="text-xs text-gray-500 mb-1">Valor a pagar</p>
          <p className="text-3xl font-black text-green-400">R$ {pix.amountBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>

        {/* QR Code */}
        {pix.qrCodeBase64 && (
          <div className="flex justify-center mb-6">
            <div className="bg-white p-3 rounded-2xl">
              <img
                src={`data:image/png;base64,${pix.qrCodeBase64}`}
                alt="QR Code PIX"
                className="w-48 h-48"
              />
            </div>
          </div>
        )}

        {/* Copy code */}
        <div className="mb-6">
          <p className="text-xs text-gray-500 mb-2 font-medium">PIX Copia e Cola</p>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-3">
            <p className="text-xs font-mono text-gray-400 flex-1 break-all line-clamp-2">{pix.qrCode}</p>
            <button
              onClick={handleCopy}
              className="flex-shrink-0 p-1.5 bg-blue-600/20 hover:bg-blue-600/40 rounded-lg transition-colors"
            >
              {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} className="text-blue-400" />}
            </button>
          </div>
        </div>

        {/* Status + timer */}
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
          <div className="flex items-center gap-2">
            <Loader2 size={14} className="animate-spin text-yellow-400" />
            <span className="text-sm text-yellow-400 font-medium">Aguardando pagamento...</span>
          </div>
          <span className="text-xs font-mono text-gray-500">{timeLeft}</span>
        </div>
      </div>
    </div>
  );
};

const WalletSection = () => {
  const { currentUser, addTransaction, allTransactions, fetchAllTransactions, paymentSettings, fetchPaymentSettings, fetchProfile, conversionRate } = useStore();
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'DEPOSIT' | 'WITHDRAWAL'>('DEPOSIT');
  const [note, setNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pixData, setPixData] = useState<PixData | null>(null);

  const gatewayActive = paymentSettings.gatewayEnabled;
  const userTransactions = allTransactions.filter(t => t.userId === currentUser?.id);

  useEffect(() => {
    if (currentUser) {
      fetchAllTransactions();
      fetchPaymentSettings();
    }
  }, [currentUser?.id]);

  // Get the user's access token from localStorage
  const getAccessToken = (): string | null => {
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
      for (const key of keys) {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const session = JSON.parse(raw);
        if (session?.access_token) return session.access_token;
      }
      return null;
    } catch { return null; }
  };

  const handleTransaction = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setIsProcessing(true);
    try {
      const amountNum = parseFloat(amount);

      if (type === 'DEPOSIT') {
        const token = getAccessToken();
        if (!token) {
          toast.error('Sessão expirada. Faça login novamente.');
          return;
        }

        const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/create-mercadopago-pix`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ amountBRL: amountNum, note: note || undefined }),
        });

        const data = await res.json();
        if (!res.ok) {
          console.error('MP Error details:', JSON.stringify(data, null, 2));
          toast.error(data.error || 'Erro ao gerar PIX. Verifique as configurações.');
          return;
        }

        setAmount('');
        setNote('');
        setPixData(data);
        return;
      }

      // WITHDRAWAL
      const amountInUSD = amountNum / CONVERSION_RATE;
      const processedNote = `Saque BRL: R$${amountNum.toFixed(2)} → USD: $${amountInUSD.toFixed(2)} (Pendente de aprovação)${note ? ` | ${note}` : ''}`;
      const success = await addTransaction(currentUser?.id || '', 'WITHDRAWAL', amountInUSD, processedNote);

      if (success) {
        setAmount('');
        setNote('');
        toast.success(`Saque de R$${amountNum.toFixed(2)} solicitado! Aguardando aprovação.`);
      } else {
        toast.error('Erro ao processar saque. Tente novamente.');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao processar transação.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePixConfirmed = () => {
    setPixData(null);
    fetchAllTransactions();
    if (currentUser?.id) fetchProfile(currentUser.id);
    toast.success('PIX confirmado! Saldo atualizado.');
  };

  const totalDeposits = userTransactions.filter(t => t.type === 'DEPOSIT' && t.status === 'APPROVED').reduce((s, t) => s + t.amount, 0);
  const totalWithdrawals = userTransactions.filter(t => t.type === 'WITHDRAWAL' && t.status === 'APPROVED').reduce((s, t) => s + t.amount, 0);

  if (!currentUser) return null;

  return (
    <DashboardLayout>
      {pixData && (
        <PixModal
          pix={pixData}
          onClose={() => setPixData(null)}
          onConfirmed={handlePixConfirmed}
        />
      )}

      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Carteira</h1>
        <p className="text-gray-500">Gerencie seus depósitos e saques</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 -skew-x-12 translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Saldo Disponível</p>
                <h2 className="text-4xl font-black text-white">{fmtUSD(currentUser.balance)}</h2>
                {fmtBRL(currentUser.balance) && <p className="text-blue-200 text-lg font-semibold mt-1">{fmtBRL(currentUser.balance)}</p>}
              </div>
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                <Wallet className="text-white" size={32} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl p-6">
          <h3 className="text-lg font-bold mb-6">Resumo</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Total Depositado</span>
              <div className="text-right">
                <span className="text-green-400 font-bold block">+{fmtUSD(totalDeposits)}</span>
                {fmtBRL(totalDeposits) && <span className="text-green-600 text-xs">+{fmtBRL(totalDeposits)}</span>}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Total Sacado</span>
              <div className="text-right">
                <span className="text-red-400 font-bold block">-{fmtUSD(totalWithdrawals)}</span>
                {fmtBRL(totalWithdrawals) && <span className="text-red-600 text-xs">-{fmtBRL(totalWithdrawals)}</span>}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Líquido</span>
              <div className="text-right">
                <span className="text-white font-bold block">+{fmtUSD(totalDeposits - totalWithdrawals)}</span>
                {fmtBRL(totalDeposits - totalWithdrawals) && <span className="text-gray-500 text-xs">+{fmtBRL(totalDeposits - totalWithdrawals)}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl p-8">
          <h3 className="text-xl font-bold mb-6">Nova Transação</h3>
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-400 mb-3 block">Tipo de Operação</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setType('DEPOSIT')}
                  className={cn("p-4 rounded-2xl border transition-all",
                    type === 'DEPOSIT' ? "bg-green-600/10 border-green-600 text-green-500" : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10")}
                >
                  <ArrowUpRight className="mx-auto mb-2" size={24} />
                  <span className="text-sm font-medium">Depósito</span>
                </button>
                <button
                  onClick={() => setType('WITHDRAWAL')}
                  className={cn("p-4 rounded-2xl border transition-all",
                    type === 'WITHDRAWAL' ? "bg-red-600/10 border-red-600 text-red-500" : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10")}
                >
                  <ArrowDownRight className="mx-auto mb-2" size={24} />
                  <span className="text-sm font-medium">Saque</span>
                </button>
              </div>
            </div>

            {type === 'DEPOSIT' && (
              <div>
                <label className="text-sm font-medium text-gray-400 mb-3 block">Método de Depósito</label>
                {gatewayActive ? (
                  <div className="flex items-center gap-3 p-4 bg-blue-600/10 border border-blue-600/30 rounded-2xl">
                    <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <QrCode className="text-blue-400" size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-blue-300">Mercado Pago — PIX</p>
                      <p className="text-xs text-gray-500">QR Code gerado instantaneamente</p>
                    </div>
                    <CheckCircle className="text-green-500 ml-auto" size={18} />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Ban className="text-gray-600" size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-500">Nenhum método disponível</p>
                      <p className="text-xs text-gray-600">O administrador ainda não habilitou o gateway de pagamento.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-400 mb-2 block">
                {type === 'DEPOSIT' ? 'Valor do Depósito (BRL)' : 'Valor do Saque (BRL)'}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
                {type === 'WITHDRAWAL' && amount && !isNaN(parseFloat(amount)) && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                    ≈ ${(parseFloat(amount) / CONVERSION_RATE).toFixed(2)} USD
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-400 mb-2 block">Observação (opcional)</label>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Descrição da transação"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <Button
              onClick={handleTransaction}
              disabled={isProcessing || !amount || parseFloat(amount) <= 0 || (type === 'DEPOSIT' && !gatewayActive)}
              className={cn("w-full py-4 rounded-2xl font-semibold text-lg",
                type === 'DEPOSIT' ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white")}
            >
              {isProcessing ? (
                <><Loader2 className="mr-2 animate-spin" size={20} />Gerando PIX...</>
              ) : type === 'DEPOSIT' ? (
                <><QrCode className="mr-2" size={20} />Gerar QR Code PIX</>
              ) : (
                <><Wallet className="mr-2" size={20} />Solicitar Saque</>
              )}
            </Button>
          </div>
        </div>

        <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl p-8">
          <h3 className="text-xl font-bold mb-6">Histórico Recente</h3>
          <div className="space-y-4">
            {userTransactions.length === 0 ? (
              <p className="text-gray-600 text-sm text-center py-6">Nenhuma transação encontrada.</p>
            ) : (
              userTransactions.slice(0, 5).map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center",
                      tx.type === 'DEPOSIT' ? "bg-green-600/10" : "bg-red-600/10")}>
                      {tx.type === 'DEPOSIT'
                        ? <ArrowUpRight className="text-green-500" size={20} />
                        : <ArrowDownRight className="text-red-500" size={20} />}
                    </div>
                    <div>
                      <p className="font-medium">{tx.type === 'DEPOSIT' ? 'Depósito PIX' : 'Saque'}</p>
                      <p className="text-xs text-gray-500">{new Date(tx.date + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn("font-bold", tx.type === 'DEPOSIT' ? "text-green-400" : "text-red-400")}>
                      {tx.type === 'DEPOSIT' ? '+' : '-'}{fmtUSD(tx.amount)}
                    </p>
                    {fmtBRL(tx.amount) && <p className="text-xs text-gray-600">{tx.type === 'DEPOSIT' ? '+' : '-'}{fmtBRL(tx.amount)}</p>}
                    <div className="flex items-center gap-1 justify-end mt-0.5">
                      {tx.status === 'APPROVED' ? (
                        <><CheckCircle className="text-green-500" size={12} /><span className="text-xs text-green-500">Aprovado</span></>
                      ) : tx.status === 'REJECTED' ? (
                        <><X className="text-red-500" size={12} /><span className="text-xs text-red-500">Rejeitado</span></>
                      ) : (
                        <><Clock className="text-yellow-500" size={12} /><span className="text-xs text-yellow-500">Pendente</span></>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 p-4 bg-blue-600/10 border border-blue-600/20 rounded-2xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-blue-500 mt-0.5 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm font-medium text-blue-400 mb-1">Informações</p>
                <p className="text-xs text-gray-400">
                  Depósitos via PIX são processados automaticamente após confirmação do Mercado Pago.
                  Saques precisam de aprovação do administrador e são processados em até 1 dia útil.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WalletSection;
