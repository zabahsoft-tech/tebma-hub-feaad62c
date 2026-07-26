import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { AdminPage } from "@/components/admin/AdminShell";
import { adminDashboardStats } from "@/lib/admin.functions";
import {
  Newspaper,
  Layers,
  UserPlus,
  Mail,
  Book,
  Award,
  Scroll,
  Image as ImageIcon,
  ArrowUpRight,
} from "lucide-react";

const qo = queryOptions({ queryKey: ["admin", "stats"], queryFn: () => adminDashboardStats() });

export const Route = createFileRoute("/_authenticated/admin/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(qo),
  component: AdminHome,
});

const QUICK_LINKS = [
  { to: "/admin/news", label: "News articles", desc: "Publish federation dispatches.", icon: Newspaper },
  { to: "/admin/styles", label: "Disciplines", desc: "Manage styles and descriptions.", icon: Layers },
  { to: "/admin/rules", label: "Rules sections", desc: "Governance and syllabus.", icon: Scroll },
  { to: "/admin/dictionary", label: "Photo dictionary", desc: "Techniques and etiquette.", icon: Book },
  { to: "/admin/gallery", label: "Gallery", desc: "Event photos and albums.", icon: ImageIcon },
  { to: "/admin/certificates", label: "Certificates", desc: "Issue and revoke ranks.", icon: Award },
] as const;

function StatCard({
  label,
  value,
  hint,
  to,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  hint?: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "default" | "warn";
}) {
  return (
    <Link
      to={to}
      className="group block bg-background border border-border rounded-md p-5 hover:border-foreground/40 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {label}
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-3xl font-medium tracking-tight ${
                tone === "warn" && value > 0 ? "text-amber-600" : ""
              }`}
            >
              {value}
            </span>
            {hint ? <span className="text-xs text-muted-foreground truncate">{hint}</span> : null}
          </div>
        </div>
        <div className="shrink-0 size-9 rounded-sm bg-muted grid place-items-center text-muted-foreground group-hover:bg-foreground group-hover:text-background transition-colors">
          <Icon className="size-4" />
        </div>
      </div>
    </Link>
  );
}

function AdminHome() {
  const { data } = useSuspenseQuery(qo);
  const { counts, recentApps, recentMessages } = data;

  return (
    <AdminPage
      title="Federation Dashboard"
      description="Overview of activity across the World TEBMA Federation website."
    >
      {/* Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
        <StatCard
          label="Published news"
          value={counts.publishedNews}
          hint={`${counts.totalNews} total`}
          to="/admin/news"
          icon={Newspaper}
        />
        <StatCard
          label="Disciplines"
          value={counts.styles}
          to="/admin/styles"
          icon={Layers}
        />
        <StatCard
          label="Pending applications"
          value={counts.pendingApps}
          hint={`${counts.totalApps} total`}
          to="/admin/memberships"
          icon={UserPlus}
          tone="warn"
        />
        <StatCard
          label="Contact messages"
          value={counts.messages}
          to="/admin/messages"
          icon={Mail}
        />
      </section>

      {/* Recents */}
      <section className="grid lg:grid-cols-2 gap-4 md:gap-6 mb-8">
        <RecentsCard
          title="Recent applications"
          to="/admin/memberships"
          empty="No applications yet."
          rows={recentApps.map((r) => ({
            id: r.id,
            primary: r.full_name,
            secondary: `${r.tier} · ${r.email}`,
            meta: r.status,
            metaTone: r.status === "pending" ? "warn" : "muted",
            date: r.created_at,
          }))}
        />
        <RecentsCard
          title="Recent messages"
          to="/admin/messages"
          empty="No messages yet."
          rows={recentMessages.map((r) => ({
            id: r.id,
            primary: r.name,
            secondary: r.subject ?? r.email,
            date: r.created_at,
          }))}
        />
      </section>

      {/* Quick links */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Manage content
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {QUICK_LINKS.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.to}
                to={c.to}
                className="group flex items-start gap-4 bg-background border border-border rounded-md p-5 hover:border-foreground/40 transition-colors"
              >
                <div className="shrink-0 size-9 rounded-sm bg-muted grid place-items-center text-muted-foreground group-hover:bg-foreground group-hover:text-background transition-colors">
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium tracking-tight">{c.label}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{c.desc}</div>
                </div>
                <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </Link>
            );
          })}
        </div>
      </section>
    </AdminPage>
  );
}

type RecentRow = {
  id: string;
  primary: string;
  secondary: string;
  date: string;
  meta?: string;
  metaTone?: "warn" | "muted";
};

function RecentsCard({
  title,
  to,
  rows,
  empty,
}: {
  title: string;
  to: string;
  rows: RecentRow[];
  empty: string;
}) {
  return (
    <div className="bg-background border border-border rounded-md overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <h3 className="text-sm font-medium">{title}</h3>
        <Link to={to} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
          View all <ArrowUpRight className="size-3" />
        </Link>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground p-6 text-center">{empty}</p>
      ) : (
        <ul className="divide-y divide-border">
          {rows.map((r) => (
            <li key={r.id} className="px-5 py-3 flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{r.primary}</div>
                <div className="text-xs text-muted-foreground truncate">{r.secondary}</div>
              </div>
              {r.meta ? (
                <span
                  className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-sm shrink-0 ${
                    r.metaTone === "warn"
                      ? "bg-amber-500/15 text-amber-700"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {r.meta}
                </span>
              ) : null}
              <time className="text-[10px] uppercase tracking-widest text-muted-foreground shrink-0 hidden sm:block">
                {new Date(r.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </time>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
