import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileBarChart, FileText, Users, PlaneTakeoff } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { revenueData } from "@/lib/mock-data";

export const Route = createFileRoute("/laporan")({
  head: () => ({
    meta: [
      { title: "Laporan — Umroh Travel" },
      { name: "description", content: "Laporan operasional, keuangan, dan keberangkatan travel umroh." },
      { property: "og:title", content: "Laporan — Umroh Travel" },
      { property: "og:description", content: "Ekspor laporan travel umroh." },
    ],
  }),
  component: LaporanPage,
});

const reports = [
  { title: "Laporan Pemesanan", desc: "Rekap pemesanan per periode.", icon: FileText },
  { title: "Laporan Jamaah", desc: "Data jamaah dan segmentasi paket.", icon: Users },
  { title: "Laporan Keberangkatan", desc: "Statistik keberangkatan bulanan.", icon: PlaneTakeoff },
  { title: "Laporan Keuangan", desc: "Pemasukan, pengeluaran, laba/rugi.", icon: FileBarChart },
];

function LaporanPage() {
  return (
    <AppShell>
      <PageHeader
        title="Laporan"
        description="Ringkasan analitik dan ekspor laporan periodik."
        action={<Button className="gap-2"><Download className="h-4 w-4" /> Unduh Semua</Button>}
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
                <Button variant="outline" size="sm" className="mt-4 w-full gap-2"><Download className="h-4 w-4" /> Unduh PDF</Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-4 border-none shadow-sm">
        <CardHeader><CardTitle className="text-base">Tren Pendapatan</CardTitle></CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                <defs>
                  <linearGradient id="gArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={(v) => `${v/1000} M`} />
                <Tooltip formatter={(v: number) => [`Rp ${(v/1000).toFixed(2)} M`, "Pendapatan"]} />
                <Area type="monotone" dataKey="value" stroke="#16a34a" strokeWidth={2.5} fill="url(#gArea)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
