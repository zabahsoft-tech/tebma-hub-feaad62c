import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  LogOut,
  Newspaper,
  Award,
  Book,
  Image as ImageIcon,
  Scroll,
  Layers,
  Mail,
  UserPlus,
  LayoutDashboard,
  MapPin,
  ExternalLink,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
};

const CONTENT_NAV: NavItem[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/news", label: "News", icon: Newspaper },
  { to: "/admin/styles", label: "Styles", icon: Layers },
  { to: "/admin/rules", label: "Rules", icon: Scroll },
  { to: "/admin/dictionary", label: "Dictionary", icon: Book },
  { to: "/admin/gallery", label: "Gallery", icon: ImageIcon },
];

const OPS_NAV: NavItem[] = [
  { to: "/admin/certificates", label: "Certificates", icon: Award },
  { to: "/admin/memberships", label: "Applications", icon: UserPlus },
  { to: "/admin/messages", label: "Messages", icon: Mail },
  { to: "/admin/contact", label: "Contact info", icon: MapPin },
];

const ALL_NAV = [...CONTENT_NAV, ...OPS_NAV];

function currentTitle(pathname: string): string {
  const match = ALL_NAV.filter((i) => (i.exact ? pathname === i.to : pathname.startsWith(i.to))).sort(
    (a, b) => b.to.length - a.to.length,
  )[0];
  return match?.label ?? "Dashboard";
}

function NavGroup({ label, items, pathname }: { label: string; items: NavItem[]; pathname: string }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <SidebarMenuItem key={item.to}>
                <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                  <Link to={item.to}>
                    <Icon className="size-4" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AdminShell() {
  const nav = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    nav({ to: "/auth" });
  }

  const pageTitle = currentTitle(pathname);

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <Link to="/" className="flex items-center gap-2 px-2 py-1.5">
            <div className="size-8 shrink-0 bg-foreground grid place-items-center rounded-sm">
              <span className="text-background font-semibold tracking-tighter">T</span>
            </div>
            <span className="text-xs uppercase tracking-widest font-semibold group-data-[collapsible=icon]:hidden">
              TEBMA CMS
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <NavGroup label="Content" items={CONTENT_NAV} pathname={pathname} />
          <NavGroup label="Operations" items={OPS_NAV} pathname={pathname} />
        </SidebarContent>
        <SidebarFooter>
          <div className="px-2 pt-1 pb-2 min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Signed in as</div>
            <div className="text-xs truncate">{email ?? "…"}</div>
          </div>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={signOut} tooltip="Sign out">
                <LogOut className="size-4" />
                <span>Sign out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/95 backdrop-blur px-4 md:px-6">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-5" />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Federation CMS</div>
            <div className="text-sm font-medium truncate">{pageTitle}</div>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            View site <ExternalLink className="size-3" />
          </a>
        </header>
        <main className="min-h-[calc(100vh-3.5rem)] bg-muted/30">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export function AdminPage({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="p-4 md:p-8 lg:p-10 max-w-none">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 mb-8 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-medium tracking-tight truncate">{title}</h1>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>
      {children}
    </div>
  );
}
