import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  PlaneTakeoff, Hotel, ShieldCheck, Users, Star, Menu, X, Phone,
  MapPin, Mail, CalendarDays, CheckCircle2, ArrowRight, Sparkles, BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { rupiah, tanggalID, type Row } from "@/lib/crud";
import heroKabah from "@/assets/hero-kabah.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Umroh Travel — Perjalanan Ibadah Umroh Penuh Berkah" },
      { name: "description", content: "Biro perjalanan umroh terpercaya: paket umroh hemat hingga VIP, hotel dekat Masjidil Haram, pembimbing berpengalaman, dan jadwal keberangkatan terbaru." },
      { property: "og:title", content: "Umroh Travel — Perjalanan Ibadah Umroh Penuh Berkah" },
      { property: "og:description", content: "Pilih paket umroh terbaik, lihat jadwal keberangkatan, dan daftar dengan mudah bersama pembimbing berpengalaman." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

const db = supabase as any;

function useLandingData() {
  return useQuery({
    queryKey: ["landing"],
    queryFn: async () => {
      const [paket, keberangkatan] = await Promise.all([
        db.from("paket").select("*").order("harga", { ascending: true }),
        db.from("keberangkatan").select("*").order("tanggal", { ascending: true }),
      ]);
      return {
        paket: (paket.data ?? []) as Row[],
        keberangkatan: (keberangkatan.data ?? []) as Row[],
      };
    },
  });
}

const navLinks = [
  { href: "#paket", label: "Paket Umroh" },
  { href: "#jadwal", label: "Jadwal" },
  { href: "#layanan", label: "Layanan" },
  { href: "#alur", label: "Alur Pendaftaran" },
  { href: "#kontak", label: "Kontak" },
];

function Pattern({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 opacity-[0.07] ${className}`}
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, currentColor 1.5px, transparent 0), radial-gradient(circle at 21px 21px, currentColor 1.5px, transparent 0)",
        backgroundSize: "40px 40px",
      }}
    />
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-emerald-700 text-primary-foreground shadow-md">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M4 20V10l8-6 8 6v10" /><path d="M9 20v-6h6v6" />
            </svg>
          </div>
          <div className="leading-tight">
            <div className="text-lg font-black tracking-tight">UMROH</div>
            <div className="text-[11px] font-semibold tracking-[0.25em] text-amber-600">TRAVEL</div>
          </div>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-accent hover:text-accent-foreground">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-2">
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link to="/pesanan">Cek Pesanan</Link>
          </Button>
          <Button asChild variant="ghost" className="hidden lg:inline-flex">
            <Link to="/auth">Masuk Admin</Link>
          </Button>
          <Button asChild className="gap-2">
            <Link to="/pesan" search={{ paket: undefined }}>Daftar Umroh <ArrowRight className="h-4 w-4" /></Link>
          </Button>

          <Button variant="outline" size="icon" className="lg:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {open && (
        <nav className="border-t bg-background px-4 py-3 lg:hidden">
          <div className="flex flex-col">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-accent">
                {l.label}
              </a>
            ))}
            <Link to="/pesanan" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-foreground/80 hover:bg-accent">Cek Pesanan Saya</Link>
            <Link to="/auth" className="rounded-lg px-3 py-2.5 text-sm font-semibold text-primary hover:bg-accent">Masuk Admin</Link>

          </div>
        </nav>
      )}
    </header>
  );
}

function Hero({ paketCount, jadwalCount, jamaahCount }: { paketCount: number; jadwalCount: number; jamaahCount: number }) {
  return (
    <section className="relative overflow-hidden">
      <img
        src={heroKabah}
        alt="Ka'bah di Masjidil Haram saat fajar dengan jamaah berihram"
        width={1600}
        height={1008}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-900/80 to-emerald-900/40" />
      <Pattern className="text-amber-200" />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 md:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="text-emerald-50">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-300/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-amber-200">
            <Sparkles className="h-3.5 w-3.5" /> Berizin resmi PPIU • Pembimbing berpengalaman
          </span>
          <p className="mt-6 font-display text-lg text-amber-200/90">بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</p>
          <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Wujudkan Perjalanan <span className="text-amber-300">Umroh</span> yang Tenang &amp; Penuh Berkah
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-emerald-100/85 sm:text-lg">
            Kami mendampingi setiap langkah ibadah Anda — dari pendaftaran, manasik, hotel dekat
            Masjidil Haram, hingga kembali ke tanah air dengan selamat.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="gap-2 bg-amber-400 text-emerald-950 hover:bg-amber-300">
              <a href="#paket">Lihat Paket Umroh <ArrowRight className="h-4 w-4" /></a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-emerald-200/40 bg-transparent text-emerald-50 hover:bg-emerald-50/10 hover:text-emerald-50">
              <a href="#jadwal">Jadwal Keberangkatan</a>
            </Button>
          </div>

          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-emerald-200/20 pt-6">
            {[
              { label: "Paket tersedia", value: paketCount },
              { label: "Jadwal grup", value: jadwalCount },
              { label: "Kuota jamaah", value: jamaahCount },
            ].map((s) => (
              <div key={s.label}>
                <dt className="text-xs text-emerald-100/70">{s.label}</dt>
                <dd className="text-2xl font-bold text-amber-300 sm:text-3xl">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative hidden lg:block">
          <div className="rounded-3xl border border-emerald-200/20 bg-emerald-950/40 p-6 backdrop-blur-md">
            <h2 className="text-lg font-bold text-emerald-50">Mengapa memilih kami?</h2>
            <ul className="mt-4 space-y-3 text-sm text-emerald-100/85">
              {[
                "Hotel berjarak dekat dari Masjidil Haram & Masjid Nabawi",
                "Muthawwif & pembimbing ibadah berbahasa Indonesia",
                "Manasik umroh dan perlengkapan lengkap",
                "Transparansi biaya tanpa biaya tersembunyi",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

const layanan = [
  { icon: Hotel, title: "Hotel Dekat Haram", desc: "Akomodasi bintang 3 hingga bintang 5 dengan jarak tempuh singkat ke masjid." },
  { icon: PlaneTakeoff, title: "Penerbangan Nyaman", desc: "Maskapai terpercaya dengan rute langsung maupun transit singkat." },
  { icon: BookOpen, title: "Bimbingan Manasik", desc: "Pelatihan ibadah sebelum keberangkatan agar ibadah lebih khusyuk." },
  { icon: ShieldCheck, title: "Perlindungan Jamaah", desc: "Asuransi perjalanan, visa resmi, dan pendampingan penuh di tanah suci." },
  { icon: Users, title: "Grup Terbatas", desc: "Jumlah jamaah per grup dibatasi agar pelayanan tetap personal." },
  { icon: CalendarDays, title: "Jadwal Fleksibel", desc: "Pilihan keberangkatan sepanjang tahun sesuai kesiapan Anda." },
];

function LandingPage() {
  const { data, isLoading } = useLandingData();
  const paket = data?.paket ?? [];
  const keberangkatan = data?.keberangkatan ?? [];
  const kuota = paket.reduce((s, p) => s + Number(p.kuota ?? 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero paketCount={paket.length} jadwalCount={keberangkatan.length} jamaahCount={kuota} />

        {/* Paket */}
        <section id="paket" className="relative mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 md:py-24">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600">Paket Umroh</span>
            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Pilihan paket sesuai kebutuhan Anda</h2>
            <p className="mt-3 text-muted-foreground">
              Semua paket telah mencakup tiket penerbangan, visa, hotel, konsumsi, dan pembimbing ibadah.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-72 animate-pulse rounded-2xl bg-muted" />
              ))}
            {!isLoading && paket.length === 0 && (
              <p className="text-sm text-muted-foreground">Paket akan segera diumumkan, silakan hubungi kami.</p>
            )}
            {paket.map((p, i) => {
              const unggulan = i === 1;
              return (
                <Card key={p.id} className={`relative flex flex-col overflow-hidden border-none shadow-sm transition-shadow hover:shadow-lg ${unggulan ? "ring-2 ring-primary" : ""}`}>
                  {unggulan && (
                    <div className="absolute right-4 top-4 rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground">
                      Terfavorit
                    </div>
                  )}
                  <CardContent className="flex flex-1 flex-col p-6">
                    <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                      <Star className="h-3.5 w-3.5" /> {p.hotel ?? "Bintang 3"}
                    </div>
                    <h3 className="mt-4 text-xl font-bold tracking-tight">{p.nama}</h3>
                    <div className="mt-2 text-2xl font-black text-primary">{rupiah(p.harga)}</div>
                    <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" /> {p.durasi ?? 9} hari perjalanan</li>
                      <li className="flex items-center gap-2"><PlaneTakeoff className="h-4 w-4 text-primary" /> {p.maskapai ?? "Maskapai pilihan"}</li>
                      <li className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Kuota {p.kuota ?? 0} jamaah</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Sisa kursi {p.tersisa ?? 0}</li>
                    </ul>
                    <Button asChild className="mt-6 w-full gap-2">
                      <Link to="/pesan" search={{ paket: p.id as string }}>Daftar Paket Ini <ArrowRight className="h-4 w-4" /></Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Jadwal */}
        <section id="jadwal" className="relative scroll-mt-20 overflow-hidden bg-gradient-to-br from-emerald-950 to-emerald-900 py-16 text-emerald-50 md:py-24">
          <Pattern className="text-amber-200" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Jadwal Keberangkatan</span>
              <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Grup keberangkatan terdekat</h2>
              <p className="mt-3 text-emerald-100/80">Data jadwal diperbarui langsung dari sistem operasional kami.</p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {keberangkatan.slice(0, 6).map((k) => (
                <div key={k.id} className="rounded-2xl border border-emerald-200/15 bg-emerald-50/5 p-5 backdrop-blur-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold tracking-widest text-amber-300">{k.kode}</div>
                      <div className="mt-1 text-lg font-bold">{k.rute ?? "CGK – JED"}</div>
                    </div>
                    <span className="rounded-full bg-amber-300/15 px-2.5 py-1 text-[11px] font-semibold text-amber-200">{k.status ?? "Menunggu"}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-emerald-100/80">
                    <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> {tanggalID(k.tanggal)}</span>
                    <span className="flex items-center gap-1.5"><PlaneTakeoff className="h-4 w-4" /> {k.maskapai ?? "-"}</span>
                    <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {k.jumlah_jamaah ?? 0} jamaah</span>
                  </div>
                </div>
              ))}
              {!isLoading && keberangkatan.length === 0 && (
                <p className="text-sm text-emerald-100/80">Jadwal baru sedang disusun. Hubungi kami untuk informasi terbaru.</p>
              )}
            </div>
          </div>
        </section>

        {/* Layanan */}
        <section id="layanan" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 md:py-24">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600">Layanan Kami</span>
            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Ibadah tenang, urusan kami yang atur</h2>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {layanan.map((l) => {
              const I = l.icon;
              return (
                <Card key={l.title} className="border-none shadow-sm transition-shadow hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-accent text-primary">
                      <I className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold tracking-tight">{l.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{l.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Alur */}
        <section id="alur" className="scroll-mt-20 bg-secondary/60 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600">Alur Pendaftaran</span>
              <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Empat langkah menuju tanah suci</h2>
            </div>
            <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { t: "Pilih Paket", d: "Konsultasikan kebutuhan dan pilih paket yang sesuai." },
                { t: "Lengkapi Dokumen", d: "Serahkan paspor, KTP, foto, dan kartu vaksin." },
                { t: "Pembayaran", d: "Bayar DP lalu lunasi sesuai jadwal yang disepakati." },
                { t: "Manasik & Berangkat", d: "Ikuti manasik, terima perlengkapan, lalu berangkat." },
              ].map((s, i) => (
                <li key={s.t} className="rounded-2xl bg-card p-6 shadow-sm">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{i + 1}</div>
                  <h3 className="mt-4 font-bold tracking-tight">{s.t}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{s.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Kontak / CTA */}
        <section id="kontak" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 md:py-24">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-emerald-700 p-8 text-primary-foreground md:p-12">
            <Pattern className="text-amber-100" />
            <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Siap berangkat ke Baitullah?</h2>
                <p className="mt-3 max-w-lg text-primary-foreground/85">
                  Hubungi tim kami untuk konsultasi gratis. Kami bantu pilih paket, hitung biaya,
                  dan siapkan seluruh dokumen keberangkatan Anda.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button asChild size="lg" className="gap-2 bg-amber-400 text-emerald-950 hover:bg-amber-300">
                    <a href="tel:+622112345678"><Phone className="h-4 w-4" /> Hubungi Kami</a>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                    <Link to="/auth">Masuk Dashboard Admin</Link>
                  </Button>
                </div>
              </div>
              <div className="space-y-3 rounded-2xl bg-primary-foreground/10 p-6 text-sm backdrop-blur-sm">
                <div className="flex items-center gap-3"><Phone className="h-4 w-4 shrink-0" /> +62 21 1234 5678</div>
                <div className="flex items-center gap-3"><Mail className="h-4 w-4 shrink-0" /> info@umrohtravel.id</div>
                <div className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /> Jl. Masjid Raya No. 12, Jakarta Selatan</div>
                <div className="flex items-start gap-3"><CalendarDays className="mt-0.5 h-4 w-4 shrink-0" /> Senin – Sabtu, 08.00 – 17.00 WIB</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <div className="text-sm font-black tracking-tight">UMROH TRAVEL</div>
            <p className="mt-1 text-xs text-muted-foreground">Melayani perjalanan ibadah dengan amanah.</p>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Umroh Travel. Seluruh hak cipta dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}
