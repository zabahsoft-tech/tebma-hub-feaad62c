import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AdminPage } from "@/components/admin/AdminShell";
import { TextField, SaveBar } from "@/components/admin/AdminForm";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { adminListPhotos, adminUpsertPhoto } from "@/lib/admin.functions";
import { toast } from "sonner";

const qo = queryOptions({ queryKey: ["admin", "photos"], queryFn: () => adminListPhotos() });

export const Route = createFileRoute("/_authenticated/admin/gallery/$id")({
  loader: async ({ context, params }) => {
    const rows = await context.queryClient.ensureQueryData(qo);
    if (!rows.find((r) => r.id === params.id)) throw notFound();
  },
  component: () => {
    const { id } = Route.useParams();
    const { data } = useSuspenseQuery(qo);
    const row = data.find((r) => r.id === id);
    const nav = useNavigate();
    const [pending, setPending] = useState(false);
    if (!row) return null;
    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      setPending(true);
      const fd = new FormData(e.currentTarget);
      try {
        await adminUpsertPhoto({
          data: {
            id,
            url: String(fd.get("url") ?? ""),
            caption: String(fd.get("caption") ?? "") || null,
            sort_order: Number(fd.get("sort_order") ?? 0),
          },
        });
        toast.success("Saved");
        nav({ to: "/admin/gallery" });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Save failed");
      } finally {
        setPending(false);
      }
    }
    return (
      <AdminPage title="Edit photo">
        <form onSubmit={onSubmit} className="bg-background border border-border rounded-md p-6 space-y-4 max-w-2xl">
          <ImageUpload name="url" label="Photo" defaultValue={row.url} folder="gallery" />
          <TextField label="Caption" name="caption" defaultValue={row.caption} />
          <TextField label="Sort order" name="sort_order" type="number" defaultValue={row.sort_order} />
          <SaveBar pending={pending} cancelTo="/admin/gallery" />
        </form>
      </AdminPage>
    );
  },
});
