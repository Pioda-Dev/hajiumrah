import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserPlus, Search, Phone, Filter } from "lucide-react";
import { jamaahList } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/jamaah")({
  head: () => ({
    meta: [
      { title: "Jamaah — Umroh Travel" },
      { name: "description", content: "Data jamaah, NIK, kontak, dan paket keberangkatan." },
      { property: "og:title", content: "Jamaah — Umroh Travel" },
      { property: "og:description", content: "Kelola database jamaah umroh." },
    ],
  }),
  component: JamaahPage,
});

const statusColor: Record<string, string> = {
  Booking: "bg-emerald-100 text-emerald-700",
  Konfirmasi: "bg-blue-100 text-blue-700",
  Berangkat: "bg-amber-100 text-amber-700",
  Selesai: "bg-violet-100 text-violet-700",
};

function JamaahPage() {
  return (
    <AppShell>
      <PageHeader
        title="Data Jamaah"
        description="Semua jamaah terdaftar beserta status keberangkatan."
        action={<Button className="gap-2"><UserPlus className="h-4 w-4" /> Tambah Jamaah</Button>}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { l: "Total Jamaah", v: "1.248" },
          { l: "Aktif", v: "876" },
          { l: "Menunggu Berangkat", v: "342" },
          { l: "Selesai", v: "63" },
        ].map((s) => (
          <Card key={s.l} className="border-none shadow-sm">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">{s.l}</div>
              <div className="mt-1 text-2xl font-bold">{s.v}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-4 border-none shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Cari nama, NIK, telepon..." className="pl-9" />
            </div>
            <Button variant="outline" className="gap-2"><Filter className="h-4 w-4" /> Filter</Button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {jamaahList.map((j) => (
              <div key={j.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border p-3">
                <Avatar className="h-11 w-11"><AvatarFallback className="bg-primary/10 text-primary text-sm">{j.nama.split(" ").map(n=>n[0]).slice(0,2).join("")}</AvatarFallback></Avatar>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{j.nama}</div>
                  <div className="truncate text-xs text-muted-foreground">NIK: {j.nik}</div>
                  <div className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" /> {j.telepon}
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={cn("rounded-full", statusColor[j.status])}>{j.status}</Badge>
                  <div className="mt-1 text-[11px] text-muted-foreground">{j.paket}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
