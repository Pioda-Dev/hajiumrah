import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, LogOut, Save } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Row } from "@/lib/crud";

export const Route = createFileRoute("/_authenticated/pengaturan")({
  head: () => ({
    meta: [
      { title: "Pengaturan — Umroh Travel Management" },
      { name: "description", content: "Atur profil pengguna dan identitas biro travel umroh: nama, alamat, kontak, dan nomor izin." },
      { property: "og:title", content: "Pengaturan — Umroh Travel Management" },
      { property: "og:description", content: "Kelola profil dan konfigurasi biro travel umroh Anda." },
    ],
  }),
  component: PengaturanPage,
});

const db = supabase as any;

function PengaturanPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [form, setForm] = useState<Row>({});
  const [fullName, setFullName] = useState("");

  const { data: setting, isLoading } = useQuery({
    queryKey: ["pengaturan"],
    queryFn: async (): Promise<Row | null> => {
      const { data } = await db.from("pengaturan").select("*").limit(1).maybeSingle();
      return (data ?? null) as Row | null;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<Row | null> => {
      const { data } = await db.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return (data ?? null) as Row | null;
    },
  });

  useEffect(() => { if (setting) setForm(setting); }, [setting]);
  useEffect(() => { setFullName((profile?.full_name as string) ?? ""); }, [profile]);

  const saveSetting = useMutation({
    mutationFn: async () => {
      const values = {
        nama_travel: form.nama_travel ?? null,
        alamat: form.alamat ?? null,
        telepon: form.telepon ?? null,
        email: form.email ?? null,
        no_izin: form.no_izin ?? null,
        mata_uang: form.mata_uang ?? "IDR",
      };
      if (setting?.id) {
        const { error } = await db.from("pengaturan").update(values).eq("id", setting.id);
        if (error) throw error;
      } else {
        const { error } = await db.from("pengaturan").insert(values);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pengaturan"] }); toast.success("Pengaturan disimpan"); },
    onError: (e: any) => toast.error(e?.message ?? "Gagal menyimpan"),
  });

  const saveProfile = useMutation({
    mutationFn: async () => {
      const { error } = await db.from("profiles").update({ full_name: fullName }).eq("id", user!.id);
      if (error) throw error;
      await supabase.auth.updateUser({ data: { full_name: fullName } });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["profile"] }); toast.success("Profil diperbarui"); },
    onError: (e: any) => toast.error(e?.message ?? "Gagal menyimpan profil"),
  });

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  const fields = [
    { name: "nama_travel", label: "Nama Travel", placeholder: "PT Umroh Travel Indonesia" },
    { name: "no_izin", label: "No. Izin PPIU", placeholder: "U.123 Tahun 2024" },
    { name: "telepon", label: "Telepon", placeholder: "021-1234567" },
    { name: "email", label: "Email", placeholder: "info@umrohtravel.id" },
  ];

  return (
    <>
      <PageHeader title="Pengaturan" description="Kelola profil pengguna dan identitas biro travel." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="border-none shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Profil Biro Travel</CardTitle>
            <CardDescription>Data ini digunakan pada invoice dan dokumen resmi.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="grid h-32 place-items-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  {fields.map((f) => (
                    <div key={f.name} className="space-y-2">
                      <Label htmlFor={f.name}>{f.label}</Label>
                      <Input id={f.name} placeholder={f.placeholder} value={form[f.name] ?? ""}
                        onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} />
                    </div>
                  ))}
                  <div className="space-y-2">
                    <Label>Mata Uang</Label>
                    <Select value={form.mata_uang ?? "IDR"} onValueChange={(v) => setForm({ ...form, mata_uang: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["IDR", "USD", "SAR"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alamat">Alamat</Label>
                  <Textarea id="alamat" value={form.alamat ?? ""} onChange={(e) => setForm({ ...form, alamat: e.target.value })} />
                </div>
                <Button className="gap-2" onClick={() => saveSetting.mutate()} disabled={saveSetting.isPending}>
                  {saveSetting.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Simpan Pengaturan
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Akun Saya</CardTitle>
            <CardDescription>{user?.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nama Lengkap</Label>
              <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <Button variant="outline" className="w-full gap-2" onClick={() => saveProfile.mutate()} disabled={saveProfile.isPending}>
              {saveProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Perbarui Profil
            </Button>
            <Button variant="destructive" className="w-full gap-2" onClick={logout}>
              <LogOut className="h-4 w-4" /> Keluar
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
