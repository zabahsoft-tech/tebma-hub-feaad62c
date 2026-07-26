import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { AdminPage } from "@/components/admin/AdminShell";
import { DataTable } from "@/components/admin/AdminForm";
import { adminListDictionary, adminDeleteDictionary } from "@/lib/admin.functions";
import { Plus } from "lucide-react";

const qo = queryOptions({ queryKey: ["admin", "dictionary"], queryFn: () => adminListDictionary() });

export const Route = createFileRoute("/_authenticated/admin/dictionary")({
  loader: ({ context }) => context.queryClient.ensureQueryData(qo),
  component: () => {
    const { data } = useSuspenseQuery(qo);
    const qc = useQueryClient();
    return (
      <AdminPage
        title="Photo dictionary"
        action={
          <Link to="/admin/dictionary/new" className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-sm text-sm font-medium">
            <Plus className="size-4" /> New entry
          </Link>
        }
      >
        <DataTable
          rows={data}
          columns={[
            { header: "Term", cell: (r) => <span className="font-medium">{r.term}</span> },
            { header: "Slug", cell: (r) => <code className="text-xs text-muted-foreground">{r.slug}</code> },
            { header: "Tags", cell: (r) => <span className="text-xs text-muted-foreground">{(r.tags ?? []).join(", ")}</span> },
          ]}
          editTo={(r) => `/admin/dictionary/${r.id}`}
          onDelete={async (r) => {
            await adminDeleteDictionary({ data: { id: r.id } });
            await qc.invalidateQueries({ queryKey: ["admin", "dictionary"] });
          }}
        />
      </AdminPage>
    );
  },
});
