import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { AdminPage } from "@/components/admin/AdminShell";
import { DataTable } from "@/components/admin/AdminForm";
import { adminListPhotos, adminDeletePhoto } from "@/lib/admin.functions";
import { Plus, Film } from "lucide-react";
import { embedThumbnail } from "@/lib/embed";


const qo = queryOptions({ queryKey: ["admin", "photos"], queryFn: () => adminListPhotos() });

export const Route = createFileRoute("/_authenticated/admin/gallery/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(qo),
  component: () => {
    const { data } = useSuspenseQuery(qo);
    const qc = useQueryClient();
    return (
      <AdminPage
        title="Gallery"
        description="Add federation event photos and YouTube or Vimeo videos."
        action={
          <Link to="/admin/gallery/new" className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-sm text-sm font-medium">
            <Plus className="size-4" /> Add item
          </Link>
        }
      >
        <DataTable
          rows={data}
          columns={[
            {
              header: "Item",
              cell: (r) => {
                const thumb = r.kind === "embed" ? r.poster_url || embedThumbnail(r.url) : r.url;
                return thumb ? (
                  <img src={thumb} alt="" className="size-14 rounded-sm object-cover" />
                ) : (
                  <span className="size-14 rounded-sm bg-muted grid place-items-center">
                    <Film className="size-5 text-muted-foreground" />
                  </span>
                );
              },
            },
            {
              header: "Type",
              cell: (r) => (
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {r.kind === "embed" ? "Video" : "Photo"}
                </span>
              ),
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
