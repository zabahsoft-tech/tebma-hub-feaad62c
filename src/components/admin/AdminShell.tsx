import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Newspaper, Award, Book, Image, Scroll, Layers, Mail, UserPlus, LayoutDashboard } from "lucide-react";

const ADMIN_NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/news", label: "News", icon: Newspaper },
  { to: "/admin/styles", label: "Styles", icon: Layers },
  { to: "/admin/rules", label: "Rules", icon: Scroll },
  { to: "/admin/dictionary", label: "Dictionary", icon: Book },
  { to: "/admin/gallery", label: "Gallery", icon: Image },
  { to: "/admin/certificates", label: "Certificates", icon: Award },
  { to: "/admin/memberships", label: "Applications", icon: UserPlus },
  { to: "/admin/messages", label: "Messages", icon: Mail },
] as const;

export function AdminShell() {
  const nav = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  async function signOut() {
    await supabase.auth.signOut();
    nav({ to: "/auth" });
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[240px_1fr] bg-muted/30">
      <aside className="border-r border-border bg-background lg:sticky lg:top-0 lg:h-screen flex flex-col">
        <div className="p-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="size-8 bg-foreground grid place-items-center rounded-sm">
              <span className="text-background font-semibold tracking-tighter">T</span>
            </div>
            <span className="text-xs uppercase tracking-widest font-semibold">TEBMA CMS</span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {ADMIN_NAV.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-sm text-sm transition-colors ${active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-sm text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </aside>
      <main className="min-w-0">
        <Outlet />
      </main>
    </div>
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
    <div className="p-6 md:p-10 max-w-6xl">
      <header className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-medium tracking-tight">{title}</h1>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {action}
      </header>
      {children}
    </div>
  );
}
