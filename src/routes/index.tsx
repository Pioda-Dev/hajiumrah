import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Users, ShoppingBag, PlaneTakeoff, Package, DollarSign, Plus, ArrowUpRight,
  TrendingUp, Plane, MapPin, ClipboardList, Building2, ChevronRight
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell
} from "recharts";
import {
  stats, revenueData, statusData, jadwal, pemesananTerbaru, pendapatanPaket, pengingat
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Umroh Travel" },
      { name: "description", content: "Ringkasan pemesanan, jamaah, keberangkatan, dan pendapatan travel umroh." },
      { property: "og:title", content: "Dashboard — Umroh Travel" },
      { property: "og:description", content: "Kelola operasional travel umroh dalam satu tampilan." },
    ],
  }),
  component: Dashboard,
});

const iconMap = {
  users: { I: Users, bg: "bg-emerald-100 text-emerald-700" },
  shopping: { I: ShoppingBag, bg: "bg-blue-100 text-blue-700" },
  plane: { I: PlaneTakeoff, bg: "bg-sky-100 text-sky-700" },
  package: { I: Package, bg: "bg-amber-100 text-amber-700" },
  money: { I: DollarSign, bg: "bg-emerald-100 text-emerald-700" },
} as const;

const statusColor: Record<string, string> = {
  Booking: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  Konfirmasi: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  Berangkat: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  Selesai: "bg-violet-100 text-violet-700 hover:bg-violet-100",
};

function Dashboard() {
  return (
    <AppShell>
      <PageHeader
        title="Assalamu'alaikum, Admin Utama 👋"
        description="Semoga hari ini menjadi langkah terbaik untuk melayani tamu Allah."
        action={
          <Button className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" /> Pesanan Baru
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((s) => {
          const meta = iconMap[s.icon as keyof typeof iconMap];
          const Icon = meta.I;
          return (
            <Card key={s.label} className="border-none shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl", meta.bg)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-medium text-muted-foreground">{s.label}</div>
                    <div className="mt-1 truncate text-2xl font-bold tracking-tight">{s.value}</div>
                    <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                      <TrendingUp className="h-3 w-3" /> {s.delta}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="border-none shadow-sm lg:col-span-1">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Grafik Pendapatan</CardTitle>
            <Badge variant="outline" className="rounded-full">6 Bulan Terakhir</Badge>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                  <defs>
                    <linearGradient id="gLine" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#22c55e" />
                      <stop offset="100%" stopColor="#16a34a" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={(v) => `Rp ${v/1000 < 1 ? v+' jt' : (v/1000).toFixed(1)+' M'}`} width={70} />
                  <Tooltip formatter={(v: number) => [`Rp ${(v/1000).toFixed(2)} M`, "Pendapatan"]} />
                  <Line type="monotone" dataKey="value" stroke="url(#gLine)" strokeWidth={3} dot={{ r: 4, fill: "#16a34a" }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader><CardTitle className="text-base">Pemesanan Berdasarkan Status</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-2">
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={3}>
                      {statusData.map((s) => <Cell key={s.name} fill={s.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="space-y-2 text-sm">
                {statusData.map((s) => (
                  <li key={s.name} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                    <span className="font-medium">{s.name}</span>
                    <span className="ml-auto text-muted-foreground">{s.value} ({s.pct}%)</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-3 border-t pt-3 text-center text-xs text-muted-foreground">Total: 876 Pemesanan</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Jadwal Keberangkatan Terdekat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {jadwal.map((j) => (
              <div key={j.tanggal} className="flex items-center gap-3 rounded-xl border bg-card px-3 py-2.5">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                  <Plane className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{j.tanggal}</div>
                  <div className="truncate text-xs text-muted-foreground">{j.rute}</div>
                </div>
                <Badge variant="secondary" className="shrink-0 rounded-full bg-emerald-50 text-emerald-700">{j.jamaah} Jamaah</Badge>
              </div>
            ))}
            <button className="flex w-full items-center justify-between border-t pt-3 text-sm font-medium text-primary">
              Lihat semua jadwal <ArrowUpRight className="h-4 w-4" />
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="border-none shadow-sm">
          <CardHeader><CardTitle className="text-base">Pemesanan Terbaru</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {pemesananTerbaru.map((p) => (
              <div key={p.inv} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border p-3">
                <Avatar className="h-10 w-10"><AvatarFallback className="bg-primary/10 text-primary text-xs">{p.inisial}</AvatarFallback></Avatar>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{p.nama}</div>
                  <div className="truncate text-xs text-muted-foreground">{p.paket}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">{p.inv}</div>
                  <div className="text-xs">{p.tanggal}</div>
                  <Badge className={cn("mt-1 rounded-full", statusColor[p.status])}>{p.status}</Badge>
                </div>
              </div>
            ))}
            <button className="flex w-full items-center justify-between border-t pt-3 text-sm font-medium text-primary">
              Lihat semua pemesanan <ChevronRight className="h-4 w-4" />
            </button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader><CardTitle className="text-base">Pendapatan per Paket</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {pendapatanPaket.map((p) => (
              <div key={p.nama}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{p.nama}</span>
                  <span className="text-muted-foreground">Rp {p.nilai}.000.000</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600" style={{ width: `${p.pct}%` }} />
                </div>
              </div>
            ))}
            <button className="flex w-full items-center justify-between border-t pt-3 text-sm font-medium text-primary">
              Lihat laporan lengkap <ChevronRight className="h-4 w-4" />
            </button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader><CardTitle className="text-base">Pengingat</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {pengingat.map((p, idx) => {
              const tones: Record<string, { bg: string; I: typeof MapPin }> = {
                green: { bg: "bg-emerald-100 text-emerald-700", I: MapPin },
                amber: { bg: "bg-amber-100 text-amber-700", I: ClipboardList },
                blue:  { bg: "bg-blue-100 text-blue-700", I: Building2 },
              };
              const t = tones[p.tone];
              const I = t.I;
              return (
                <div key={idx} className="grid grid-cols-[auto_1fr_auto] items-start gap-3 rounded-xl border p-3">
                  <div className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full", t.bg)}>
                    <I className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">{p.judul}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{p.detail}</div>
                  </div>
                  <div className="shrink-0 text-[11px] text-muted-foreground">{p.waktu}</div>
                </div>
              );
            })}
            <button className="flex w-full items-center justify-between border-t pt-3 text-sm font-medium text-primary">
              Lihat semua pengingat <ChevronRight className="h-4 w-4" />
            </button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
