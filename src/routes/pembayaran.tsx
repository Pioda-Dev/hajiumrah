import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Download } from "lucide-react";
import { pembayaranList } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pembayaran")({
  head: () => ({
    meta: [
      { title: "Pembayaran — Umroh Travel" },
      { name: "description", content: "Data pembayaran, metode, dan status invoice jamaah." },
      { property: "og:title", content: "Pembayaran — Umroh Travel" },
      { property: "og:description", content: "Kelola pembayaran umroh." },
    ],
  }),
  component: PembayaranPage,
});

const statusColor: Record<string, string> = {
  Lunas: "bg-emerald-100 text-emerald-700",
  Cicilan: "bg-blue-100 text-blue-700",
  DP: "bg-amber-100 text-amber-700",
};

function PembayaranPage() {
  return (
    <AppShell>
      <PageHeader
        title="Pembayaran"
        description="Kelola status pembayaran seluruh invoice."
        action={<Button className="gap-2"><Plus className="h-4 w-4" /> Catat Pembayaran</Button>}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { l: "Total Tagihan", v: "Rp 4,20 M", tone: "text-foreground" },
          { l: "Terbayar", v: "Rp 3,15 M", tone: "text-emerald-600" },
          { l: "Cicilan Aktif", v: "Rp 820 jt", tone: "text-blue-600" },
          { l: "Belum Lunas", v: "Rp 230 jt", tone: "text-amber-600" },
        ].map((s) => (
          <Card key={s.l} className="border-none shadow-sm">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">{s.l}</div>
              <div className={cn("mt-1 text-xl font-bold md:text-2xl", s.tone)}>{s.v}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-4 border-none shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Cari invoice atau jamaah..." className="pl-9" />
            </div>
            <Button variant="outline" className="gap-2"><Download className="h-4 w-4" /> Ekspor</Button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-3 pr-4 font-medium">Invoice</th>
                  <th className="py-3 pr-4 font-medium">Jamaah</th>
                  <th className="py-3 pr-4 font-medium">Total</th>
                  <th className="py-3 pr-4 font-medium">Terbayar</th>
                  <th className="py-3 pr-4 font-medium">Metode</th>
                  <th className="py-3 pr-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {pembayaranList.map((p) => (
                  <tr key={p.inv} className="border-b last:border-0 hover:bg-muted/40">
                    <td className="py-3 pr-4 font-mono text-xs">{p.inv}</td>
                    <td className="py-3 pr-4 font-medium">{p.jamaah}</td>
                    <td className="py-3 pr-4">{p.total}</td>
                    <td className="py-3 pr-4 font-semibold text-emerald-600">{p.dibayar}</td>
                    <td className="py-3 pr-4">{p.metode}</td>
                    <td className="py-3 pr-4"><Badge className={cn("rounded-full", statusColor[p.status])}>{p.status}</Badge></td>
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
