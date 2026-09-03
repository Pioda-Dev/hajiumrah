-- RLS policies call is_staff() and has_role(); the requesting (authenticated) role
-- must have EXECUTE on them or every policy check fails with
-- "permission denied for function is_staff" (HTTP 403).
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;