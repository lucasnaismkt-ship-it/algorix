import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { ArrowLeft, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

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

const Register = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref') || '';
  const [loading, setLoading] = useState(false);
  const [referrerName, setReferrerName] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    phone: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  useEffect(() => {
    if (!refCode) return;
    // Look up the referrer name to show "Convidado por X"
    supabase
      .from('profiles')
      .select('name')
      .eq('referral_code', refCode.toUpperCase())
      .single()
      .then(({ data }) => {
        if (data?.name) setReferrerName(data.name);
      });
  }, [refCode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'cpf') {
      setFormData(prev => ({ ...prev, cpf: formatCPF(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Por favor, informe seu nome completo.');
      return;
    }
    if (!validateCPF(formData.cpf)) {
      toast.error('CPF inválido. Verifique e tente novamente.');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('Por favor, informe seu telefone.');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Por favor, informe seu e-mail.');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      // Pass all data including ref_code in metadata — handle_new_user() trigger
      // will create the profile with cpf, phone, and referred_by resolved from ref_code
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name.trim(),
            phone: formData.phone.trim(),
            cpf: formData.cpf.trim(),
            ref_code: refCode || null,
          }
        }
      });

      if (authError) {
        toast.error(authError.message);
        return;
      }

      if (authData.user) {
        toast.success('Conta criada com sucesso! Verifique seu e-mail para confirmar.');
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (error) {
      console.error('Erro no registro:', error);
      toast.error('Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6">
      <Link to="/" className="absolute top-10 left-10 flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
        <ArrowLeft size={20} /> Voltar para o site
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <img src="/logo.png" alt="Algorix Invest Logo" className="h-16 w-auto mx-auto mb-6 object-contain" />
          <h1 className="text-3xl font-bold mb-2">Criar Conta</h1>
          <p className="text-gray-500">Comece sua jornada de investimentos hoje mesmo.</p>
          {referrerName && (
            <div className="mt-4 flex items-center gap-2 bg-blue-600/10 border border-blue-500/30 rounded-xl px-4 py-3 text-sm text-blue-300">
              <Gift size={16} className="text-blue-400 flex-shrink-0" />
              <span>Você foi convidado por <strong className="text-blue-200">{referrerName}</strong> para a Algorix Network!</span>
            </div>
          )}
        </div>

        <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-300 mb-2 block">Nome Completo</Label>
              <Input
                id="name" name="name" type="text"
                placeholder="Seu nome completo"
                value={formData.name} onChange={handleChange}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-12 rounded-xl"
                required
              />
            </div>

            <div>
              <Label htmlFor="cpf" className="text-sm font-medium text-gray-300 mb-2 block">CPF</Label>
              <Input
                id="cpf" name="cpf" type="text"
                placeholder="000.000.000-00"
                value={formData.cpf} onChange={handleChange}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-12 rounded-xl"
                required
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm font-medium text-gray-300 mb-2 block">Telefone / WhatsApp</Label>
              <Input
                id="phone" name="phone" type="tel"
                placeholder="+55 (11) 99999-9999"
                value={formData.phone} onChange={handleChange}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-12 rounded-xl"
                required
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-300 mb-2 block">E-mail</Label>
              <Input
                id="email" name="email" type="email"
                placeholder="seu@email.com"
                value={formData.email} onChange={handleChange}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-12 rounded-xl"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium text-gray-300 mb-2 block">Senha</Label>
              <Input
                id="password" name="password" type="password"
                placeholder="Mínimo 6 caracteres"
                value={formData.password} onChange={handleChange}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-12 rounded-xl"
                required minLength={6}
              />
            </div>

            <Button
              type="submit" disabled={loading}
              className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg disabled:opacity-50"
            >
              {loading ? 'Criando conta...' : 'Criar minha conta grátis'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-blue-500 hover:text-blue-400 transition-colors font-medium">
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
