import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

export interface Operation {
  id: string;
  pair: string;
  type: 'BUY' | 'SELL';
  exchange: string;
  price: number;
  amount: number;
  timestamp: string;
  profit: number;
  status: 'COMPLETED' | 'PENDING';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  cpf?: string | null;
  role: 'USER' | 'ADMIN';
  balance: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  referralCode?: string | null;
  referredBy?: string | null;
}

export interface DailyReport {
  id: string;
  userId: string;
  previousBalance: number;
  newBalance: number;
  profit: number;
  profitPercentage: number;
  date: string;
  notes?: string;
  createdAt: string;
  userName?: string;
  userEmail?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  amount: number;
  date: string;
  notes?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  userName?: string;
  userEmail?: string;
}

export interface PaymentGatewaySettings {
  gatewayEnabled: boolean;
  mercadopagoAccessToken: string;
  mercadopagoPublicKey: string;
  whatsappNumber: string;
  supportEmail: string;
}

interface AppState {
  currentUser: UserProfile | null;
  users: UserProfile[];
  operations: Operation[];
  dailyReports: DailyReport[];
  allDailyReports: DailyReport[];
  transactions: Transaction[];
  allTransactions: Transaction[];
  paymentSettings: PaymentGatewaySettings;
  conversionRate: number | null;

  fetchProfile: (userId: string) => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchConversionRate: () => Promise<void>;
  fetchAllUsers: () => Promise<void>;
  fetchOperations: (userId: string) => Promise<void>;
  fetchAllOperations: () => Promise<void>;
  fetchDailyReports: (userId: string) => Promise<void>;
  fetchAllDailyReports: () => Promise<void>;
  fetchTransactions: (userId: string) => Promise<void>;
  fetchAllTransactions: () => Promise<void>;
  fetchPaymentSettings: () => Promise<void>;
  savePaymentSettings: (settings: PaymentGatewaySettings) => Promise<boolean>;

  addOperation: (op: Omit<Operation, 'id'>, userId: string) => Promise<void>;
  updateUserBalance: (userId: string, amount: number, note?: string) => Promise<boolean>;
  addTransaction: (userId: string, type: 'DEPOSIT' | 'WITHDRAWAL', amount: number, note?: string) => Promise<boolean>;
  approveWithdrawal: (transactionId: string, userId: string, amount: number) => Promise<boolean>;
  rejectWithdrawal: (transactionId: string, note: string) => Promise<boolean>;
  toggleUserStatus: (userId: string) => Promise<boolean>;
}

