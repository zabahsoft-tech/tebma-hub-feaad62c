import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminPage } from "@/components/admin/AdminShell";

const CARDS = [
  { to: "/admin/news", label: "News articles", desc: "Publish and edit federation dispatches." },
  { to: "/admin/styles", label: "Disciplines", desc: "Manage styles and their descriptions." },
  { to: "/admin/rules", label: "Rules sections", desc: "Governance, code of conduct, syllabus." },
  { to: "/admin/dictionary", label: "Photo dictionary", desc: "Techniques, stances, and etiquette entries." },
  { to: "/admin/gallery", label: "Gallery", desc: "Event photos and album covers." },
  { to: "/admin/certificates", label: "Certificates", desc: "Issue and revoke rank certificates." },
  { to: "/admin/memberships", label: "Membership applications", desc: "Review applications from the public." },
  { to: "/admin/messages", label: "Contact messages", desc: "Public enquiries and correspondence." },
] as const;

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminHome,
});

function AdminHome() {
  return (
    <AdminPage title="Federation Dashboard" description="Manage every public surface of the World TEBMA Federation website.">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CARDS.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="block bg-background border border-border rounded-md p-6 hover:border-foreground/40 transition-colors"
          >
            <div className="text-base font-medium tracking-tight">{c.label}</div>
            <div className="mt-1.5 text-sm text-muted-foreground">{c.desc}</div>
          </Link>
        ))}
      </div>
    </AdminPage>
  );
}
