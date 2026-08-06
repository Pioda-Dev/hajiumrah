import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, ShoppingBag, Users, PlaneTakeoff, Package, CreditCard,
  Wallet, FileText, BarChart3, Settings, Menu, Search, Bell, Calendar,
  ChevronDown, Headset, LifeBuoy, LogOut
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

type MenuItem = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean };
const menu: MenuItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/pemesanan", label: "Pemesanan", icon: ShoppingBag },
  { to: "/jamaah", label: "Jamaah", icon: Users },
  { to: "/keberangkatan", label: "Keberangkatan", icon: PlaneTakeoff },
  { to: "/paket", label: "Paket Umroh", icon: Package },
  { to: "/pembayaran", label: "Pembayaran", icon: CreditCard },
  { to: "/keuangan", label: "Keuangan", icon: Wallet },
  { to: "/dokumen", label: "Dokumen", icon: FileText },
  { to: "/laporan", label: "Laporan", icon: BarChart3 },
  { to: "/pengaturan", label: "Pengaturan", icon: Settings },
];

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-3 px-2">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-emerald-700 text-primary-foreground shadow-md">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M4 20V10l8-6 8 6v10" />
          <path d="M9 20v-6h6v6" />
        </svg>
      </div>
      <div className="leading-tight">
        <div className="text-lg font-black tracking-tight">UMROH</div>
        <div className="text-[11px] font-semibold tracking-[0.25em] text-amber-600">TRAVEL</div>
      </div>
    </Link>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex h-full flex-col gap-6 p-5">
      <Brand />
      <nav className="flex-1 space-y-1">
        {menu.map((m) => {
          const active = m.exact ? pathname === m.to : pathname.startsWith(m.to);
          const Icon = m.icon;
          return (
            <Link
              key={m.to}
              to={m.to}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground/70 hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              <span className="truncate">{m.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="rounded-2xl border bg-accent/50 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Headset className="h-4 w-4 text-primary" /> Butuh Bantuan?
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Tim support kami siap membantu Anda.</p>
        <Button size="sm" variant="outline" className="mt-3 w-full gap-2">
          <LifeBuoy className="h-4 w-4" /> Hubungi Support
        </Button>
      </div>

      <UserCard />
    </div>
  );
}

function useUserInfo() {
  const { user } = useAuth();
  const nama = (user?.user_metadata?.["full_name"] as string) || user?.email?.split("@")[0] || "Admin";
  const inisial = nama.split(" ").filter(Boolean).slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();
  return { nama, inisial, email: user?.email ?? "" };
}

function UserCard() {
  const { nama, inisial, email } = useUserInfo();
  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-2.5">
      <Avatar className="h-9 w-9"><AvatarFallback className="bg-primary/10 text-primary">{inisial}</AvatarFallback></Avatar>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold">{nama}</div>
        <div className="truncate text-xs text-muted-foreground">{email}</div>
      </div>
      <button onClick={logout} className="text-muted-foreground hover:text-foreground" title="Keluar">
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}

function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  return (
    <header className="sticky top-0 z-30 border-b bg-card/80 backdrop-blur">
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 md:px-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onOpenMenu}>
            <Menu className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden lg:inline-flex">
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <div className="relative min-w-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Cari sesuatu..." className="h-10 rounded-full bg-muted/60 pl-9" />
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden items-center gap-2 rounded-xl border bg-card px-3 py-1.5 md:flex">
            <Calendar className="h-4 w-4 text-primary" />
            <div className="text-right leading-tight">
              <div className="text-sm font-semibold">23 Mei 2025</div>
              <div className="text-[11px] text-muted-foreground">Jumat, 25 Dzulqa'dah 1446 H</div>
            </div>
          </div>
          <button className="relative rounded-full border bg-card p-2 hover:bg-accent">
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">3</span>
          </button>
          <TopbarUser />
        </div>
      </div>
    </header>
  );
}

function TopbarUser() {
  const { nama, inisial, email } = useUserInfo();
  return (
    <div className="flex items-center gap-2 rounded-full border bg-card py-1 pl-1 pr-2 md:pr-3">
      <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary/10 text-primary text-xs">{inisial}</AvatarFallback></Avatar>
      <div className="hidden text-right leading-tight md:block">
        <div className="text-sm font-semibold">{nama}</div>
        <div className="max-w-[160px] truncate text-[11px] text-muted-foreground">{email}</div>
      </div>
      <ChevronDown className="hidden h-4 w-4 text-muted-foreground md:block" />
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r bg-card lg:block">
        <SidebarContent />
      </aside>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild><span className="hidden" /></SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SidebarContent onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="lg:pl-72">
        <Topbar onOpenMenu={() => setOpen(true)} />
        <main className="px-4 py-6 md:px-6 lg:px-8">
          {children}
        </main>
        <footer className="border-t px-4 py-4 text-center text-xs text-muted-foreground md:px-6 lg:px-8">
          © 2025 Umroh Travel. All rights reserved.
        </footer>
      </div>
    </div>
  );
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
