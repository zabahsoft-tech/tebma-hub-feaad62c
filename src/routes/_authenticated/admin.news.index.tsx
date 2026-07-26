import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AdminPage } from "@/components/admin/AdminShell";
import { DataTable } from "@/components/admin/AdminForm";
import { adminListNews, adminDeleteNews } from "@/lib/admin.functions";
import { Plus } from "lucide-react";

const qo = queryOptions({ queryKey: ["admin", "news"], queryFn: () => adminListNews() });

export const Route = createFileRoute("/_authenticated/admin/news/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(qo),
  component: NewsAdmin,
});

function NewsAdmin() {
  const { data } = useSuspenseQuery(qo);
  const qc = useQueryClient();
  return (
    <AdminPage
      title="News"
      description="Publish and edit federation dispatches."
      action={
        <Link to="/admin/news/new" className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-sm text-sm font-medium">
          <Plus className="size-4" /> New article
        </Link>
      }
    >
      <DataTable
        rows={data}
        columns={[
          { header: "Title", cell: (r) => <span className="font-medium">{r.title}</span> },
          { header: "Slug", cell: (r) => <code className="text-xs text-muted-foreground">{r.slug}</code> },
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
        editTo={(r) => `/admin/news/${r.id}`}
        onDelete={async (r) => {
          await adminDeleteNews({ data: { id: r.id } });
          await qc.invalidateQueries({ queryKey: ["admin", "news"] });
        }}
      />
    </AdminPage>
  );
}
