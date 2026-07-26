import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { revenueData } from "@/lib/mock-data";

export const Route = createFileRoute("/keuangan")({
  head: () => ({
    meta: [
      { title: "Keuangan — Umroh Travel" },
      { name: "description", content: "Ringkasan pemasukan, pengeluaran, dan arus kas travel umroh." },
      { property: "og:title", content: "Keuangan — Umroh Travel" },
      { property: "og:description", content: "Laporan keuangan travel umroh." },
    ],
  }),
  component: KeuanganPage,
});

const transaksi = [
  { tgl: "23 Mei 2025", ket: "Pembayaran Ahmad Subagyo", tipe: "Masuk", nominal: "+Rp 35.000.000" },
  { tgl: "22 Mei 2025", ket: "Pembayaran hotel Madinah", tipe: "Keluar", nominal: "-Rp 45.000.000" },
  { tgl: "22 Mei 2025", ket: "DP Novi Wisudawati", tipe: "Masuk", nominal: "+Rp 15.000.000" },
  { tgl: "21 Mei 2025", ket: "Tiket Garuda 28 pax", tipe: "Keluar", nominal: "-Rp 168.000.000" },
  { tgl: "21 Mei 2025", ket: "Pelunasan Muhammad Ridwan", tipe: "Masuk", nominal: "+Rp 65.000.000" },
];

function KeuanganPage() {
  return (
    <AppShell>
      <PageHeader
        title="Keuangan"
        description="Pantau arus kas, pemasukan, dan pengeluaran."
        action={<Button variant="outline" className="gap-2"><Download className="h-4 w-4" /> Ekspor Laporan</Button>}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-none bg-gradient-to-br from-emerald-500 to-emerald-700 text-primary-foreground shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-sm opacity-90"><Wallet className="h-4 w-4" /> Saldo Kas</div>
            <div className="mt-2 text-3xl font-bold">Rp 8,42 M</div>
            <div className="mt-1 text-xs opacity-80">Per 23 Mei 2025</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><TrendingUp className="h-4 w-4 text-emerald-600" /> Pemasukan Bulan Ini</div>
            <div className="mt-2 text-3xl font-bold text-emerald-600">Rp 2,45 M</div>
            <div className="mt-1 text-xs text-muted-foreground">+15% dari bulan lalu</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><TrendingDown className="h-4 w-4 text-rose-600" /> Pengeluaran Bulan Ini</div>
            <div className="mt-2 text-3xl font-bold text-rose-600">Rp 1,68 M</div>
            <div className="mt-1 text-xs text-muted-foreground">-3% dari bulan lalu</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4 border-none shadow-sm">
        <CardHeader><CardTitle className="text-base">Arus Kas 6 Bulan Terakhir</CardTitle></CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={(v) => `${v/1000} M`} />
                <Tooltip formatter={(v: number) => [`Rp ${(v/1000).toFixed(2)} M`, "Pemasukan"]} />
                <Bar dataKey="value" fill="#22c55e" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4 border-none shadow-sm">
        <CardHeader><CardTitle className="text-base">Transaksi Terbaru</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-3 pr-4 font-medium">Tanggal</th>
                  <th className="py-3 pr-4 font-medium">Keterangan</th>
                  <th className="py-3 pr-4 font-medium">Tipe</th>
                  <th className="py-3 pr-4 font-medium text-right">Nominal</th>
                </tr>
              </thead>
              <tbody>
                {transaksi.map((t, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-3 pr-4">{t.tgl}</td>
                    <td className="py-3 pr-4 font-medium">{t.ket}</td>
                    <td className="py-3 pr-4">{t.tipe}</td>
                    <td className={`py-3 pr-4 text-right font-semibold ${t.tipe === "Masuk" ? "text-emerald-600" : "text-rose-600"}`}>{t.nominal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
