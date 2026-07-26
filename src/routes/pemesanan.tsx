import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Search, Filter, Download, Eye } from "lucide-react";
import { pemesananTerbaru } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pemesanan")({
  head: () => ({
    meta: [
      { title: "Pemesanan — Umroh Travel" },
      { name: "description", content: "Kelola pemesanan paket umroh, status, dan invoice jamaah." },
      { property: "og:title", content: "Pemesanan — Umroh Travel" },
      { property: "og:description", content: "Daftar dan detail pemesanan jamaah umroh." },
    ],
  }),
  component: PemesananPage,
});

const statusColor: Record<string, string> = {
  Booking: "bg-emerald-100 text-emerald-700",
  Konfirmasi: "bg-blue-100 text-blue-700",
  Berangkat: "bg-amber-100 text-amber-700",
  Selesai: "bg-violet-100 text-violet-700",
};

const list = Array.from({ length: 12 }).map((_, i) => ({
  ...pemesananTerbaru[i % pemesananTerbaru.length],
  inv: `INV/250523/00${20 + i}`,
  total: ["Rp 65.000.000", "Rp 52.000.000", "Rp 35.000.000", "Rp 28.500.000"][i % 4],
}));

function PemesananPage() {
  return (
    <AppShell>
      <PageHeader
        title="Pemesanan"
        description="Kelola seluruh pemesanan paket umroh."
        action={<Button className="gap-2"><Plus className="h-4 w-4" /> Pesanan Baru</Button>}
      />

      <Card className="border-none shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Cari nama, invoice, atau paket..." className="pl-9" />
            </div>
            <Button variant="outline" className="gap-2"><Filter className="h-4 w-4" /> Filter</Button>
            <Button variant="outline" className="gap-2"><Download className="h-4 w-4" /> Ekspor</Button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-3 pr-4 font-medium">Jamaah</th>
                  <th className="py-3 pr-4 font-medium">Invoice</th>
                  <th className="py-3 pr-4 font-medium">Paket</th>
                  <th className="py-3 pr-4 font-medium">Tanggal</th>
                  <th className="py-3 pr-4 font-medium">Total</th>
                  <th className="py-3 pr-4 font-medium">Status</th>
                  <th className="py-3 pr-4 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {list.map((p, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/40">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary/10 text-primary text-xs">{p.inisial}</AvatarFallback></Avatar>
                        <span className="font-medium">{p.nama}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs">{p.inv}</td>
                    <td className="py-3 pr-4">{p.paket}</td>
                    <td className="py-3 pr-4">{p.tanggal}</td>
                    <td className="py-3 pr-4 font-semibold">{p.total}</td>
                    <td className="py-3 pr-4"><Badge className={cn("rounded-full", statusColor[p.status])}>{p.status}</Badge></td>
                    <td className="py-3 pr-4 text-right">
                      <Button variant="ghost" size="sm" className="gap-1"><Eye className="h-4 w-4" /> Detail</Button>
                    </td>
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
