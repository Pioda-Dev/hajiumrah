import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileBarChart, FileText, Users, PlaneTakeoff } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { rupiah, type Row } from "@/lib/crud";

export const Route = createFileRoute("/_authenticated/laporan")({
  head: () => ({
    meta: [
      { title: "Laporan — Umroh Travel Management" },
      { name: "description", content: "Laporan operasional dan keuangan travel umroh, siap diekspor ke CSV." },
      { property: "og:title", content: "Laporan — Umroh Travel Management" },
      { property: "og:description", content: "Ekspor laporan pemesanan, jamaah, keberangkatan, dan keuangan." },
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

async function download(table: string) {
  const { data } = await db.from(table).select("*");
  const csv = toCsv((data ?? []) as Row[]);
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `laporan-${table}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
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

  const now = new Date();
  const series = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const value = data
      .filter((k) => k.jenis === "Pemasukan" && k.tanggal && new Date(k.tanggal).getMonth() === d.getMonth() && new Date(k.tanggal).getFullYear() === d.getFullYear())
      .reduce((s, k) => s + Number(k.nominal ?? 0), 0);
    return { month: d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" }), value: value / 1_000_000 };
  });

  const masuk = data.filter((k) => k.jenis === "Pemasukan").reduce((s, k) => s + Number(k.nominal ?? 0), 0);
  const keluar = data.filter((k) => k.jenis === "Pengeluaran").reduce((s, k) => s + Number(k.nominal ?? 0), 0);

  return (
    <>
      <PageHeader
        title="Laporan"
        description="Ringkasan analitik dan ekspor laporan periodik."
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

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { label: "Total Pemasukan", value: rupiah(masuk) },
          { label: "Total Pengeluaran", value: rupiah(keluar) },
          { label: "Laba Bersih", value: rupiah(masuk - keluar) },
        ].map((s) => (
          <Card key={s.label} className="border-none shadow-sm">
            <CardContent className="p-5">
              <div className="text-sm text-muted-foreground">{s.label}</div>
              <div className="mt-1 text-xl font-bold tracking-tight">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-4 border-none shadow-sm">
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
    </>
  );
}
