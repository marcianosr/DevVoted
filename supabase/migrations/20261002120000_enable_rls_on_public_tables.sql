DO $$
DECLARE
  unprotected record;
BEGIN
  FOR unprotected IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND NOT rowsecurity
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', unprotected.tablename);
  END LOOP;
END $$;
