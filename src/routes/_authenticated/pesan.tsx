import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Package, CheckCircle2, Users, CalendarDays, PlaneTakeoff, ArrowRight, ArrowLeft,
  CreditCard, Star, Loader2, ReceiptText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { rupiah, type Row } from "@/lib/crud";
import { useAuth } from "@/hooks/useAuth";
import { buatPemesanan } from "@/lib/pemesanan.functions";

export const Route = createFileRoute("/_authenticated/pesan")({
  head: () => ({
    meta: [
      { title: "Pesan Umroh — Umroh Travel Management" },
      { name: "description", content: "Pilih paket umroh, lengkapi data jamaah, dan selesaikan pembayaran dalam tiga langkah mudah." },
      { property: "og:title", content: "Pesan Umroh — Umroh Travel Management" },
      { property: "og:description", content: "Pemesanan paket umroh online: pilih paket, isi data, bayar DP atau lunas." },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    paket: typeof search["paket"] === "string" ? (search["paket"] as string) : undefined,
  }),
  component: PesanPage,
});

const db = supabase as any;
const METODE = ["Transfer BCA", "Transfer Mandiri", "Transfer BSI", "Tunai"] as const;

function usePaket() {
  return useQuery({
    queryKey: ["paket-publik"],
    queryFn: async (): Promise<Row[]> => {
      const { data, error } = await db.from("paket").select("*").order("harga", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });
}

const STEPS = ["Pilih Paket", "Data Jamaah", "Pembayaran"];

function Stepper({ step }: { step: number }) {
  return (
    <ol className="mb-6 grid grid-cols-3 gap-3">
      {STEPS.map((s, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <li key={s} className={`rounded-xl border p-3 ${active ? "border-primary bg-accent" : done ? "border-primary/40 bg-primary/5" : "bg-card"}`}>
            <div className="flex items-center gap-2">
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${active || done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </span>
              <span className="truncate text-sm font-semibold">{s}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function PesanPage() {
  const { paket: paketAwal } = Route.useSearch();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: paketList = [], isLoading } = usePaket();

  const [step, setStep] = useState(paketAwal ? 1 : 0);
  const [paketId, setPaketId] = useState<string | undefined>(paketAwal);
  const [nama, setNama] = useState((user?.user_metadata?.["full_name"] as string) ?? "");
  const [telepon, setTelepon] = useState("");
  const [nik, setNik] = useState("");
  const [alamat, setAlamat] = useState("");
  const [metode, setMetode] = useState<(typeof METODE)[number]>("Transfer BCA");
  const [jenisBayar, setJenisBayar] = useState<"DP" | "Lunas">("DP");
  const [hasil, setHasil] = useState<{ invoice: string; total: number; dibayar: number; status: string; paket_nama: string } | null>(null);

  type Payload = {
    paket_id: string;
    nama: string;
    telepon: string;
    alamat: string;
    nik: string;
    metode: (typeof METODE)[number];
    jenis_bayar: "DP" | "Lunas";
  };
  const pesan = useServerFn(buatPemesanan);
  const mutation = useMutation({
    mutationFn: (payload: Payload) => pesan({ data: payload }),
    onSuccess: (res) => {
      setHasil(res);
      qc.invalidateQueries();
      toast.success("Pemesanan berhasil dibuat");
    },
    onError: (e: any) => toast.error(e?.message ?? "Gagal membuat pemesanan"),
  });

  const paket = paketList.find((p) => p.id === paketId);
  const total = Number(paket?.harga ?? 0);
  const bayarSekarang = jenisBayar === "Lunas" ? total : Math.round(total * 0.3);

  if (hasil) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card className="border-none shadow-sm">
          <CardContent className="p-8 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight">Alhamdulillah, pemesanan tercatat</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Paket <span className="font-semibold text-foreground">{hasil.paket_nama}</span> untuk {nama}.
              Tim kami akan menghubungi Anda untuk verifikasi.
            </p>
            <div className="mt-6 space-y-2 rounded-xl border p-4 text-left text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">No. Invoice</span><span className="font-semibold">{hasil.invoice}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Total biaya</span><span className="font-semibold">{rupiah(hasil.total)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Sudah dibayar</span><span className="font-semibold text-primary">{rupiah(hasil.dibayar)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Sisa</span><span className="font-semibold">{rupiah(hasil.total - hasil.dibayar)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="font-semibold">{hasil.status}</span></div>
            </div>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button asChild><Link to="/akun">Lihat Dashboard Saya</Link></Button>
              <Button variant="outline" onClick={() => { setHasil(null); setStep(0); setPaketId(undefined); }}>
                Pesan paket lain
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Pemesanan Umroh</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tiga langkah: pilih paket, lengkapi data jamaah, lalu selesaikan pembayaran.</p>
      </div>

      <Stepper step={step} />

      {step === 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading && Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted" />)}
          {!isLoading && paketList.length === 0 && (
            <p className="text-sm text-muted-foreground">Belum ada paket tersedia.</p>
          )}
          {paketList.map((p) => {
            const penuh = Number(p.tersisa ?? 0) <= 0;
            const dipilih = p.id === paketId;
            return (
              <Card key={p.id} className={`flex flex-col border-none shadow-sm ${dipilih ? "ring-2 ring-primary" : ""}`}>
                <CardContent className="flex flex-1 flex-col p-5">
                  <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                    <Star className="h-3.5 w-3.5" /> {p.hotel ?? "Bintang 3"}
                  </div>
                  <h2 className="mt-3 text-lg font-bold tracking-tight">{p.nama}</h2>
                  <div className="mt-1 text-xl font-black text-primary">{rupiah(p.harga)}</div>
                  <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" /> {p.durasi ?? 9} hari</li>
                    <li className="flex items-center gap-2"><PlaneTakeoff className="h-4 w-4 text-primary" /> {p.maskapai ?? "-"}</li>
                    <li className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Sisa {p.tersisa ?? 0} kursi</li>
                  </ul>
                  <Button
                    className="mt-5 w-full gap-2"
                    disabled={penuh}
                    variant={dipilih ? "default" : "outline"}
                    onClick={() => { setPaketId(p.id as string); setStep(1); }}
                  >
                    {penuh ? "Kuota penuh" : <>Pilih paket ini <ArrowRight className="h-4 w-4" /></>}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {step === 1 && (
        <Card className="border-none shadow-sm">
          <CardHeader><CardTitle className="text-base">Data Jamaah</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border bg-accent/50 p-4 text-sm">
              <div className="flex items-center gap-2 font-semibold"><Package className="h-4 w-4 text-primary" /> {paket?.nama ?? "Paket belum dipilih"}</div>
              <div className="mt-1 text-muted-foreground">Total biaya {rupiah(total)}</div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nama">Nama lengkap (sesuai paspor) *</Label>
                <Input id="nama" value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Ahmad Fauzi" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telepon">Nomor telepon / WhatsApp *</Label>
                <Input id="telepon" value={telepon} onChange={(e) => setTelepon(e.target.value)} placeholder="0812xxxxxxx" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nik">NIK</Label>
                <Input id="nik" value={nik} onChange={(e) => setNik(e.target.value)} placeholder="32xxxxxxxxxxxxxx" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email akun</Label>
                <Input id="email" value={user?.email ?? ""} readOnly disabled />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="alamat">Alamat</Label>
                <Textarea id="alamat" value={alamat} onChange={(e) => setAlamat(e.target.value)} placeholder="Jl. Melati No. 5, Bandung" />
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-between">
              <Button variant="outline" className="gap-2" onClick={() => setStep(0)}><ArrowLeft className="h-4 w-4" /> Ganti paket</Button>
              <Button
                className="gap-2"
                disabled={!paketId || nama.trim().length < 3 || telepon.trim().length < 6}
                onClick={() => setStep(2)}
              >
                Lanjut ke pembayaran <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Card className="border-none shadow-sm">
            <CardHeader><CardTitle className="text-base">Pembayaran</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Jenis pembayaran</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(["DP", "Lunas"] as const).map((j) => (
                    <button
                      key={j}
                      type="button"
                      onClick={() => setJenisBayar(j)}
                      className={`rounded-xl border p-4 text-left transition-colors ${jenisBayar === j ? "border-primary bg-accent" : "hover:bg-accent/50"}`}
                    >
                      <div className="text-sm font-semibold">{j === "DP" ? "Bayar DP 30%" : "Bayar Lunas"}</div>
                      <div className="mt-1 text-lg font-bold text-primary">
                        {rupiah(j === "Lunas" ? total : Math.round(total * 0.3))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Metode pembayaran</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {METODE.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMetode(m)}
                      className={`flex items-center gap-2 rounded-xl border p-3 text-sm font-medium transition-colors ${metode === m ? "border-primary bg-accent" : "hover:bg-accent/50"}`}
                    >
                      <CreditCard className="h-4 w-4 text-primary" /> {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                <Button variant="outline" className="gap-2" onClick={() => setStep(1)}><ArrowLeft className="h-4 w-4" /> Kembali</Button>
                <Button
                  className="gap-2"
                  disabled={mutation.isPending || !paketId}
                  onClick={() =>
                    mutation.mutate({
                      paket_id: paketId!,
                      nama: nama.trim(),
                      telepon: telepon.trim(),
                      alamat: alamat.trim(),
                      nik: nik.trim(),
                      metode,
                      jenis_bayar: jenisBayar,
                    })
                  }
                >
                  {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ReceiptText className="h-4 w-4" />}
                  Selesaikan pembayaran
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader><CardTitle className="text-base">Ringkasan</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between gap-3"><span className="text-muted-foreground">Paket</span><span className="text-right font-semibold">{paket?.nama ?? "-"}</span></div>
              <div className="flex justify-between gap-3"><span className="text-muted-foreground">Nama jamaah</span><span className="text-right font-semibold">{nama || "-"}</span></div>
              <div className="flex justify-between gap-3"><span className="text-muted-foreground">Telepon</span><span className="text-right font-semibold">{telepon || "-"}</span></div>
              <div className="flex justify-between gap-3"><span className="text-muted-foreground">Total biaya</span><span className="text-right font-semibold">{rupiah(total)}</span></div>
              <div className="flex justify-between gap-3"><span className="text-muted-foreground">Bayar sekarang</span><span className="text-right font-bold text-primary">{rupiah(bayarSekarang)}</span></div>
              <div className="flex justify-between gap-3"><span className="text-muted-foreground">Sisa tagihan</span><span className="text-right font-semibold">{rupiah(total - bayarSekarang)}</span></div>
              <p className="pt-2 text-xs text-muted-foreground">
                Setelah dikonfirmasi, pemesanan langsung tercatat di dashboard admin beserta status pembayarannya.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mt-6 text-center">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/akun" })}>Batalkan dan kembali ke dashboard</Button>
      </div>
    </div>
  );
}
