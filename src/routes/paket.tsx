import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, Building2, Plane, Clock, Users } from "lucide-react";
import { paketList } from "@/lib/mock-data";

export const Route = createFileRoute("/paket")({
  head: () => ({
    meta: [
      { title: "Paket Umroh — Umroh Travel" },
      { name: "description", content: "Katalog paket umroh, durasi, kuota, dan fasilitas." },
      { property: "og:title", content: "Paket Umroh — Umroh Travel" },
      { property: "og:description", content: "Kelola paket dan harga umroh." },
    ],
  }),
  component: PaketPage,
});

function PaketPage() {
  return (
    <AppShell>
      <PageHeader
        title="Paket Umroh"
        description="Semua paket beserta fasilitas, kuota, dan harga."
        action={<Button className="gap-2"><Plus className="h-4 w-4" /> Paket Baru</Button>}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {paketList.map((p) => (
          <Card key={p.nama} className="overflow-hidden border-none shadow-sm">
            <div className="h-24 bg-gradient-to-br from-emerald-500 to-emerald-700 p-4 text-primary-foreground">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/20"><Package className="h-4 w-4" /></div>
                <Badge variant="secondary" className="rounded-full bg-white/20 text-primary-foreground hover:bg-white/20">Tersedia {p.tersisa}/{p.kuota}</Badge>
              </div>
              <div className="mt-2 font-bold">{p.nama}</div>
            </div>
            <CardContent className="space-y-3 p-4">
              <div className="text-2xl font-bold text-primary">{p.harga}</div>
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4" /> {p.durasi} hari</div>
                <div className="flex items-center gap-2 text-muted-foreground"><Building2 className="h-4 w-4" /> Hotel {p.hotel}</div>
                <div className="flex items-center gap-2 text-muted-foreground"><Plane className="h-4 w-4" /> {p.maskapai}</div>
                <div className="flex items-center gap-2 text-muted-foreground"><Users className="h-4 w-4" /> Kuota {p.kuota} jamaah</div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button variant="outline" size="sm">Edit</Button>
                <Button size="sm">Detail</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
