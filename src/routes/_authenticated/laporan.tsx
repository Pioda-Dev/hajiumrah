import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/app-shell";
import { StatusBadge } from "@/components/crud-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Download, FileBarChart, FileText, Users, PlaneTakeoff } from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, Legend,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { rupiah, tanggalID, type Row } from "@/lib/crud";

export const Route = createFileRoute("/_authenticated/laporan")({
  head: () => ({
    meta: [
      { title: "Laporan — Umroh Travel Management" },
      { name: "description", content: "Laporan operasional dan keuangan travel umroh: detail pemesanan, DP, sisa tagihan, dan arus kas bulanan." },
      { property: "og:title", content: "Laporan — Umroh Travel Management" },
      { property: "og:description", content: "Detail pemesanan, DP, sisa tagihan, serta arus kas bulanan travel umroh." },
    ],
  }),
  component: LaporanPage,
});

const db = supabase as any;

const toCsv = (rows: Row[]) => {
  if (rows.length === 0) return "";
  const keys = Object.keys(rows[0]!);
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [keys.join(","), ...rows.map((r) => keys.map((k) => esc(r[k])).join(","))].join("\n");
};

function saveCsv(name: string, rows: Row[]) {
  const url = URL.createObjectURL(new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `laporan-${name}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

async function download(table: string) {
  const { data } = await db.from(table).select("*");
  saveCsv(table, (data ?? []) as Row[]);
}

const reports = [
  { table: "pemesanan", title: "Laporan Pemesanan", desc: "Rekap pemesanan per periode.", icon: FileText },
  { table: "jamaah", title: "Laporan Jamaah", desc: "Data jamaah dan segmentasi paket.", icon: Users },
  { table: "keberangkatan", title: "Laporan Keberangkatan", desc: "Statistik keberangkatan bulanan.", icon: PlaneTakeoff },
  { table: "keuangan", title: "Laporan Keuangan", desc: "Pemasukan, pengeluaran, laba/rugi.", icon: FileBarChart },
];

function LaporanPage() {
  const { data = [] } = useQuery({
    queryKey: ["laporan-keuangan"],
    queryFn: async (): Promise<Row[]> => {
      const { data } = await db.from("keuangan").select("tanggal, jenis, nominal");
      return (data ?? []) as Row[];
    },
  });

  const { data: pemesanan = [] } = useQuery({
    queryKey: ["laporan-pemesanan"],
    queryFn: async (): Promise<Row[]> => {
      const { data } = await db
        .from("pemesanan")
        .select("invoice, tanggal, total, status, jamaah:jamaah_id(nama, telepon), paket:paket_id(nama)")
        .order("tanggal", { ascending: false });
      return (data ?? []) as Row[];
    },
  });

  const { data: pembayaran = [] } = useQuery({
    queryKey: ["laporan-pembayaran"],
    queryFn: async (): Promise<Row[]> => {
      const { data } = await db.from("pembayaran").select("invoice, total, dibayar, status, metode");
      return (data ?? []) as Row[];
    },
  });

  const bayarMap = new Map<string, Row>();
  pembayaran.forEach((p) => bayarMap.set(String(p.invoice), p));

  const detail = pemesanan.map((o) => {
    const bayar = bayarMap.get(String(o.invoice));
    const total = Number(bayar?.total ?? o.total ?? 0);
    const dibayar = Number(bayar?.dibayar ?? 0);
    const sisa = Math.max(total - dibayar, 0);
    return {
      invoice: String(o.invoice ?? "-"),
      tanggal: o.tanggal as string,
      nama: o.jamaah?.nama ?? "-",
      paket: o.paket?.nama ?? "-",
      total,
      dibayar,
      sisa,
      metode: bayar?.metode ?? "-",
      statusBayar: String(bayar?.status ?? "Belum Bayar"),
      status: String(o.status ?? "-"),
      persen: total > 0 ? Math.min(Math.round((dibayar / total) * 100), 100) : 0,
    };
  });

  const totalTagihan = detail.reduce((s, d) => s + d.total, 0);
  const totalDp = detail.reduce((s, d) => s + d.dibayar, 0);
  const totalSisa = detail.reduce((s, d) => s + d.sisa, 0);

  const now = new Date();
  const months = Array.from({ length: 6 }).map((_, i) => new Date(now.getFullYear(), now.getMonth() - (5 - i), 1));

  const sumBulan = (d: Date, jenis: string) =>
    data
      .filter((k) => {
        if (k.jenis !== jenis || !k.tanggal) return false;
        const t = new Date(k.tanggal);
        return t.getMonth() === d.getMonth() && t.getFullYear() === d.getFullYear();
      })
      .reduce((s, k) => s + Number(k.nominal ?? 0), 0);

  const arusKas = months.map((d) => {
    const masuk = sumBulan(d, "Pemasukan");
    const keluar = sumBulan(d, "Pengeluaran");
    return {
      month: d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" }),
      masuk: masuk / 1_000_000,
      keluar: keluar / 1_000_000,
      bersih: (masuk - keluar) / 1_000_000,
      rawMasuk: masuk,
      rawKeluar: keluar,
    };
  });

  const series = arusKas.map((a) => ({ month: a.month, value: a.masuk }));

  const masuk = data.filter((k) => k.jenis === "Pemasukan").reduce((s, k) => s + Number(k.nominal ?? 0), 0);
  const keluar = data.filter((k) => k.jenis === "Pengeluaran").reduce((s, k) => s + Number(k.nominal ?? 0), 0);

  return (
    <>
      <PageHeader
        title="Laporan"
        description="Ringkasan analitik, detail pemesanan, dan arus kas bulanan."
        action={
          <Button className="gap-2" onClick={() => reports.forEach((r) => download(r.table))}>
            <Download className="h-4 w-4" /> Unduh Semua
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {reports.map((r) => {
          const I = r.icon;
          return (
            <Card key={r.title} className="border-none shadow-sm">
              <CardContent className="p-5">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><I className="h-5 w-5" /></div>
                <div className="mt-3 font-semibold">{r.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">{r.desc}</div>
                <Button variant="outline" size="sm" className="mt-4 w-full gap-2" onClick={() => download(r.table)}>
                  <Download className="h-4 w-4" /> Unduh CSV
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {[
          { label: "Total Pemasukan", value: rupiah(masuk) },
          { label: "Total Pengeluaran", value: rupiah(keluar) },
          { label: "Laba Bersih", value: rupiah(masuk - keluar) },
          { label: "Nilai Pemesanan", value: rupiah(totalTagihan) },
          { label: "DP / Terbayar", value: rupiah(totalDp) },
          { label: "Sisa Tagihan", value: rupiah(totalSisa) },
        ].map((s) => (
          <Card key={s.label} className="border-none shadow-sm">
            <CardContent className="p-5">
              <div className="text-sm text-muted-foreground">{s.label}</div>
              <div className="mt-1 text-lg font-bold tracking-tight">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-4 border-none shadow-sm">
        <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle className="text-base">Detail Pemesanan</CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() =>
              saveCsv(
                "detail-pemesanan",
                detail.map(({ persen, ...d }) => d),
              )
            }
          >
            <Download className="h-4 w-4" /> Unduh CSV
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Jamaah</TableHead>
                  <TableHead>Paket</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">DP / Dibayar</TableHead>
                  <TableHead className="text-right">Sisa Tagihan</TableHead>
                  <TableHead className="min-w-32">Progres</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detail.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
                      Belum ada pemesanan.
                    </TableCell>
                  </TableRow>
                )}
                {detail.map((d) => (
                  <TableRow key={d.invoice}>
                    <TableCell className="font-medium">{d.invoice}</TableCell>
                    <TableCell className="whitespace-nowrap">{tanggalID(d.tanggal)}</TableCell>
                    <TableCell>{d.nama}</TableCell>
                    <TableCell className="max-w-48 truncate">{d.paket}</TableCell>
                    <TableCell className="whitespace-nowrap text-right">{rupiah(d.total)}</TableCell>
                    <TableCell className="whitespace-nowrap text-right text-emerald-600">{rupiah(d.dibayar)}</TableCell>
                    <TableCell className="whitespace-nowrap text-right font-medium">{rupiah(d.sisa)}</TableCell>
                    <TableCell>
                      <Progress value={d.persen} className="h-2" />
                      <div className="mt-1 text-xs text-muted-foreground">{d.persen}% · {d.metode}</div>
                    </TableCell>
                    <TableCell className="space-x-1 whitespace-nowrap">
                      <StatusBadge value={d.status} />
                      <StatusBadge value={d.statusBayar} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="border-none shadow-sm">
          <CardHeader><CardTitle className="text-base">Arus Kas Bulanan</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={arusKas} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={(v) => `${v} Jt`} />
                  <Tooltip formatter={(v: number, n) => [`Rp ${Number(v).toFixed(1)} Jt`, String(n)]} />
                  <Legend />
                  <Bar name="Masuk" dataKey="masuk" fill="#16a34a" radius={[4, 4, 0, 0]} />
                  <Bar name="Keluar" dataKey="keluar" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
              {arusKas.slice(-3).map((a) => (
                <div key={a.month} className="rounded-lg bg-muted/50 p-3">
                  <div className="text-xs text-muted-foreground">{a.month}</div>
                  <div className="font-semibold">{rupiah(a.rawMasuk - a.rawKeluar)}</div>
                  <div className="text-xs text-muted-foreground">kas bersih</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader><CardTitle className="text-base">Tren Pendapatan</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                  <defs>
                    <linearGradient id="gArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={(v) => `${v} Jt`} />
                  <Tooltip formatter={(v: number) => [`Rp ${v.toFixed(1)} Jt`, "Pendapatan"]} />
                  <Area type="monotone" dataKey="value" stroke="#16a34a" strokeWidth={2.5} fill="url(#gArea)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
