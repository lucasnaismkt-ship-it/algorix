import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const isLocalhost = window.location.hostname === 'localhost';
    const redirectBase = isLocalhost ? window.location.origin : 'https://algorixinvest.com';
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${redirectBase}/reset-password`,
    });
    if (authError) {
      setError(authError.message || 'Erro ao enviar o e-mail. Tente novamente.');
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6">
      <Link to="/login" className="absolute top-10 left-10 flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
        <ArrowLeft size={20} /> Voltar para o login
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <img src="/logo.png" alt="Algorix Invest Logo" className="h-16 w-auto mx-auto mb-6 object-contain" />
          <h1 className="text-3xl font-bold mb-2">Recuperar Senha</h1>
          <p className="text-gray-500">Enviaremos um link para redefinir sua senha.</p>
        </div>

        <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl p-8 shadow-2xl">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">E-mail enviado!</h3>
              <p className="text-gray-400 text-sm mb-6">
                Verifique sua caixa de entrada em <span className="text-white font-medium">{email}</span> e clique no link para redefinir sua senha.
              </p>
              <Link to="/login" className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                Voltar para o login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">E-mail da conta</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
                />
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
                {loading ? 'Enviando...' : 'Enviar link de recuperação'}
              </button>

              <p className="text-center text-sm text-gray-500">
                Lembrou a senha?{' '}
                <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  Entrar
                </Link>
              </p>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
