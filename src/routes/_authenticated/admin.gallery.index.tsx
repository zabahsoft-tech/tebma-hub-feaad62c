import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { AdminPage } from "@/components/admin/AdminShell";
import { DataTable } from "@/components/admin/AdminForm";
import { adminListPhotos, adminDeletePhoto } from "@/lib/admin.functions";
import { Plus } from "lucide-react";

const qo = queryOptions({ queryKey: ["admin", "photos"], queryFn: () => adminListPhotos() });

export const Route = createFileRoute("/_authenticated/admin/gallery/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(qo),
  component: () => {
    const { data } = useSuspenseQuery(qo);
    const qc = useQueryClient();
    return (
      <AdminPage
        title="Gallery"
        description="Add federation event photos by URL."
        action={
          <Link to="/admin/gallery/new" className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-sm text-sm font-medium">
            <Plus className="size-4" /> Add photo
          </Link>
        }
      >
        <DataTable
          rows={data}
          columns={[
            {
              header: "Photo",
              cell: (r) => <img src={r.url} alt="" className="size-14 rounded-sm object-cover" />,
            },
            { header: "Caption", cell: (r) => <span className="text-sm">{r.caption ?? "—"}</span> },
            { header: "Order", cell: (r) => <span className="text-xs">{r.sort_order}</span> },
          ]}
          editTo={(r) => `/admin/gallery/${r.id}`}
          onDelete={async (r) => {
            await adminDeletePhoto({ data: { id: r.id } });
            await qc.invalidateQueries({ queryKey: ["admin", "photos"] });
          }}
        />
      </AdminPage>
    );
  },
});
