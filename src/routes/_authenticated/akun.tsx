import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  User, Package, CreditCard, FileCheck2, PlaneTakeoff, Plane, CalendarDays, CheckCircle2, XCircle, Phone, Mail, MapPin,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/crud-view";
import { PageHeader } from "@/components/app-shell";
import { supabase } from "@/integrations/supabase/client";
import { rupiah, tanggalID, type Row } from "@/lib/crud";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/akun")({
  head: () => ({
    meta: [
      { title: "Dashboard Jamaah — Umroh Travel" },
      { name: "description", content: "Pantau status pendaftaran, pemesanan, pembayaran, dan kelengkapan dokumen umroh Anda." },
      { property: "og:title", content: "Dashboard Jamaah — Umroh Travel" },
      { property: "og:description", content: "Status pemesanan, pembayaran, dan dokumen umroh Anda dalam satu halaman." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AkunJamaah,
});

const db = supabase as any;

function useMyData(email?: string | null) {
  return useQuery({
    queryKey: ["akun-jamaah", email],
    enabled: !!email,
    queryFn: async () => {
      const { data: jamaahRows } = await db.from("jamaah").select("*, paket:paket_id(*)");
      const jamaah = ((jamaahRows ?? []) as Row[])[0] ?? null;
      if (!jamaah) return { jamaah: null, pemesanan: [] as Row[], pembayaran: [] as Row[], dokumen: null as Row | null };
      const [pemesanan, pembayaran, dokumen, keberangkatan] = await Promise.all([
        db.from("pemesanan").select("*, paket:paket_id(nama)").eq("jamaah_id", jamaah.id).order("tanggal", { ascending: false }),
        db.from("pembayaran").select("*").eq("jamaah_id", jamaah.id).order("tanggal", { ascending: false }),
        db.from("dokumen").select("*").eq("jamaah_id", jamaah.id).limit(1),
        db.from("keberangkatan").select("*").gte("tanggal", new Date().toISOString().slice(0, 10)).order("tanggal", { ascending: true }).limit(4),
      ]);
      return {
        jamaah,
        pemesanan: (pemesanan.data ?? []) as Row[],
        pembayaran: (pembayaran.data ?? []) as Row[],
        dokumen: (((dokumen.data ?? []) as Row[])[0] ?? null),
        keberangkatan: (keberangkatan.data ?? []) as Row[],
      };
    },
  });
}

const DOK_FIELDS: { key: string; label: string }[] = [
  { key: "passport", label: "Paspor" },
  { key: "visa", label: "Visa" },
  { key: "vaksin", label: "Vaksin Meningitis" },
  { key: "tiket", label: "Tiket Pesawat" },
];

function AkunJamaah() {
  const { user } = useAuth();
  const email = user?.email ?? null;
  const { data, isLoading } = useMyData(email);

  const jamaah = data?.jamaah ?? null;
  const pemesanan = data?.pemesanan ?? [];
  const pembayaran = data?.pembayaran ?? [];
  const dokumen = data?.dokumen ?? null;

  const totalTagihan = pembayaran.reduce((s, p) => s + Number(p.total ?? 0), 0);
  const totalDibayar = pembayaran.reduce((s, p) => s + Number(p.dibayar ?? 0), 0);
  const sisa = Math.max(0, totalTagihan - totalDibayar);
  const progress = totalTagihan > 0 ? Math.min(100, (totalDibayar / totalTagihan) * 100) : 0;

  const dokLengkap = dokumen ? DOK_FIELDS.filter((f) => dokumen[f.key] === "Lengkap" || dokumen[f.key] === "Selesai" || dokumen[f.key] === "Ada").length : 0;

  if (isLoading) {
    return <p className="py-16 text-center text-sm text-muted-foreground">Memuat data Anda...</p>;
  }

  if (!jamaah) {
    return (
      <>
        <PageHeader title="Dashboard Jamaah" description="Status pendaftaran umroh Anda" />
        <Card className="border-none shadow-sm">
          <CardContent className="grid place-items-center gap-3 p-10 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary"><User className="h-7 w-7" /></div>
            <h2 className="text-lg font-bold">Data jamaah belum terdaftar</h2>
            <p className="max-w-md text-sm text-muted-foreground">
              Akun <span className="font-medium">{email}</span> belum terhubung dengan data pendaftaran jamaah.
              Silakan hubungi kantor kami agar email ini didaftarkan pada data jamaah Anda.
            </p>
            <Button asChild className="mt-2"><Link to="/">Lihat Paket Umroh</Link></Button>
          </CardContent>
        </Card>
      </>
    );
  }

  const stats = [
    { label: "Status Jamaah", value: jamaah.status ?? "-", icon: User, tone: "bg-emerald-100 text-emerald-700" },
    { label: "Paket Dipilih", value: jamaah.paket?.nama ?? "Belum dipilih", icon: Package, tone: "bg-amber-100 text-amber-700" },
    { label: "Sisa Pembayaran", value: rupiah(sisa), icon: CreditCard, tone: "bg-blue-100 text-blue-700" },
    { label: "Dokumen Lengkap", value: `${dokLengkap}/${DOK_FIELDS.length}`, icon: FileCheck2, tone: "bg-sky-100 text-sky-700" },
  ];

  return (
    <>
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-primary to-emerald-700 p-6 text-primary-foreground shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Assalamu'alaikum, {jamaah.nama} 🕋</h1>
        <p className="mt-1 text-sm text-primary-foreground/85">Berikut perkembangan perjalanan umroh Anda.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => {
          const I = s.icon;
          return (
            <Card key={s.label} className="border-none shadow-sm">
              <CardContent className="p-5">
                <div className={`grid h-11 w-11 place-items-center rounded-xl ${s.tone}`}><I className="h-5 w-5" /></div>
                <div className="mt-3 truncate text-xl font-bold tracking-tight">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="border-none shadow-sm lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Progres Pembayaran</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <div className="text-2xl font-bold">{rupiah(totalDibayar)}</div>
                <div className="text-xs text-muted-foreground">dari total {rupiah(totalTagihan)}</div>
              </div>
              <div className="text-sm font-semibold text-primary">{progress.toFixed(0)}%</div>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-600" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-5 space-y-3">
              {pembayaran.map((p) => (
                <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{p.invoice}</div>
                    <div className="text-xs text-muted-foreground">{tanggalID(p.tanggal)} • {p.metode}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-semibold">{rupiah(p.dibayar)}</div>
                      <div className="text-[11px] text-muted-foreground">dari {rupiah(p.total)}</div>
                    </div>
                    <StatusBadge value={p.status} />
                  </div>
                </div>
              ))}
              {pembayaran.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Belum ada tagihan pembayaran.</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader><CardTitle className="text-base">Kelengkapan Dokumen</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {DOK_FIELDS.map((f) => {
              const val = (dokumen?.[f.key] as string) ?? "Belum";
              const ok = ["Lengkap", "Selesai", "Ada"].includes(val);
              return (
                <div key={f.key} className="flex items-center justify-between gap-2 rounded-xl border p-3">
                  <span className="text-sm font-medium">{f.label}</span>
                  <span className={`flex items-center gap-1.5 text-xs font-semibold ${ok ? "text-emerald-600" : "text-muted-foreground"}`}>
                    {ok ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />} {val}
                  </span>
                </div>
              );
            })}
            {dokumen?.passport_expired && (
              <p className="text-xs text-muted-foreground">Paspor berlaku hingga {tanggalID(dokumen.passport_expired)}</p>
            )}
            {dokumen?.catatan && <p className="rounded-xl bg-accent/50 p-3 text-xs">{dokumen.catatan}</p>}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="border-none shadow-sm">
          <CardHeader><CardTitle className="text-base">Pemesanan Saya</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {pemesanan.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{p.paket?.nama ?? "-"}</div>
                  <div className="text-xs text-muted-foreground">{p.invoice} • {tanggalID(p.tanggal)}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">{rupiah(p.total)}</span>
                  <StatusBadge value={p.status} />
                </div>
              </div>
            ))}
            {pemesanan.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Belum ada pemesanan.</p>}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader><CardTitle className="text-base">Data Diri & Paket</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Info icon={User} label="Nama" value={jamaah.nama} />
            <Info icon={FileCheck2} label="NIK" value={jamaah.nik ?? "-"} />
            <Info icon={Phone} label="Telepon" value={jamaah.telepon ?? "-"} />
            <Info icon={Mail} label="Email" value={jamaah.email ?? "-"} />
            <Info icon={MapPin} label="Alamat" value={jamaah.alamat ?? "-"} />
            {jamaah.paket && (
              <div className="rounded-xl border bg-accent/40 p-3">
                <div className="flex items-center gap-2 font-semibold"><PlaneTakeoff className="h-4 w-4 text-primary" /> {jamaah.paket.nama}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {jamaah.paket.durasi} hari • {jamaah.paket.hotel} • {jamaah.paket.maskapai || "Maskapai menyusul"}
                </div>
                <div className="mt-1 font-bold text-primary">{rupiah(jamaah.paket.harga)}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Info({ icon: I, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <I className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="break-words font-medium">{value}</div>
      </div>
    </div>
  );
}
