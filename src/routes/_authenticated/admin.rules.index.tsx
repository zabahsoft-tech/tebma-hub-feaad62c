import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { AdminPage } from "@/components/admin/AdminShell";
import { DataTable } from "@/components/admin/AdminForm";
import { adminListRules, adminDeleteRule } from "@/lib/admin.functions";
import { Plus } from "lucide-react";

const qo = queryOptions({ queryKey: ["admin", "rules"], queryFn: () => adminListRules() });

export const Route = createFileRoute("/_authenticated/admin/rules/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(qo),
  component: () => {
    const { data } = useSuspenseQuery(qo);
    const qc = useQueryClient();
    return (
      <AdminPage
        title="Rules sections"
        action={
          <Link to="/admin/rules/new" className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-sm text-sm font-medium">
            <Plus className="size-4" /> New section
          </Link>
        }
      >
        <DataTable
          rows={data}
          columns={[
            { header: "Title", cell: (r) => <span className="font-medium">{r.title}</span> },
            { header: "Slug", cell: (r) => <code className="text-xs text-muted-foreground">{r.slug}</code> },
            { header: "Order", cell: (r) => <span className="text-xs">{r.sort_order}</span> },
          ]}
          editTo={(r) => `/admin/rules/${r.id}`}
          onDelete={async (r) => {
            await adminDeleteRule({ data: { id: r.id } });
            await qc.invalidateQueries({ queryKey: ["admin", "rules"] });
          }}
        />
      </AdminPage>
    );
  },
});
