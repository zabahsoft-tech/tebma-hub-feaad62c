import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { AdminPage } from "@/components/admin/AdminShell";
import { DataTable } from "@/components/admin/AdminForm";
import { adminListCategories, adminDeleteCategory } from "@/lib/admin.functions";
import { Plus } from "lucide-react";

const qo = queryOptions({ queryKey: ["admin", "categories"], queryFn: () => adminListCategories() });

export const Route = createFileRoute("/_authenticated/admin/categories/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(qo),
  component: CategoriesAdmin,
});

function CategoriesAdmin() {
  const { data } = useSuspenseQuery(qo);
  const qc = useQueryClient();
  return (
    <AdminPage
      title="Categories"
      description="Group custom pages. Categories appear as dropdown menus in the site navigation."
      action={
        <Link to="/admin/categories/new" className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-sm text-sm font-medium">
          <Plus className="size-4" /> New category
        </Link>
      }
    >
      <DataTable
        rows={data}
        columns={[
          { header: "Name", cell: (r) => <span className="font-medium">{r.name}</span> },
          { header: "Slug", cell: (r) => <code className="text-xs text-muted-foreground">{r.slug}</code> },
          { header: "Order", cell: (r) => <span className="text-xs text-muted-foreground">{r.sort_order}</span> },
          {
            header: "Navigation",
            cell: (r) => (
              <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-sm ${r.visible_in_nav ? "bg-emerald-500/15 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                {r.visible_in_nav ? "Visible" : "Hidden"}
              </span>
            ),
          },
        ]}
        editTo={(r) => `/admin/categories/${r.id}`}
        onDelete={async (r) => {
          await adminDeleteCategory({ data: { id: r.id } });
          await qc.invalidateQueries({ queryKey: ["admin", "categories"] });
        }}
        empty="No categories yet."
      />
    </AdminPage>
  );
}
