import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { AdminPage } from "@/components/admin/AdminShell";
import { DataTable } from "@/components/admin/AdminForm";
import { adminListCerts, adminDeleteCert } from "@/lib/admin.functions";
import { Plus } from "lucide-react";

const qo = queryOptions({ queryKey: ["admin", "certs"], queryFn: () => adminListCerts() });

export const Route = createFileRoute("/_authenticated/admin/certificates/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(qo),
  component: () => {
    const { data } = useSuspenseQuery(qo);
    const qc = useQueryClient();
    return (
      <AdminPage
        title="Certificates"
        description="Issue and revoke federation rank certificates."
        action={
          <Link to="/admin/certificates/new" className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-sm text-sm font-medium">
            <Plus className="size-4" /> Issue certificate
          </Link>
        }
      >
        <DataTable
          rows={data}
          columns={[
            { header: "Code", cell: (r) => <code className="text-xs font-mono">{r.code}</code> },
            { header: "Holder", cell: (r) => <span className="font-medium">{r.holder_name}</span> },
            { header: "Rank", cell: (r) => r.rank },
            { header: "Discipline", cell: (r) => <span className="text-sm text-muted-foreground">{r.style_name ?? "—"}</span> },
            {
              header: "Status",
              cell: (r) => (
                <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-sm ${r.status === "active" ? "bg-emerald-500/15 text-emerald-700" : r.status === "revoked" ? "bg-destructive/15 text-destructive" : "bg-muted text-muted-foreground"}`}>
                  {r.status}
                </span>
              ),
            },
          ]}
          editTo={(r) => `/admin/certificates/${r.id}`}
          onDelete={async (r) => {
            await adminDeleteCert({ data: { id: r.id } });
            await qc.invalidateQueries({ queryKey: ["admin", "certs"] });
          }}
        />
      </AdminPage>
    );
  },
});
