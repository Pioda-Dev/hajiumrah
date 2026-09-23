import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { AuthProvider } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // getSession() membaca sesi lokal (tanpa request jaringan) sehingga
    // perpindahan antar halaman tidak menunggu server.
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session?.user) throw redirect({ to: "/auth" });
    return { user: data.session.user };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return (
    <AuthProvider>
      <AppShell>
        <Outlet />
      </AppShell>
    </AuthProvider>
  );
}
