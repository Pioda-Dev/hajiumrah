import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell,
} from "recharts";
import { Users, ShoppingBag, PlaneTakeoff, Package, Wallet, TrendingUp, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/crud-view";
import { supabase } from "@/integrations/supabase/client";
import { rupiah, shortRupiah, tanggalID, type Row } from "@/lib/crud";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Umroh Travel Management" },
      { name: "description", content: "Ringkasan operasional travel umroh: jamaah, pemesanan, keberangkatan, dan pendapatan real-time." },
      { property: "og:title", content: "Dashboard — Umroh Travel Management" },
      { property: "og:description", content: "Pantau seluruh aktivitas travel umroh dalam satu dashboard." },
    ],
  }),
  component: Dashboard,
});

const db = supabase as any;

function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const [jamaah, pemesanan, keberangkatan, paket, keuangan] = await Promise.all([
        db.from("jamaah").select("id, nama, status"),
        db.from("pemesanan").select("*, jamaah:jamaah_id(nama), paket:paket_id(nama)").order("tanggal", { ascending: false }),
        db.from("keberangkatan").select("*").order("tanggal", { ascending: true }),
        db.from("paket").select("id, nama"),
        db.from("keuangan").select("tanggal, jenis, nominal"),
      ]);
      return {
        jamaah: (jamaah.data ?? []) as Row[],
        pemesanan: (pemesanan.data ?? []) as Row[],
        keberangkatan: (keberangkatan.data ?? []) as Row[],
        paket: (paket.data ?? []) as Row[],
        keuangan: (keuangan.data ?? []) as Row[],
      };
    },
  });
}

const initials = (n: string) => n.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
const STATUSES = ["Booking", "Konfirmasi", "Berangkat", "Selesai"];
const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#8b5cf6"];

