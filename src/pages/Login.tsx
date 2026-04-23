import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { useStore } from '@/lib/store';
import { ArrowLeft, Eye, EyeOff, Mail, ShieldCheck, RefreshCw } from 'lucide-react';

const Login = () => {
  const { user } = useAuth();
  const { fetchProfile, currentUser } = useStore();
  const navigate = useNavigate();

  // Step 1 — credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 2 — OTP
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (user) fetchProfile(user.id);
  }, [user, fetchProfile]);

  useEffect(() => {
    if (currentUser) {
      navigate(currentUser.role === 'ADMIN' ? '/admin' : '/dashboard');
    }
  }, [currentUser, navigate]);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // Auto-focus first OTP input when step changes
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  const sendOtp = async (emailAddr: string) => {
    const { error } = await supabase.functions.invoke('send-login-otp', {
      body: { email: emailAddr },
    });
    return !error;
  };

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Verify credentials
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      if (authError.message.includes('Invalid login credentials')) {
        setError('E-mail ou senha incorretos.');
      } else if (authError.message.includes('Email not confirmed')) {
        setError('Confirme seu e-mail antes de entrar.');
      } else {
        setError('Erro ao entrar. Tente novamente.');
      }
      setLoading(false);
      return;
    }

    // Credentials valid — sign out immediately and send OTP
    await supabase.auth.signOut();
    const sent = await sendOtp(email);
    if (!sent) {
      setError('Erro ao enviar código de verificação. Tente novamente.');
      setLoading(false);
      return;
    }

    setResendCooldown(60);
    setStep('otp');
    setLoading(false);
  };

  const handleOtpChange = (index: number, value: string) => {
    // Allow paste of full code
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const next = [...otp];
      digits.forEach((d, i) => { if (index + i < 6) next[index + i] = d; });
      setOtp(next);
      const nextFocus = Math.min(index + digits.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    const code = otp.join('');
    if (code.length !== 6) {
      setOtpError('Digite todos os 6 dígitos.');
      return;
    }

    setVerifying(true);

    // Verify OTP in DB via service (use anon key, RLS allows read since no auth needed here)
    const { data, error } = await supabase
      .from('login_otp')
      .select('id, expires_at, used')
      .eq('email', email)
      .eq('code', code)
      .eq('used', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      setOtpError('Código inválido. Verifique e tente novamente.');
      setVerifying(false);
      return;
    }

    if (new Date(data.expires_at) < new Date()) {
      setOtpError('Código expirado. Solicite um novo código.');
      setVerifying(false);
      return;
    }

    // Mark OTP as used via edge function (needs service role)
    await supabase.functions.invoke('send-login-otp', {
      body: { email, markUsed: data.id },
    });

    // Now sign in for real
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setOtpError('Erro ao finalizar login. Tente novamente.');
      setVerifying(false);
      return;
    }

    // currentUser effect will handle redirect
    setVerifying(false);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setResending(true);
    setOtpError('');
    setOtp(['', '', '', '', '', '']);
    await sendOtp(email);
    setResendCooldown(60);
    setResending(false);
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6">
      <Link to="/" className="absolute top-10 left-10 flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
        <ArrowLeft size={20} /> Voltar para o site
      </Link>

      <AnimatePresence mode="wait">
        {step === 'credentials' ? (
          <motion.div
            key="credentials"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md"
          >
            <div className="text-center mb-10">
              <img src="/logo.png" alt="Algorix Invest Logo" className="h-16 w-auto mx-auto mb-6 object-contain" />
              <h1 className="text-3xl font-bold mb-2">Bem-vindo</h1>
              <p className="text-gray-500">Acesse sua conta.</p>
            </div>

            <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl p-8 shadow-2xl">
              <form onSubmit={handleCredentials} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="seu@email.com"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Senha</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Link to="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                    Esqueci minha senha
                  </Link>
                </div>

                {error && (
                  <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all"
                >
                  {loading ? 'Verificando...' : 'Continuar'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                Não tem uma conta?{' '}
                <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  Cadastre-se
                </Link>
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="otp"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md"
          >
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShieldCheck size={32} className="text-blue-400" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Verificação</h1>
              <p className="text-gray-500 text-sm">
                Enviamos um código de 6 dígitos para
              </p>
              <p className="text-blue-400 font-semibold mt-1">{email}</p>
            </div>

            <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl p-8 shadow-2xl">
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-4 text-center">
                    Digite o código de verificação
                  </label>
                  <div className="flex gap-3 justify-center">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={el => { inputRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={digit}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                        className="w-12 h-14 text-center text-2xl font-black bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:bg-blue-600/5 transition-all"
                      />
                    ))}
                  </div>
                </div>

                {otpError && (
                  <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-center">
                    {otpError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={verifying || otp.join('').length !== 6}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all"
                >
                  {verifying ? 'Verificando...' : 'Confirmar acesso'}
                </button>
              </form>

              <div className="mt-6 text-center space-y-3">
                <p className="text-xs text-gray-600">O código expira em 10 minutos.</p>
                <button
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || resending}
                  className="flex items-center gap-2 mx-auto text-sm text-gray-400 hover:text-blue-400 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
                >
                  <RefreshCw size={14} className={resending ? 'animate-spin' : ''} />
                  {resendCooldown > 0
                    ? `Reenviar em ${resendCooldown}s`
                    : resending ? 'Enviando...' : 'Reenviar código'}
                </button>
                <button
                  onClick={() => { setStep('credentials'); setOtp(['','','','','','']); setOtpError(''); }}
                  className="block mx-auto text-sm text-gray-500 hover:text-gray-300 transition-colors"
                >
                  ← Voltar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;
