import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { AdminPage } from "@/components/admin/AdminShell";
import { DataTable } from "@/components/admin/AdminForm";
import { adminListStyles, adminDeleteStyle } from "@/lib/admin.functions";
import { Plus } from "lucide-react";

const qo = queryOptions({ queryKey: ["admin", "styles"], queryFn: () => adminListStyles() });

export const Route = createFileRoute("/_authenticated/admin/styles/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(qo),
  component: () => {
    const { data } = useSuspenseQuery(qo);
    const qc = useQueryClient();
    return (
      <AdminPage
        title="Disciplines"
        action={
          <Link to="/admin/styles/new" className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-sm text-sm font-medium">
            <Plus className="size-4" /> New style
          </Link>
        }
      >
        <DataTable
          rows={data}
          columns={[
            { header: "Name", cell: (r) => <span className="font-medium">{r.name}</span> },
            { header: "Slug", cell: (r) => <code className="text-xs text-muted-foreground">{r.slug}</code> },
            { header: "Order", cell: (r) => <span className="text-xs">{r.sort_order}</span> },
          ]}
          editTo={(r) => `/admin/styles/${r.id}`}
          onDelete={async (r) => {
            await adminDeleteStyle({ data: { id: r.id } });
            await qc.invalidateQueries({ queryKey: ["admin", "styles"] });
          }}
        />
      </AdminPage>
    );
  },
});
