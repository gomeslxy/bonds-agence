-- ============================================================
-- BONDS AGENCE V4 — SUPABASE SETUP SQL
-- Execute no painel: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. ORDERS TABLE: adicionar user_id e habilitar RLS
-- ============================================================
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Ativar Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Usuários veem apenas seus pedidos" ON public.orders;
DROP POLICY IF EXISTS "Allow admin full access" ON public.orders;

-- Usuário vê apenas seus próprios pedidos
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Usuário só pode inserir pedidos vinculados ao próprio ID
CREATE POLICY "Users can insert own orders"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 2. SUPABASE AUTH: desabilitar e-mails automáticos
-- ============================================================
-- Configurar via Dashboard (não via SQL):
-- Authentication > Providers > Email
--   ✅ Enable Email Provider: ON
--   ✅ Confirm Email: ON  (Supabase envia OTP de 6 dígitos)
--   ❌ Secure email change: OFF (opcional)
--   ❌ Magic Link: OFF

-- ============================================================
-- 3. TEMPLATES DE E-MAIL (configurar no Dashboard)
-- ============================================================
-- Authentication > Email Templates
-- Cole os HTMLs correspondentes (veja supabase_email_templates.md)

-- ============================================================
-- 4. URL DE REDIRECIONAMENTO AUTORIZADO
-- ============================================================
-- Authentication > URL Configuration > Redirect URLs
-- Adicione: https://bonds-agence.vercel.app/auth/reset-password

-- ============================================================
-- 5. VERIFICAR ESTRUTURA DA TABELA ORDERS
-- ============================================================
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- ============================================================
-- 6. CRIAR ÍNDICE PARA MELHOR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
