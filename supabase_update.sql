-- BONDS AGENCE V3.6 - SUPABASE AUTH & RLS UPDATE

-- 1. Adicionar user_id à tabela de pedidos (orders)
-- Usamos um UUID que referencia auth.users
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 2. Garantir que user_id seja obrigatório para novos registros
-- (Apenas após migrar os dados se necessário, mas como estamos em V4/V3.6, vamos assumir novos dados)
-- ALTER TABLE public.orders ALTER COLUMN user_id SET NOT NULL;

-- 3. Configurar RLS (Row Level Security)

-- Habilitar RLS se não estiver habilitado
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS PARA ORDERS
DROP POLICY IF EXISTS "Allow select for admin" ON public.orders;
DROP POLICY IF EXISTS "Allow public insert" ON public.orders;
DROP POLICY IF EXISTS "Allow all access for orders" ON public.orders;

-- SELECT: O usuário só pode ver seus próprios pedidos
CREATE POLICY "Users can view own orders" 
ON public.orders FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- INSERT: Apenas usuários autenticados podem criar pedidos
CREATE POLICY "Users can insert own orders" 
ON public.orders FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- UPDATE: O usuário pode atualizar seus próprios pedidos (ex: cancelar se permitido)
-- Admin também precisa de acesso via service role ou política específica
CREATE POLICY "Users can update own orders" 
ON public.orders FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- POLÍTICAS PARA PRODUCTS (Lógica de Admin)
-- SELECT: Público
DROP POLICY IF EXISTS "Allow public read access" ON public.products;
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);

-- INSERT/UPDATE/DELETE: Apenas Admins (Podemos usar metadados do usuário ou uma tabela de perfis)
-- Por enquanto, vamos permitir que qualquer usuário autenticado gerencie se for um Admin (simplificado)
-- Em um SaaS real, verificaríamos claims como 'role' = 'admin'
CREATE POLICY "Admins can manage products" 
ON public.products FOR ALL 
TO authenticated 
USING (auth.jwt() ->> 'email' = 'admin@bonds.com.br'); -- Exemplo de trava por email

-- POLÍTICAS PARA COUPONS
DROP POLICY IF EXISTS "Allow public read coupons" ON public.coupons;
CREATE POLICY "Public Read Coupons" ON public.coupons FOR SELECT USING (true);
