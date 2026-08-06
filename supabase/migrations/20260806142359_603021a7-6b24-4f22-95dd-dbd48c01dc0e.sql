-- updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- PAKET
CREATE TABLE public.paket (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  harga NUMERIC NOT NULL DEFAULT 0,
  durasi INTEGER NOT NULL DEFAULT 9,
  kuota INTEGER NOT NULL DEFAULT 0,
  tersisa INTEGER NOT NULL DEFAULT 0,
  hotel TEXT NOT NULL DEFAULT 'Bintang 3',
  maskapai TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.paket TO authenticated;
GRANT ALL ON public.paket TO service_role;
ALTER TABLE public.paket ENABLE ROW LEVEL SECURITY;
CREATE POLICY "paket_all" ON public.paket FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_paket_updated BEFORE UPDATE ON public.paket FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- JAMAAH
CREATE TABLE public.jamaah (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  nik TEXT,
  telepon TEXT,
  email TEXT,
  alamat TEXT,
  paket_id UUID REFERENCES public.paket(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'Booking',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jamaah TO authenticated;
GRANT ALL ON public.jamaah TO service_role;
ALTER TABLE public.jamaah ENABLE ROW LEVEL SECURITY;
CREATE POLICY "jamaah_all" ON public.jamaah FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_jamaah_updated BEFORE UPDATE ON public.jamaah FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- KEBERANGKATAN
CREATE TABLE public.keberangkatan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kode TEXT NOT NULL,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  rute TEXT NOT NULL DEFAULT '',
  maskapai TEXT NOT NULL DEFAULT '',
  jumlah_jamaah INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Menunggu',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.keberangkatan TO authenticated;
GRANT ALL ON public.keberangkatan TO service_role;
ALTER TABLE public.keberangkatan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "keberangkatan_all" ON public.keberangkatan FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_keberangkatan_updated BEFORE UPDATE ON public.keberangkatan FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- PEMESANAN
CREATE TABLE public.pemesanan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice TEXT NOT NULL,
  jamaah_id UUID REFERENCES public.jamaah(id) ON DELETE SET NULL,
  paket_id UUID REFERENCES public.paket(id) ON DELETE SET NULL,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  total NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Booking',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pemesanan TO authenticated;
GRANT ALL ON public.pemesanan TO service_role;
ALTER TABLE public.pemesanan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pemesanan_all" ON public.pemesanan FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_pemesanan_updated BEFORE UPDATE ON public.pemesanan FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- PEMBAYARAN
CREATE TABLE public.pembayaran (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice TEXT NOT NULL,
  jamaah_id UUID REFERENCES public.jamaah(id) ON DELETE SET NULL,
  total NUMERIC NOT NULL DEFAULT 0,
  dibayar NUMERIC NOT NULL DEFAULT 0,
  metode TEXT NOT NULL DEFAULT 'Transfer BCA',
  status TEXT NOT NULL DEFAULT 'DP',
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pembayaran TO authenticated;
GRANT ALL ON public.pembayaran TO service_role;
ALTER TABLE public.pembayaran ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pembayaran_all" ON public.pembayaran FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_pembayaran_updated BEFORE UPDATE ON public.pembayaran FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- DOKUMEN
CREATE TABLE public.dokumen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jamaah_id UUID REFERENCES public.jamaah(id) ON DELETE CASCADE,
  passport TEXT NOT NULL DEFAULT 'Belum',
  passport_expired DATE,
  visa TEXT NOT NULL DEFAULT 'Belum',
  vaksin TEXT NOT NULL DEFAULT 'Belum',
  tiket TEXT NOT NULL DEFAULT 'Belum',
  catatan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dokumen TO authenticated;
GRANT ALL ON public.dokumen TO service_role;
ALTER TABLE public.dokumen ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dokumen_all" ON public.dokumen FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_dokumen_updated BEFORE UPDATE ON public.dokumen FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- KEUANGAN
CREATE TABLE public.keuangan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  keterangan TEXT NOT NULL,
  kategori TEXT NOT NULL DEFAULT 'Operasional',
  jenis TEXT NOT NULL DEFAULT 'Masuk',
  nominal NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.keuangan TO authenticated;
GRANT ALL ON public.keuangan TO service_role;
ALTER TABLE public.keuangan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "keuangan_all" ON public.keuangan FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_keuangan_updated BEFORE UPDATE ON public.keuangan FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- PENGATURAN
CREATE TABLE public.pengaturan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_travel TEXT NOT NULL DEFAULT 'Umroh Travel',
  alamat TEXT,
  telepon TEXT,
  email TEXT,
  no_izin TEXT,
  mata_uang TEXT NOT NULL DEFAULT 'IDR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pengaturan TO authenticated;
GRANT ALL ON public.pengaturan TO service_role;
ALTER TABLE public.pengaturan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pengaturan_all" ON public.pengaturan FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_pengaturan_updated BEFORE UPDATE ON public.pengaturan FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- SEED
INSERT INTO public.pengaturan (nama_travel, alamat, telepon, email, no_izin, mata_uang)
VALUES ('Umroh Travel', 'Jl. Merdeka No. 12, Jakarta Pusat', '021-5550123', 'info@umrohtravel.id', 'PPIU/2024/0871', 'IDR');

INSERT INTO public.paket (nama, harga, durasi, kuota, tersisa, hotel, maskapai) VALUES
  ('Paket VIP 14 Hari', 65000000, 14, 25, 4, 'Bintang 5', 'Saudi Airlines'),
  ('Paket Plus 12 Hari', 52000000, 12, 30, 8, 'Bintang 4', 'Garuda Indonesia'),
  ('Paket Hemat 9 Hari', 35000000, 9, 40, 12, 'Bintang 3', 'Lion Air'),
  ('Paket Promo 9 Hari', 28500000, 9, 45, 20, 'Bintang 3', 'Citilink');

INSERT INTO public.jamaah (nama, nik, telepon, email, alamat, paket_id, status) VALUES
  ('Ahmad Subagyo', '3201011970001', '0812-3456-1000', 'ahmad@mail.com', 'Bandung', (SELECT id FROM public.paket WHERE nama='Paket Hemat 9 Hari'), 'Booking'),
  ('Novi Wisudawati', '3201011970002', '0812-3456-1001', 'novi@mail.com', 'Jakarta', (SELECT id FROM public.paket WHERE nama='Paket Plus 12 Hari'), 'Konfirmasi'),
  ('Muhammad Ridwan', '3201011970003', '0812-3456-1002', 'ridwan@mail.com', 'Medan', (SELECT id FROM public.paket WHERE nama='Paket VIP 14 Hari'), 'Berangkat'),
  ('Yuliana Saputri', '3201011970004', '0812-3456-1003', 'yuliana@mail.com', 'Surabaya', (SELECT id FROM public.paket WHERE nama='Paket Hemat 9 Hari'), 'Selesai'),
  ('Siti Aminah', '3201011970005', '0812-3456-1004', 'siti@mail.com', 'Semarang', (SELECT id FROM public.paket WHERE nama='Paket Promo 9 Hari'), 'Booking'),
  ('Budi Santoso', '3201011970006', '0812-3456-1005', 'budi@mail.com', 'Yogyakarta', (SELECT id FROM public.paket WHERE nama='Paket Plus 12 Hari'), 'Konfirmasi');

INSERT INTO public.keberangkatan (kode, tanggal, rute, maskapai, jumlah_jamaah, status) VALUES
  ('KB-001', '2025-05-23', 'GIA – JED', 'Garuda Indonesia', 12, 'Terkonfirmasi'),
  ('KB-002', '2025-05-25', 'CGK – JED', 'Saudi Airlines', 28, 'Terkonfirmasi'),
  ('KB-003', '2025-05-28', 'KNO – JED', 'Lion Air', 15, 'Menunggu'),
  ('KB-004', '2025-05-30', 'SUB – JED', 'Citilink', 22, 'Terkonfirmasi');

INSERT INTO public.pemesanan (invoice, jamaah_id, paket_id, tanggal, total, status) VALUES
  ('INV/250523/0012', (SELECT id FROM public.jamaah WHERE nama='Ahmad Subagyo'), (SELECT id FROM public.paket WHERE nama='Paket Hemat 9 Hari'), '2025-05-23', 35000000, 'Booking'),
  ('INV/250523/0011', (SELECT id FROM public.jamaah WHERE nama='Novi Wisudawati'), (SELECT id FROM public.paket WHERE nama='Paket Plus 12 Hari'), '2025-05-23', 52000000, 'Konfirmasi'),
  ('INV/250523/0010', (SELECT id FROM public.jamaah WHERE nama='Muhammad Ridwan'), (SELECT id FROM public.paket WHERE nama='Paket VIP 14 Hari'), '2025-05-23', 65000000, 'Berangkat'),
  ('INV/250522/0009', (SELECT id FROM public.jamaah WHERE nama='Yuliana Saputri'), (SELECT id FROM public.paket WHERE nama='Paket Hemat 9 Hari'), '2025-05-22', 35000000, 'Selesai');

INSERT INTO public.pembayaran (invoice, jamaah_id, total, dibayar, metode, status, tanggal) VALUES
  ('INV/250523/0012', (SELECT id FROM public.jamaah WHERE nama='Ahmad Subagyo'), 35000000, 10000000, 'Transfer BCA', 'DP', '2025-05-23'),
  ('INV/250523/0011', (SELECT id FROM public.jamaah WHERE nama='Novi Wisudawati'), 52000000, 30000000, 'Transfer Mandiri', 'Cicilan', '2025-05-23'),
  ('INV/250523/0010', (SELECT id FROM public.jamaah WHERE nama='Muhammad Ridwan'), 65000000, 65000000, 'Kartu Kredit', 'Lunas', '2025-05-23'),
  ('INV/250522/0009', (SELECT id FROM public.jamaah WHERE nama='Yuliana Saputri'), 35000000, 35000000, 'Tunai', 'Lunas', '2025-05-22');

INSERT INTO public.dokumen (jamaah_id, passport, passport_expired, visa, vaksin, tiket) VALUES
  ((SELECT id FROM public.jamaah WHERE nama='Ahmad Subagyo'), 'Aktif', '2029-04-10', 'Selesai', 'Selesai', 'Terbit'),
  ((SELECT id FROM public.jamaah WHERE nama='Novi Wisudawati'), 'Aktif', '2030-01-22', 'Proses', 'Selesai', 'Belum'),
  ((SELECT id FROM public.jamaah WHERE nama='Muhammad Ridwan'), 'Segera Expired', '2025-08-15', 'Selesai', 'Selesai', 'Terbit'),
  ((SELECT id FROM public.jamaah WHERE nama='Yuliana Saputri'), 'Aktif', '2028-11-03', 'Belum', 'Belum', 'Belum');

INSERT INTO public.keuangan (tanggal, keterangan, kategori, jenis, nominal) VALUES
  ('2025-05-01', 'Pelunasan paket VIP', 'Pendapatan Paket', 'Masuk', 65000000),
  ('2025-05-05', 'DP paket Plus', 'Pendapatan Paket', 'Masuk', 30000000),
  ('2025-05-07', 'Pembelian tiket maskapai', 'Operasional', 'Keluar', 42000000),
  ('2025-05-12', 'Booking hotel Makkah', 'Akomodasi', 'Keluar', 28000000),
  ('2025-05-18', 'Pelunasan paket Hemat', 'Pendapatan Paket', 'Masuk', 35000000),
  ('2025-05-20', 'Gaji karyawan', 'Gaji', 'Keluar', 18000000);