import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Route = createFileRoute("/pengaturan")({
  head: () => ({
    meta: [
      { title: "Pengaturan — Umroh Travel" },
      { name: "description", content: "Pengaturan profil, perusahaan, notifikasi, dan keamanan sistem." },
      { property: "og:title", content: "Pengaturan — Umroh Travel" },
      { property: "og:description", content: "Konfigurasi sistem travel umroh." },
    ],
  }),
  component: PengaturanPage,
});

function PengaturanPage() {
  return (
    <AppShell>
      <PageHeader title="Pengaturan" description="Kelola profil, perusahaan, dan preferensi sistem." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="border-none shadow-sm lg:col-span-1">
          <CardHeader><CardTitle className="text-base">Profil</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16"><AvatarFallback className="bg-primary/10 text-primary text-lg">AU</AvatarFallback></Avatar>
              <div className="min-w-0">
                <div className="truncate font-semibold">Admin Utama</div>
                <div className="truncate text-sm text-muted-foreground">admin@umrohtravel.id</div>
                <Button variant="outline" size="sm" className="mt-2">Ganti Foto</Button>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Nama Lengkap</Label>
              <Input defaultValue="Admin Utama" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" defaultValue="admin@umrohtravel.id" />
            </div>
            <div className="space-y-2">
              <Label>Nomor HP</Label>
              <Input defaultValue="0812-3456-7890" />
            </div>
            <Button className="w-full">Simpan Perubahan</Button>
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <Card className="border-none shadow-sm">
            <CardHeader><CardTitle className="text-base">Informasi Perusahaan</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label>Nama Perusahaan</Label><Input defaultValue="PT Umroh Travel Indonesia" /></div>
              <div className="space-y-2"><Label>NPWP</Label><Input defaultValue="01.234.567.8-901.000" /></div>
              <div className="space-y-2 md:col-span-2"><Label>Alamat</Label><Input defaultValue="Jl. Merdeka No. 12, Jakarta Selatan" /></div>
              <div className="space-y-2"><Label>Telepon</Label><Input defaultValue="021-1234-5678" /></div>
              <div className="space-y-2"><Label>Email Bisnis</Label><Input defaultValue="cs@umrohtravel.id" /></div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader><CardTitle className="text-base">Notifikasi</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { l: "Pemesanan baru", d: "Notifikasi setiap ada pemesanan masuk.", v: true },
                { l: "Pembayaran diterima", d: "Notifikasi saat pembayaran diverifikasi.", v: true },
                { l: "Pengingat passport expired", d: "Notifikasi 3 bulan sebelum passport expired.", v: true },
                { l: "Ringkasan mingguan", d: "Kirim ringkasan performa via email tiap Senin.", v: false },
              ].map((n) => (
                <div key={n.l} className="grid grid-cols-[1fr_auto] items-center gap-4">
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{n.l}</div>
                    <div className="text-xs text-muted-foreground">{n.d}</div>
                  </div>
                  <Switch defaultChecked={n.v} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader><CardTitle className="text-base">Keamanan</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label>Kata Sandi Baru</Label><Input type="password" placeholder="••••••••" /></div>
              <div className="space-y-2"><Label>Konfirmasi</Label><Input type="password" placeholder="••••••••" /></div>
              <div className="md:col-span-2"><Button>Perbarui Kata Sandi</Button></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
