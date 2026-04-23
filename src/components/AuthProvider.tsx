"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

// Função para criar perfil automaticamente
const createProfileIfNotExists = async (user: User) => {
  try {
    // Verificar se perfil já existe
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (existingProfile) {
      console.log('Perfil já existe:', user.id);
      return;
    }

    // Criar perfil com valores padrão (fallback — normalmente handle_new_user já faz isso)
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
        email: user.email || '',
        phone: user.user_metadata?.phone || null,
        cpf: user.user_metadata?.cpf || null,
        role: 'USER',
        balance: 0,
        status: 'ACTIVE',
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar perfil automático:', error);
    } else {
      console.log('Perfil criado automaticamente para:', user.id);
    }
  } catch (error) {
    console.error('Erro na verificação/criação de perfil:', error);
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Criar perfil automaticamente se usuário existir
      if (session?.user) {
        createProfileIfNotExists(session.user);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Criar perfil automaticamente se usuário fizer login
      if (session?.user && _event === 'SIGNED_IN') {
        createProfileIfNotExists(session.user);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);