GRANT SELECT ON public.paket TO anon;
GRANT SELECT ON public.keberangkatan TO anon;
CREATE POLICY "Paket dapat dilihat publik" ON public.paket FOR SELECT TO anon USING (true);
CREATE POLICY "Keberangkatan dapat dilihat publik" ON public.keberangkatan FOR SELECT TO anon USING (true);