export const useStore = create<AppState>((set, get) => ({
  currentUser: null,
  users: [],
  operations: [],
  dailyReports: [],
  allDailyReports: [],
  transactions: [],
  allTransactions: [],
  paymentSettings: {
    gatewayEnabled: false,
    mercadopagoAccessToken: '',
    mercadopagoPublicKey: '',
    whatsappNumber: '',
    supportEmail: '',
  },
  conversionRate: null,

  fetchConversionRate: async () => {
    try {
      const res = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL');
      const data = await res.json();
      const rate = parseFloat(data?.USDBRL?.bid);
      if (rate > 0) set({ conversionRate: rate });
    } catch {
      // API unavailable — keep null, no conversion shown
    }
  },

  fetchProfile: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data && !error) {
      set({
        currentUser: {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone ?? null,
          cpf: data.cpf ?? null,
          role: data.role as 'USER' | 'ADMIN',
          balance: Number(data.balance),
          status: data.status as 'ACTIVE' | 'INACTIVE',
          createdAt: data.created_at,
          referralCode: data.referral_code ?? null,
          referredBy: data.referred_by ?? null,
        }
      });
    }
  },

  fetchAllUsers: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (data && !error) {
      set({
        users: data.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone ?? null,
          cpf: u.cpf ?? null,
          role: u.role as 'USER' | 'ADMIN',
          balance: Number(u.balance),
          status: u.status as 'ACTIVE' | 'INACTIVE',
          createdAt: u.created_at,
          referralCode: u.referral_code ?? null,
          referredBy: u.referred_by ?? null,
        }))
      });
    }
  },

  fetchAllOperations: async () => {
    const { data, error } = await supabase
      .from('operations')
      .select('*')
      .order('created_at', { ascending: false });

    if (data && !error) {
      set({
        operations: data.map(op => ({
          id: op.id,
          pair: op.pair,
          type: op.type as 'BUY' | 'SELL',
          exchange: op.exchange,
          price: Number(op.price),
          amount: Number(op.amount),
          profit: Number(op.profit),
          timestamp: op.created_at,
          status: op.status as 'COMPLETED' | 'PENDING',
        }))
      });
    }
  },

  fetchOperations: async (userId) => {
    const { data, error } = await supabase
      .from('operations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (data && !error) {
      set({
        operations: data.map(op => ({
          id: op.id,
          pair: op.pair,
          type: op.type as 'BUY' | 'SELL',
          exchange: op.exchange,
          price: Number(op.price),
          amount: Number(op.amount),
          profit: Number(op.profit),
          timestamp: op.created_at,
          status: op.status as 'COMPLETED' | 'PENDING',
        }))
      });
    }
  },

  fetchDailyReports: async (userId) => {
    const { data, error } = await supabase
      .from('daily_reports')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (data && !error) {
      set({
        dailyReports: data.map(r => ({
          id: r.id,
          userId: r.user_id,
          previousBalance: Number(r.previous_balance),
          newBalance: Number(r.new_balance),
          profit: Number(r.profit),
          profitPercentage: Number(r.profit_percentage),
          date: r.date,
          notes: r.notes,
          createdAt: r.created_at,
        }))
      });
    }
  },

  fetchAllDailyReports: async () => {
    const { data, error } = await supabase
      .from('daily_reports')
      .select('*, profiles!user_id(name, email)')
      .order('created_at', { ascending: false });

    if (data && !error) {
      set({
        allDailyReports: data.map((r: any) => ({
          id: r.id,
          userId: r.user_id,
          previousBalance: Number(r.previous_balance),
          newBalance: Number(r.new_balance),
          profit: Number(r.profit),
          profitPercentage: Number(r.profit_percentage),
          date: r.date,
          notes: r.notes,
          createdAt: r.created_at,
          userName: r.profiles?.name,
          userEmail: r.profiles?.email,
        }))
      });
    }
  },

  fetchTransactions: async (userId) => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (data && !error) {
      set({
        transactions: data.map(t => ({
          id: t.id,
          userId: t.user_id,
          type: t.type as 'DEPOSIT' | 'WITHDRAWAL',
          amount: Number(t.amount),
          date: t.date,
          notes: t.notes,
          createdAt: t.created_at,
        }))
      });
    }
  },

  fetchAllTransactions: async () => {
    console.log('Buscando todas as transações no Supabase...');
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Erro ao buscar transações:', error);
      return;
    }

    console.log('Transações buscadas:', data?.length, 'itens');
    console.log('Status das transações:', data?.map(t => ({ id: t.id, status: t.status, notes: t.notes })));

    set({
      allTransactions: (data || []).map(t => ({
        id: t.id,
        userId: t.user_id,
        type: t.type as 'DEPOSIT' | 'WITHDRAWAL',
        amount: Number(t.amount),
        date: t.date,
        notes: t.notes,
        createdAt: t.created_at,
        userName: t.profiles?.name,
        userEmail: t.profiles?.email,
        status: t.status,
      }))
    });
  },

  addOperation: async (op, userId) => {
    const { data, error } = await supabase
      .from('operations')
      .insert([{ ...op, user_id: userId }])
      .select()
      .single();

    if (data && !error) {
      const newOp: Operation = {
        id: data.id,
        pair: data.pair,
        type: data.type as 'BUY' | 'SELL',
        exchange: data.exchange,
        price: Number(data.price),
        amount: Number(data.amount),
        profit: Number(data.profit),
        timestamp: data.created_at,
        status: data.status as 'COMPLETED' | 'PENDING',
      };
      set((state) => ({ operations: [newOp, ...state.operations].slice(0, 50) }));
    }
  },

  // Daily yield update — sets the final balance and generates a daily_report
  updateUserBalance: async (userId, amount, note) => {
    const state = get();
    const user = state.users.find(u => u.id === userId) || (state.currentUser?.id === userId ? state.currentUser : null);
    const previousBalance = user?.balance ?? 0;

    const { error } = await supabase
      .from('profiles')
      .update({ balance: amount })
      .eq('id', userId);

    if (error) {
      console.error('Erro ao atualizar saldo:', error);
      return false;
    }

    const profit = amount - previousBalance;
    const profitPercentage = previousBalance > 0 ? (profit / previousBalance) * 100 : 0;
    const today = new Date().toISOString().split('T')[0];

    const { data: reportData } = await supabase.from('daily_reports').insert([{
      user_id: userId,
      previous_balance: previousBalance,
      new_balance: amount,
      profit,
      profit_percentage: profitPercentage,
      date: today,
      notes: note || null,
      created_by: state.currentUser?.id || null,
    }]).select().single();

    // Auto-generate referral commission if user was referred and profit > 0
    if (profit > 0) {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('referred_by')
        .eq('id', userId)
        .single();

      if (userProfile?.referred_by) {
        const commissionAmount = parseFloat((profit * 0.1).toFixed(2));
        await supabase.from('referral_commissions').insert([{
          referrer_id: userProfile.referred_by,
          referred_id: userId,
          daily_report_id: reportData?.id || null,
          profit_amount: profit,
          commission_amount: commissionAmount,
          date: today,
        }]);
      }
    }

    set((state) => ({
      currentUser: state.currentUser?.id === userId ? { ...state.currentUser, balance: amount } : state.currentUser,
      users: state.users.map(u => u.id === userId ? { ...u, balance: amount } : u),
    }));
    return true;
  },

  addTransaction: async (userId, type, amount, note) => {
    const state = get();
    const user = state.users.find(u => u.id === userId) || (state.currentUser?.id === userId ? state.currentUser : null);
    if (!user) return false;

    // Withdrawals are pending until admin approves
    if (type === 'WITHDRAWAL') {
      const { error: txError } = await supabase.from('transactions').insert([{
        user_id: userId,
        type,
        amount,
        date: new Date().toISOString().split('T')[0],
        notes: note || null,
        created_by: state.currentUser?.id || null,
        status: 'PENDING',
      }]);

      if (txError) {
        console.error('Erro ao registrar saque:', txError);
        return false;
      }

      const newTx: Transaction = {
        id: crypto.randomUUID(),
        userId,
        type,
        amount,
        date: new Date().toISOString().split('T')[0],
        notes: note || undefined,
        createdAt: new Date().toISOString(),
        userName: user.name,
        userEmail: user.email,
        status: 'PENDING',
      };
      set((state) => ({ allTransactions: [newTx, ...state.allTransactions].slice(0, 100) }));
      return true;
    }

    // Deposits: approved immediately, update balance only
    const newBalance = user.balance + amount;

    const { error: txError } = await supabase.from('transactions').insert([{
      user_id: userId,
      type,
      amount,
      date: new Date().toISOString().split('T')[0],
      notes: note || null,
      created_by: state.currentUser?.id || null,
      status: 'APPROVED',
    }]);

    if (txError) {
      console.error('Erro ao registrar depósito:', txError);
      return false;
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ balance: newBalance })
      .eq('id', userId);

    if (profileError) {
      console.error('Erro ao atualizar saldo:', profileError);
      return false;
    }

    set((state) => ({
      currentUser: state.currentUser?.id === userId ? { ...state.currentUser, balance: newBalance } : state.currentUser,
      users: state.users.map(u => u.id === userId ? { ...u, balance: newBalance } : u),
    }));
    return true;
  },

  // Approve withdrawal — updates balance and adds approval note
  approveWithdrawal: async (transactionId, userId, amount) => {
    const state = get();
    const user = state.users.find(u => u.id === userId) || (state.currentUser?.id === userId ? state.currentUser : null);
    if (!user) {
      console.error('Usuário não encontrado:', userId);
      return false;
    }

    const newBalance = user.balance - amount;
    if (newBalance < 0) {
      console.error('Saldo insuficiente:', { balance: user.balance, amount, newBalance });
      return false;
    }

    console.log('Iniciando aprovação de saque:', { transactionId, userId, amount, currentBalance: user.balance, newBalance });

    // Update transaction with approval note and status
    console.log('Atualizando transação no Supabase:', { transactionId, status: 'APPROVED' });
    
    // Try using upsert instead of update
    const { error: txError, data } = await supabase
      .from('transactions')
      .upsert({
        id: transactionId,
        user_id: userId, // Adicionar user_id explicitamente
        type: 'WITHDRAWAL', // Adicionar type explicitamente
        amount: amount, // Adicionar amount explicitamente
        date: new Date().toISOString().split('T')[0], // Adicionar date explicitamente
        notes: `Saque aprovado em ${new Date().toLocaleDateString('pt-BR')} pelo admin ${state.currentUser?.name}`,
        status: 'APPROVED'
      })
      .select(); // Adicionar .select() para ver o que retorna

    console.log('Resultado da atualização (upsert):', { error: txError, data });

    if (txError) {
      console.error('Erro ao aprovar saque (update transaction):', txError);
      return false;
    }

    console.log('Transação atualizada com sucesso no banco!');

    console.log('Atualizando saldo do usuário no Supabase:', { userId, newBalance });
    
    // Update user balance
    const { error: profileError, data: profileData } = await supabase
      .from('profiles')
      .update({ balance: newBalance })
      .eq('id', userId)
      .select(); // Adicionar .select() para ver o que retorna

    console.log('Resultado da atualização do perfil:', { error: profileError, data: profileData });

    if (profileError) {
      console.error('Erro ao aprovar saque (update profile):', profileError);
      return false;
    }

    console.log('Saldo do usuário atualizado com sucesso no banco!');

    // Force refresh of all transactions to get updated data (with delay)
    console.log('Forçando refresh de todas as transações após 2 segundos...');
    const currentState = get();
    setTimeout(async () => {
      await currentState.fetchAllTransactions();
      console.log('Refresh completado!');
    }, 2000); // Wait 2 seconds for database to process
    
    // Update local state
    set((state) => ({
      currentUser: state.currentUser?.id === userId ? { ...state.currentUser, balance: newBalance } : state.currentUser,
      users: state.users.map(u => u.id === userId ? { ...u, balance: newBalance } : u),
      allTransactions: state.allTransactions.map(t => 
        t.id === transactionId ? { ...t, notes: `Saque aprovado em ${new Date().toLocaleDateString('pt-BR')} pelo admin ${state.currentUser?.name}`, status: 'APPROVED' } : t
      ),
    }));

    console.log('Aprovação de saque concluída com sucesso!');
    return true;
  },

  // Reject withdrawal — adds rejection note and status
  rejectWithdrawal: async (transactionId: string, note: string) => {
    const { error } = await supabase
      .from('transactions')
      .update({ 
        notes: `Saque rejeitado em ${new Date().toLocaleDateString('pt-BR')}. Motivo: ${note}`,
        status: 'REJECTED'
      })
      .eq('id', transactionId);

    if (error) {
      console.error('Erro ao rejeitar saque:', error);
      return false;
    }

    // Update local state
    set((state) => ({
      allTransactions: state.allTransactions.map(t => 
        t.id === transactionId ? { ...t, notes: `Saque rejeitado em ${new Date().toLocaleDateString('pt-BR')}. Motivo: ${note}`, status: 'REJECTED' } : t
      ),
    }));

    console.log('Saque rejeitado com sucesso!');
    return true;
  },

  fetchPaymentSettings: async () => {
    const { data, error } = await supabase
      .from('payment_gateway_settings')
      .select('*')
      .single();

    if (data && !error) {
      set({
        paymentSettings: {
          gatewayEnabled: data.gateway_enabled ?? false,
          mercadopagoAccessToken: data.mercadopago_access_token || '',
          mercadopagoPublicKey: data.mercadopago_public_key || '',
          whatsappNumber: data.whatsapp_number || '',
          supportEmail: data.support_email || '',
        }
      });
    }
  },

  savePaymentSettings: async (settings: PaymentGatewaySettings) => {
    const state = get();
    const { error } = await supabase
      .from('payment_gateway_settings')
      .update({
        active_gateway: 'mercado_pago',
        gateway_enabled: settings.gatewayEnabled,
        mercadopago_access_token: settings.mercadopagoAccessToken || null,
        mercadopago_public_key: settings.mercadopagoPublicKey || null,
        whatsapp_number: settings.whatsappNumber || null,
        support_email: settings.supportEmail || null,
        updated_at: new Date().toISOString(),
        updated_by: state.currentUser?.id || null,
      })
      .eq('id', '00000000-0000-0000-0000-000000000001');

    if (error) {
      console.error('Erro ao salvar configurações de pagamento:', error);
      return false;
    }

    set({ paymentSettings: settings });
    return true;
  },

  toggleUserStatus: async (userId) => {
    const user = get().users.find(u => u.id === userId) || (get().currentUser?.id === userId ? get().currentUser : null);
    if (!user) return false;

    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    const { error } = await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', userId);

    if (error) {
      console.error('Erro ao alternar status:', error);
      return false;
    }

    set((state) => ({
      currentUser: state.currentUser?.id === userId ? { ...state.currentUser, status: newStatus as 'ACTIVE' | 'INACTIVE' } : state.currentUser,
      users: state.users.map(u => u.id === userId ? { ...u, status: newStatus as 'ACTIVE' | 'INACTIVE' } : u),
    }));
    return true;
  },

}));
