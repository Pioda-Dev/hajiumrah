import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plane, Plus, Users, Calendar as Cal } from "lucide-react";
import { keberangkatanList } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/keberangkatan")({
  head: () => ({
    meta: [
      { title: "Keberangkatan — Umroh Travel" },
      { name: "description", content: "Jadwal keberangkatan jamaah umroh, rute, dan maskapai." },
      { property: "og:title", content: "Keberangkatan — Umroh Travel" },
      { property: "og:description", content: "Kelola jadwal keberangkatan umroh." },
    ],
  }),
  component: KeberangkatanPage,
});

function KeberangkatanPage() {
  return (
    <AppShell>
      <PageHeader
        title="Jadwal Keberangkatan"
        description="Semua keberangkatan yang dijadwalkan dan menunggu konfirmasi."
        action={<Button className="gap-2"><Plus className="h-4 w-4" /> Tambah Jadwal</Button>}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {keberangkatanList.map((k) => (
          <Card key={k.kode} className="border-none shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Plane className="h-5 w-5" />
                </div>
                <Badge className={cn("rounded-full", k.status === "Terkonfirmasi" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                  {k.status}
                </Badge>
              </div>
              <div className="mt-4">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{k.kode}</div>
                <div className="mt-1 text-lg font-bold">{k.tanggal}</div>
                <div className="text-sm text-muted-foreground">{k.rute}</div>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2 text-sm">
                <div className="flex items-center gap-2"><Cal className="h-4 w-4 text-primary" />{k.maskapai}</div>
                <div className="flex items-center gap-1 font-semibold"><Users className="h-4 w-4" />{k.jamaah}</div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm">Detail</Button>
                <Button size="sm">Kelola Jamaah</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
