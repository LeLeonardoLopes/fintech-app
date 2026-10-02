-- ==========================================================
-- FIN-TECH: BANCO DE DADOS POSTGRESQL (SUPABASE)
-- Execute este script no SQL Editor do painel do Supabase
-- ==========================================================

-- Extensão para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE PERFIS DE USUÁRIO
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  cpf TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. TABELA DE CONTAS E CARTÕES
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('checking', 'credit_card', 'cash', 'savings', 'investment')),
  institution TEXT NOT NULL,
  balance NUMERIC(14, 2) DEFAULT 0.00 NOT NULL,
  color TEXT,
  credit_limit NUMERIC(14, 2),
  available_limit NUMERIC(14, 2),
  closing_day INTEGER CHECK (closing_day >= 1 AND closing_day <= 31),
  due_day INTEGER CHECK (due_day >= 1 AND due_day <= 31),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. TABELA DE CATEGORIAS
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  icon TEXT DEFAULT 'Tag' NOT NULL,
  color TEXT DEFAULT '#10b981' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. TABELA DE TRANSAÇÕES (RECEITAS, DESPESAS, PARCELAMENTOS)
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(14, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  category_id UUID REFERENCES public.categories ON DELETE SET NULL,
  account_id UUID REFERENCES public.accounts ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'pending')),
  notes TEXT,
  attachment_url TEXT,
  tags TEXT[],
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_period TEXT CHECK (recurrence_period IN ('monthly', 'weekly', 'yearly')),
  is_installment BOOLEAN DEFAULT FALSE,
  installment_current INTEGER,
  installment_total INTEGER,
  parent_transaction_id UUID REFERENCES public.transactions ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. TABELA DE METAS E ORÇAMENTOS
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  target_amount NUMERIC(14, 2) NOT NULL,
  current_amount NUMERIC(14, 2) DEFAULT 0.00 NOT NULL,
  category_id UUID REFERENCES public.categories ON DELETE SET NULL,
  deadline DATE,
  color TEXT DEFAULT '#10b981',
  type TEXT DEFAULT 'saving' CHECK (type IN ('saving', 'budget_limit')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. TABELA DE INVESTIMENTOS E RESERVA DE EMERGÊNCIA
CREATE TABLE IF NOT EXISTS public.investments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('emergency_fund', 'fixed_income', 'equities', 'fii', 'crypto')),
  institution TEXT NOT NULL,
  amount_invested NUMERIC(14, 2) NOT NULL,
  current_value NUMERIC(14, 2) NOT NULL,
  liquidity TEXT DEFAULT 'immediate' CHECK (liquidity IN ('immediate', 'd+1', 'd+30', 'long_term')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) - ISOLAMENTO TOTAL POR USUÁRIO
-- ==========================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

-- Políticas de Profiles
CREATE POLICY "Usuário acessa seu próprio perfil" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- Políticas de Accounts
CREATE POLICY "Usuário gerencia suas próprias contas" ON public.accounts
  FOR ALL USING (auth.uid() = user_id);

-- Políticas de Categories (inclui categorias do sistema se user_id for NULL)
CREATE POLICY "Usuário visualiza suas categorias ou do sistema" ON public.categories
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Usuário gerencia suas categorias" ON public.categories
  FOR ALL USING (auth.uid() = user_id);

-- Políticas de Transactions
CREATE POLICY "Usuário gerencia suas transações" ON public.transactions
  FOR ALL USING (auth.uid() = user_id);

-- Políticas de Goals
CREATE POLICY "Usuário gerencia suas metas" ON public.goals
  FOR ALL USING (auth.uid() = user_id);

-- Políticas de Investments
CREATE POLICY "Usuário gerencia seus investimentos" ON public.investments
  FOR ALL USING (auth.uid() = user_id);

-- ==========================================================
-- TRIGGER AUTOMÁTICO DE CRIAÇÃO DE PERFIL E CATEGORIAS PADRÃO
-- ==========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, cpf)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email, new.raw_user_meta_data->>'cpf');

  -- Inserir categorias padrão para o novo usuário
  INSERT INTO public.categories (user_id, name, type, icon, color) VALUES
    (new.id, 'Alimentação & Mercado', 'expense', 'Utensils', '#f97316'),
    (new.id, 'Moradia & Contas', 'expense', 'Home', '#3b82f6'),
    (new.id, 'Transporte & Combustível', 'expense', 'Car', '#eab308'),
    (new.id, 'Lazer & Assinaturas', 'expense', 'Film', '#a855f7'),
    (new.id, 'Saúde & Farmácia', 'expense', 'HeartPulse', '#ef4444'),
    (new.id, 'Compras & Pessoal', 'expense', 'ShoppingBag', '#ec4899'),
    (new.id, 'Salário & Pro-labore', 'income', 'Briefcase', '#10b981'),
    (new.id, 'Freelance & Extra', 'income', 'Zap', '#14b8a6'),
    (new.id, 'Rendimentos & Dividendos', 'income', 'TrendingUp', '#6366f1');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
