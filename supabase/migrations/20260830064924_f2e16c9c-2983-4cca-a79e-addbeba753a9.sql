DROP POLICY IF EXISTS jamaah_self_read ON public.jamaah;
DROP POLICY IF EXISTS pemesanan_self_read ON public.pemesanan;
DROP POLICY IF EXISTS pembayaran_self_read ON public.pembayaran;
DROP POLICY IF EXISTS dokumen_self_read ON public.dokumen;
DROP FUNCTION IF EXISTS public.my_jamaah_ids(uuid);

CREATE POLICY jamaah_self_read ON public.jamaah
FOR SELECT TO authenticated
USING (email IS NOT NULL AND lower(email) = lower(auth.jwt() ->> 'email'));

CREATE POLICY pemesanan_self_read ON public.pemesanan
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.jamaah j
  WHERE j.id = pemesanan.jamaah_id
    AND j.email IS NOT NULL
    AND lower(j.email) = lower(auth.jwt() ->> 'email')
));

CREATE POLICY pembayaran_self_read ON public.pembayaran
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.jamaah j
  WHERE j.id = pembayaran.jamaah_id
    AND j.email IS NOT NULL
    AND lower(j.email) = lower(auth.jwt() ->> 'email')
));

CREATE POLICY dokumen_self_read ON public.dokumen
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.jamaah j
  WHERE j.id = dokumen.jamaah_id
    AND j.email IS NOT NULL
    AND lower(j.email) = lower(auth.jwt() ->> 'email')
));