import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { AdminPage } from "@/components/admin/AdminShell";
import { DataTable } from "@/components/admin/AdminForm";
import { adminListPages, adminDeletePage } from "@/lib/admin.functions";
import { Plus } from "lucide-react";

const qo = queryOptions({ queryKey: ["admin", "pages"], queryFn: () => adminListPages() });

export const Route = createFileRoute("/_authenticated/admin/pages/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(qo),
  component: PagesAdmin,
});

function PagesAdmin() {
  const { data } = useSuspenseQuery(qo);
  const qc = useQueryClient();
  return (
    <AdminPage
      title="Pages"
      description="Custom content pages with rich formatting, cover images, and SEO metadata."
      action={
        <Link to="/admin/pages/new" className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-sm text-sm font-medium">
          <Plus className="size-4" /> New page
        </Link>
      }
    >
      <DataTable
        rows={data}
        columns={[
          { header: "Title", cell: (r) => <span className="font-medium">{r.title}</span> },
          { header: "Category", cell: (r) => <span className="text-xs text-muted-foreground">{r.category_name ?? "—"}</span> },
          { header: "Slug", cell: (r) => <code className="text-xs text-muted-foreground">/p/{r.slug}</code> },
          {
            header: "Status",
            cell: (r) => (
              <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-sm ${r.published ? "bg-emerald-500/15 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                {r.published ? "Published" : "Draft"}
              </span>
            ),
          },
          { header: "Updated", cell: (r) => <span className="text-xs text-muted-foreground">{new Date(r.updated_at).toLocaleDateString()}</span> },
        ]}
        editTo={(r) => `/admin/pages/${r.id}`}
        onDelete={async (r) => {
          await adminDeletePage({ data: { id: r.id } });
          await qc.invalidateQueries({ queryKey: ["admin", "pages"] });
        }}
        empty="No pages yet."
      />
    </AdminPage>
  );
}
