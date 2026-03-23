-- =====================================================================
-- FASE 1: Plans, Subscriptions, Session History enhancements
-- =====================================================================

-- 1. Adicionar novos campos ao session_history
ALTER TABLE public.session_history
  ADD COLUMN IF NOT EXISTS participants_count INT,
  ADD COLUMN IF NOT EXISTS deck_type TEXT,
  ADD COLUMN IF NOT EXISTS vote_analytics JSONB;

-- 2. Adicionar plan_id ao profiles (denorm para evitar JOIN em cada gating)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan_id TEXT DEFAULT 'free';

-- 3. Tabela de planos
CREATE TABLE IF NOT EXISTS public.plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_monthly_brl DECIMAL(8,2),
  price_annual_brl DECIMAL(8,2),
  max_history_sessions INT,        -- NULL = ilimitado
  history_retention_days INT,      -- NULL = ilimitado
  features JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed dos planos
INSERT INTO public.plans (id, name, price_monthly_brl, price_annual_brl, max_history_sessions, history_retention_days, features) VALUES
  ('free',     'Free',    0,     0,      1,    1,    '{"analytics":false,"export_csv":false,"export_pdf":false,"compare_sprints":false,"executive_dashboard":false}'::jsonb),
  ('starter',  'Starter', 4.99,  47.90,  10,   180,  '{"analytics":false,"export_csv":true,"export_pdf":false,"compare_sprints":false,"executive_dashboard":false}'::jsonb),
  ('pro',      'Pro',     9.90,  95.04,  null, 365,  '{"analytics":true,"export_csv":true,"export_pdf":true,"compare_sprints":true,"executive_dashboard":false}'::jsonb),
  ('pro_plus', 'Pro+',    29.90, 287.04, null, null, '{"analytics":true,"export_csv":true,"export_pdf":true,"compare_sprints":true,"executive_dashboard":true}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 4. Tabela de assinaturas (1:1 com profiles)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES public.plans(id) DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',       -- active | canceled | past_due | trialing
  billing_period TEXT,                         -- monthly | annual | NULL para free
  current_period_end TIMESTAMPTZ,
  payment_method TEXT,                         -- stripe | manual | NULL
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  notes TEXT,                                  -- billing manual: ex "PIX 2026-03-23"
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- 5. FK do profiles.plan_id → plans.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_plan_id_fkey'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_plan_id_fkey
      FOREIGN KEY (plan_id) REFERENCES public.plans(id)
      ON DELETE SET DEFAULT;
  END IF;
END $$;

-- 6. Trigger para manter profiles.plan_id sincronizado com subscriptions
CREATE OR REPLACE FUNCTION public.sync_profile_plan()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles SET plan_id = NEW.plan_id WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_subscription_change ON public.subscriptions;
CREATE TRIGGER on_subscription_change
  AFTER INSERT OR UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_plan();

-- 7. RLS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Plans: leitura pública (necessário para mostrar pricing e fazer gating client-side)
DROP POLICY IF EXISTS "Plans are readable by all" ON public.plans;
CREATE POLICY "Plans are readable by all" ON public.plans
  FOR SELECT USING (true);

-- Subscriptions: usuário vê e edita apenas a própria
DROP POLICY IF EXISTS "Users view own subscription" ON public.subscriptions;
CREATE POLICY "Users view own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own subscription" ON public.subscriptions;
CREATE POLICY "Users update own subscription" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- INSERT pela API route (service role) ou pelo trigger
DROP POLICY IF EXISTS "Service inserts subscriptions" ON public.subscriptions;
CREATE POLICY "Service inserts subscriptions" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 8. Política para session_history INSERT (room creator pode inserir)
DROP POLICY IF EXISTS "Room creator inserts session history" ON public.session_history;
CREATE POLICY "Room creator inserts session history" ON public.session_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.rooms
      WHERE rooms.id = session_history.room_id
        AND rooms.created_by = auth.uid()
    )
  );
