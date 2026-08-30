-- 1. Sole admin enforcement
DELETE FROM public.user_roles
WHERE role = 'admin'
  AND user_id <> (SELECT id FROM auth.users WHERE lower(email) = 'pioda.archery@gmail.com');

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE lower(email) = 'pioda.archery@gmail.com'
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.enforce_single_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role = 'admin' AND EXISTS (
    SELECT 1 FROM public.user_roles WHERE role = 'admin' AND user_id <> NEW.user_id
  ) THEN
    RAISE EXCEPTION 'Hanya boleh ada satu admin di aplikasi ini';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_single_admin ON public.user_roles;
CREATE TRIGGER trg_single_admin
BEFORE INSERT OR UPDATE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.enforce_single_admin();

-- 2. Jamaah self-service read access (matched by email)
CREATE OR REPLACE FUNCTION public.my_jamaah_ids(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT j.id
  FROM public.jamaah j
  JOIN auth.users u ON lower(u.email) = lower(j.email)
  WHERE u.id = _user_id AND j.email IS NOT NULL;
$$;

REVOKE ALL ON FUNCTION public.enforce_single_admin() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.my_jamaah_ids(uuid) TO authenticated;

CREATE POLICY jamaah_self_read ON public.jamaah
FOR SELECT TO authenticated
USING (id IN (SELECT public.my_jamaah_ids(auth.uid())));

CREATE POLICY pemesanan_self_read ON public.pemesanan
FOR SELECT TO authenticated
USING (jamaah_id IN (SELECT public.my_jamaah_ids(auth.uid())));

CREATE POLICY pembayaran_self_read ON public.pembayaran
FOR SELECT TO authenticated
USING (jamaah_id IN (SELECT public.my_jamaah_ids(auth.uid())));

CREATE POLICY dokumen_self_read ON public.dokumen
FOR SELECT TO authenticated
USING (jamaah_id IN (SELECT public.my_jamaah_ids(auth.uid())));