-- Grant access on all public tables. Without GRANT, PostgREST returns 403
-- (permission denied) for every role regardless of RLS policies.

-- Staff/admin-managed tables (no anon access)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jamaah TO authenticated;
GRANT ALL ON public.jamaah TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pemesanan TO authenticated;
GRANT ALL ON public.pemesanan TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pembayaran TO authenticated;
GRANT ALL ON public.pembayaran TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.dokumen TO authenticated;
GRANT ALL ON public.dokumen TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.keuangan TO authenticated;
GRANT ALL ON public.keuangan TO service_role;

-- Public catalog tables (anon can read)
GRANT SELECT ON public.paket TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.paket TO authenticated;
GRANT ALL ON public.paket TO service_role;

GRANT SELECT ON public.keberangkatan TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.keberangkatan TO authenticated;
GRANT ALL ON public.keberangkatan TO service_role;

-- Settings: staff read, admin write
GRANT SELECT ON public.pengaturan TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.pengaturan TO authenticated;
GRANT ALL ON public.pengaturan TO service_role;

-- Profiles: owner + admin read, owner update
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- User roles: self read + admin manage
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;