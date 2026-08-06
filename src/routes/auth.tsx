import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Masuk — Umroh Travel Management" },
      { name: "description", content: "Masuk atau daftar untuk mengelola pemesanan, jamaah, keberangkatan, dan keuangan travel umroh." },
      { property: "og:title", content: "Masuk — Umroh Travel Management" },
      { property: "og:description", content: "Akses dashboard manajemen travel umroh Anda." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nama, setNama] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    navigate({ to: "/" });
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: nama }, emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Akun dibuat. Silakan masuk.");
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) return toast.error("Gagal masuk dengan Google");
    if (result.redirected) return;
    navigate({ to: "/" });
  };

  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-br from-emerald-50 via-background to-amber-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary to-emerald-700 text-primary-foreground shadow-md">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M4 20V10l8-6 8 6v10" /><path d="M9 20v-6h6v6" />
            </svg>
          </div>
          <div className="leading-tight">
            <div className="text-xl font-black tracking-tight">UMROH</div>
            <div className="text-[11px] font-semibold tracking-[0.25em] text-amber-600">TRAVEL</div>
          </div>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Sistem Manajemen Travel Umroh</CardTitle>
            <CardDescription>Masuk untuk mengelola seluruh data operasional.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="masuk">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="masuk">Masuk</TabsTrigger>
                <TabsTrigger value="daftar">Daftar</TabsTrigger>
              </TabsList>

              <TabsContent value="masuk">
                <form onSubmit={signIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Kata Sandi</Label>
                    <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Masuk
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="daftar">
                <form onSubmit={signUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nama">Nama Lengkap</Label>
                    <Input id="nama" required value={nama} onChange={(e) => setNama(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email2">Email</Label>
                    <Input id="email2" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password2">Kata Sandi</Label>
                    <Input id="password2" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Daftar
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> atau <span className="h-px flex-1 bg-border" />
            </div>
            <Button variant="outline" className="w-full gap-2" onClick={google}>
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
                <path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
              </svg>
              Masuk dengan Google
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
