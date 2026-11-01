CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE OR REPLACE FUNCTION public.delete_stale_guests(unseen_for interval DEFAULT interval '30 days')
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  stale uuid[];
BEGIN
  SELECT coalesce(array_agg(app.id), '{}')
    INTO stale
    FROM public.users app
    JOIN auth.users auth_user ON auth_user.id = app.id
   WHERE app.is_guest
     AND auth_user.is_anonymous
     AND coalesce(app.last_seen_at, app.created_at) < now() - unseen_for;

  DELETE FROM public.users WHERE id = ANY (stale);
  DELETE FROM auth.users WHERE id = ANY (stale);

  RETURN cardinality(stale);
END
$$;

REVOKE EXECUTE ON FUNCTION public.delete_stale_guests(interval) FROM PUBLIC, anon, authenticated;

SELECT cron.unschedule('delete-stale-guests')
 WHERE EXISTS (SELECT FROM cron.job WHERE jobname = 'delete-stale-guests');

SELECT cron.schedule('delete-stale-guests', '0 3 * * *', 'SELECT public.delete_stale_guests()');
