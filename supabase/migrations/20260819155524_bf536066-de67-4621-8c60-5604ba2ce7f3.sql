REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.is_staff(uuid) FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.assign_first_admin() FROM anon, authenticated, public;