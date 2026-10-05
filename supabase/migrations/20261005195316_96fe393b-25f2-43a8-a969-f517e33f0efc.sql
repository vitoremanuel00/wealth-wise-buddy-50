CREATE TABLE public.finance_states (
  user_id UUID NOT NULL PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.finance_states TO authenticated;
GRANT ALL ON public.finance_states TO service_role;
ALTER TABLE public.finance_states ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own finance state" ON public.finance_states FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own finance state" ON public.finance_states FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own finance state" ON public.finance_states FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own finance state" ON public.finance_states FOR DELETE TO authenticated USING (auth.uid() = user_id);