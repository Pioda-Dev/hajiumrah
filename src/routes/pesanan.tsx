import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Clock, CreditCard, Package,
  ReceiptText, LogIn, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { rupiah, tanggalID, type Row } from "@/lib/crud";

export const Route = createFileRoute("/pesanan")({
  head: () => ({
    meta: [
      { title: "Konfirmasi Pemesanan — Umroh Travel" },
      { name: "description", content: "Lihat paket umroh yang sudah Anda pesan, nomor invoice, status pemesanan, dan rincian pembayaran Anda." },
      { property: "og:title", content: "Konfirmasi Pemesanan — Umroh Travel" },
      { property: "og:description", content: "Pantau status pemesanan umroh dan rincian pembayaran Anda." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: KonfirmasiPemesanan,
});

const db = supabase as any;

function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  return { session, loading };
}

function statusTone(status: string) {
  const s = (status ?? "").toLowerCase();
  if (s.includes("lunas") || s.includes("selesai") || s.includes("berangkat")) return "bg-primary/10 text-primary";
  if (s.includes("konfirmasi")) return "bg-emerald-500/10 text-emerald-700";
  if (s.includes("batal")) return "bg-destructive/10 text-destructive";
  return "bg-amber-500/10 text-amber-700";
}

function Badge({ value }: { value: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusTone(value)}`}>
      <CheckCircle2 className="h-3.5 w-3.5" /> {value || "-"}
    </span>
  );
}

function KonfirmasiPemesanan() {
  const { session, loading } = useSession();
  const masuk = !!session;

  const { data, isLoading } = useQuery({
    queryKey: ["pesanan-saya", session?.user?.id ?? "anon"],
    enabled: masuk,
    queryFn: async () => {
      const [pesanan, bayar] = await Promise.all([
        db.from("pemesanan").select("*, paket:paket_id(nama, durasi, hotel, maskapai), jamaah:jamaah_id(nama, telepon)").order("tanggal", { ascending: false }),
        db.from("pembayaran").select("*"),
      ]);
      return {
        pesanan: (pesanan.data ?? []) as Row[],
        bayar: (bayar.data ?? []) as Row[],
      };
    },
  });

  const pesanan = data?.pesanan ?? [];
  const bayarByInvoice = new Map((data?.bayar ?? []).map((b) => [String(b["invoice"]), b]));

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 sm:px-6">
          <Button asChild variant="ghost" size="sm" className="gap-2">
            <Link to="/"><ArrowLeft className="h-4 w-4" /> Beranda</Link>
          </Button>
          <div className="ml-auto">
            <Button asChild size="sm" className="gap-2">
              <Link to="/pesan" search={{ paket: undefined }}>Pesan lagi <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Konfirmasi Pemesanan</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Paket umroh yang sudah Anda pesan beserta status dan rincian pembayarannya.
          </p>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Memuat…
          </div>
        )}

        {!loading && !masuk && (
          <Card className="border-none shadow-sm">
            <CardContent className="p-8 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
                <LogIn className="h-7 w-7" />
              </div>
              <h2 className="mt-4 text-lg font-bold">Masuk untuk melihat pesanan Anda</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Gunakan akun yang Anda pakai saat mendaftar paket umroh.
              </p>
              <Button asChild className="mt-5"><Link to="/auth">Masuk ke akun</Link></Button>
            </CardContent>
          </Card>
        )}

        {masuk && isLoading && (
          <div className="grid gap-4">
            {Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-40 animate-pulse rounded-2xl bg-muted" />)}
          </div>
        )}

        {masuk && !isLoading && pesanan.length === 0 && (
          <Card className="border-none shadow-sm">
            <CardContent className="p-8 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent text-primary">
                <Package className="h-7 w-7" />
              </div>
              <h2 className="mt-4 text-lg font-bold">Belum ada pemesanan</h2>
              <p className="mt-2 text-sm text-muted-foreground">Pilih paket umroh dan selesaikan pendaftaran Anda.</p>
              <Button asChild className="mt-5 gap-2">
                <Link to="/pesan" search={{ paket: undefined }}>Lihat paket umroh <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {masuk && pesanan.map((p) => {
            const paket = (p["paket"] ?? {}) as Row;
            const jamaah = (p["jamaah"] ?? {}) as Row;
            const bayar = bayarByInvoice.get(String(p["invoice"]));
            const total = Number(p["total"] ?? 0);
            const dibayar = Number(bayar?.["dibayar"] ?? 0);
            const sisa = Math.max(0, total - dibayar);
            const persen = total > 0 ? Math.min(100, Math.round((dibayar / total) * 100)) : 0;
            return (
              <Card key={String(p["id"])} className="border-none shadow-sm">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <ReceiptText className="h-4 w-4 text-primary" /> {String(p["invoice"] ?? "-")}
                      </div>
                      <h2 className="mt-1 truncate text-lg font-bold tracking-tight">
                        {String(paket["nama"] ?? "Paket umroh")}
                      </h2>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        Atas nama {String(jamaah["nama"] ?? "-")} · {tanggalID(p["tanggal"] as string)}
                      </p>
                    </div>
                    <Badge value={String(p["status"] ?? "")} />
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border p-3">
                      <div className="text-xs text-muted-foreground">Total biaya</div>
                      <div className="mt-0.5 font-bold">{rupiah(total)}</div>
                    </div>
                    <div className="rounded-xl border p-3">
                      <div className="text-xs text-muted-foreground">Sudah dibayar</div>
                      <div className="mt-0.5 font-bold text-primary">{rupiah(dibayar)}</div>
                    </div>
                    <div className="rounded-xl border p-3">
                      <div className="text-xs text-muted-foreground">Sisa tagihan</div>
                      <div className="mt-0.5 font-bold">{rupiah(sisa)}</div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${persen}%` }} />
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5" /> {String(bayar?.["metode"] ?? "Belum ada pembayaran")}</span>
                      <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Pembayaran {persen}% {bayar?.["status"] ? `· ${String(bayar["status"])}` : ""}</span>
                      {paket["durasi"] ? <span>{String(paket["durasi"])} hari · {String(paket["hotel"] ?? "-")}</span> : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