function Dashboard() {
  const { user } = useAuth();
  const { isStaff, loading: roleLoading } = useRole();
  const navigate = useNavigate();
  const { data } = useDashboard();
  const nama = (user?.user_metadata?.["full_name"] as string) ?? user?.email?.split("@")[0] ?? "Admin";

  useEffect(() => {
    if (!roleLoading && !isStaff) navigate({ to: "/akun", replace: true });
  }, [roleLoading, isStaff, navigate]);


  const jamaah = data?.jamaah ?? [];
  const pemesanan = data?.pemesanan ?? [];
  const keberangkatan = data?.keberangkatan ?? [];
  const paket = data?.paket ?? [];
  const keuangan = data?.keuangan ?? [];

  const now = new Date();
  const bulanIni = (v: string | null) => {
    if (!v) return false;
    const d = new Date(v);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  };

  const pendapatanBulanIni = keuangan
    .filter((k) => k.jenis === "Pemasukan" && bulanIni(k.tanggal))
    .reduce((s, k) => s + Number(k.nominal ?? 0), 0);

  const stats = [
    { label: "Total Jamaah", value: String(jamaah.length), sub: "Jamaah terdaftar", icon: Users, tone: "bg-emerald-100 text-emerald-700" },
    { label: "Pemesanan Aktif", value: String(pemesanan.filter((p) => ["Booking", "Konfirmasi"].includes(p.status)).length), sub: "Booking & konfirmasi", icon: ShoppingBag, tone: "bg-blue-100 text-blue-700" },
    { label: "Keberangkatan Bulan Ini", value: String(keberangkatan.filter((k) => bulanIni(k.tanggal)).length), sub: "Grup berangkat", icon: PlaneTakeoff, tone: "bg-sky-100 text-sky-700" },
    { label: "Total Paket", value: String(paket.length), sub: "Paket tersedia", icon: Package, tone: "bg-amber-100 text-amber-700" },
    { label: "Pendapatan Bulan Ini", value: shortRupiah(pendapatanBulanIni), sub: "Pemasukan tercatat", icon: Wallet, tone: "bg-emerald-100 text-emerald-700" },
  ];

  const revenue = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const total = keuangan
      .filter((k) => k.jenis === "Pemasukan" && k.tanggal && new Date(k.tanggal).getMonth() === d.getMonth() && new Date(k.tanggal).getFullYear() === d.getFullYear())
      .reduce((s, k) => s + Number(k.nominal ?? 0), 0);
    return { month: d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" }), value: total / 1_000_000 };
  });

  const statusData = STATUSES.map((s, i) => ({
    name: s,
    value: pemesanan.filter((p) => p.status === s).length,
    color: COLORS[i]!,
  })).filter((s) => s.value > 0);

  const perPaket = paket
    .map((p) => ({
      nama: p.nama as string,
      nilai: pemesanan.filter((x) => x.paket_id === p.id).reduce((s, x) => s + Number(x.total ?? 0), 0),
    }))
    .sort((a, b) => b.nilai - a.nilai)
    .slice(0, 5);
  const maxPaket = Math.max(1, ...perPaket.map((p) => p.nilai));

  const belumLunas = pemesanan.filter((p) => p.status === "Booking").length;

  return (
    <>
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-primary to-emerald-700 p-6 text-primary-foreground shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Assalamu'alaikum, {nama} 👋</h1>
        <p className="mt-1 text-sm text-primary-foreground/85">
          Berikut ringkasan aktivitas travel umroh Anda hari ini.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((s) => {
          const I = s.icon;
          return (
            <Card key={s.label} className="border-none shadow-sm">
              <CardContent className="p-5">
                <div className={`grid h-11 w-11 place-items-center rounded-xl ${s.tone}`}><I className="h-5 w-5" /></div>
                <div className="mt-3 text-2xl font-bold tracking-tight">{s.value}</div>
                <div className="text-sm font-medium text-foreground/80">{s.label}</div>
                <div className="mt-1 text-xs text-muted-foreground">{s.sub}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="border-none shadow-sm lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Tren Pendapatan (6 bulan)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenue} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={(v) => `${v} Jt`} />
                  <Tooltip formatter={(v: number) => [`Rp ${v.toFixed(1)} Jt`, "Pendapatan"]} />
                  <Line type="monotone" dataKey="value" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader><CardTitle className="text-base">Status Pemesanan</CardTitle></CardHeader>
          <CardContent>
            <div className="h-52">
              {statusData.length === 0 ? (
                <div className="grid h-full place-items-center text-sm text-muted-foreground">Belum ada data</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={3}>
                      {statusData.map((s) => <Cell key={s.name} fill={s.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="mt-3 space-y-2">
              {statusData.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                    {s.name}
                  </span>
                  <span className="font-semibold">{s.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="border-none shadow-sm">
          <CardHeader><CardTitle className="text-base">Jadwal Keberangkatan Terdekat</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {keberangkatan.slice(0, 5).map((k) => (
              <div key={k.id} className="flex items-center justify-between gap-3 rounded-xl border p-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{k.rute ?? k.kode}</div>
                  <div className="text-xs text-muted-foreground">{tanggalID(k.tanggal)} • {k.maskapai ?? "-"}</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-sm font-bold text-primary">{k.jumlah_jamaah ?? 0}</div>
                  <div className="text-[11px] text-muted-foreground">jamaah</div>
                </div>
              </div>
            ))}
            {keberangkatan.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Belum ada jadwal.</p>}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader><CardTitle className="text-base">Pemesanan Terbaru</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {pemesanan.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl border p-3">
                <Avatar className="h-9 w-9"><AvatarFallback className="bg-primary/10 text-xs text-primary">{initials(p.jamaah?.nama ?? "?")}</AvatarFallback></Avatar>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{p.jamaah?.nama ?? "-"}</div>
                  <div className="truncate text-xs text-muted-foreground">{p.paket?.nama ?? "-"} • {p.invoice}</div>
                </div>
                <StatusBadge value={p.status} />
              </div>
            ))}
            {pemesanan.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Belum ada pemesanan.</p>}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="border-none shadow-sm">
          <CardHeader><CardTitle className="text-base">Pendapatan per Paket</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {perPaket.map((p) => (
              <div key={p.nama}>
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate pr-2 font-medium">{p.nama}</span>
                  <span className="shrink-0 text-muted-foreground">{rupiah(p.nilai)}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-600" style={{ width: `${(p.nilai / maxPaket) * 100}%` }} />
                </div>
              </div>
            ))}
            {perPaket.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Belum ada data paket.</p>}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader><CardTitle className="text-base">Pengingat</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3 rounded-xl border bg-amber-50 p-3">
              <Bell className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <div>
                <div className="text-sm font-semibold">{belumLunas} pemesanan masih berstatus Booking</div>
                <div className="text-xs text-muted-foreground">Segera konfirmasi pembayaran jamaah.</div>
              </div>
            </div>
            <div className="flex gap-3 rounded-xl border bg-emerald-50 p-3">
              <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <div>
                <div className="text-sm font-semibold">Pendapatan bulan ini {shortRupiah(pendapatanBulanIni)}</div>
                <div className="text-xs text-muted-foreground">Berdasarkan transaksi pemasukan tercatat.</div>
              </div>
            </div>
            <div className="flex gap-3 rounded-xl border bg-sky-50 p-3">
              <PlaneTakeoff className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
              <div>
                <div className="text-sm font-semibold">{keberangkatan.filter((k) => k.status === "Menunggu").length} keberangkatan menunggu konfirmasi</div>
                <div className="text-xs text-muted-foreground">Periksa kembali jadwal dan maskapai.</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
