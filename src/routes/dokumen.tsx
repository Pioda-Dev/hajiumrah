import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText } from "lucide-react";
import { dokumenList } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dokumen")({
  head: () => ({
    meta: [
      { title: "Dokumen — Umroh Travel" },
      { name: "description", content: "Status passport, visa, vaksin, dan tiket jamaah." },
      { property: "og:title", content: "Dokumen — Umroh Travel" },
      { property: "og:description", content: "Kelola dokumen jamaah umroh." },
    ],
  }),
  component: DokumenPage,
});

const badgeMap: Record<string, string> = {
  Aktif: "bg-emerald-100 text-emerald-700",
  "Segera Expired": "bg-amber-100 text-amber-700",
  Selesai: "bg-emerald-100 text-emerald-700",
  Proses: "bg-blue-100 text-blue-700",
  Belum: "bg-rose-100 text-rose-700",
  Terbit: "bg-emerald-100 text-emerald-700",
};

function DokumenPage() {
  return (
    <AppShell>
      <PageHeader
        title="Dokumen Jamaah"
        description="Pantau kelengkapan passport, visa, vaksin, dan tiket."
        action={<Button className="gap-2"><Upload className="h-4 w-4" /> Upload Dokumen</Button>}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { l: "Passport Aktif", v: "1.180", tone: "text-emerald-600" },
          { l: "Segera Expired", v: "20", tone: "text-amber-600" },
          { l: "Visa Proses", v: "142", tone: "text-blue-600" },
          { l: "Dokumen Belum", v: "68", tone: "text-rose-600" },
        ].map((s) => (
          <Card key={s.l} className="border-none shadow-sm">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">{s.l}</div>
              <div className={cn("mt-1 text-2xl font-bold", s.tone)}>{s.v}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-4 border-none shadow-sm">
        <CardContent className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-3 pr-4 font-medium">Jamaah</th>
                  <th className="py-3 pr-4 font-medium">Passport</th>
                  <th className="py-3 pr-4 font-medium">Visa</th>
                  <th className="py-3 pr-4 font-medium">Vaksin</th>
                  <th className="py-3 pr-4 font-medium">Tiket</th>
                  <th className="py-3 pr-4 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {dokumenList.map((d) => (
                  <tr key={d.jamaah} className="border-b last:border-0 hover:bg-muted/40">
                    <td className="py-3 pr-4 font-medium">{d.jamaah}</td>
                    <td className="py-3 pr-4"><Badge className={cn("rounded-full", badgeMap[d.passport])}>{d.passport}</Badge></td>
                    <td className="py-3 pr-4"><Badge className={cn("rounded-full", badgeMap[d.visa])}>{d.visa}</Badge></td>
                    <td className="py-3 pr-4"><Badge className={cn("rounded-full", badgeMap[d.vaksin])}>{d.vaksin}</Badge></td>
                    <td className="py-3 pr-4"><Badge className={cn("rounded-full", badgeMap[d.tiket])}>{d.tiket}</Badge></td>
                    <td className="py-3 pr-4 text-right">
                      <Button variant="ghost" size="sm" className="gap-1"><FileText className="h-4 w-4" /> Lihat</Button>
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
