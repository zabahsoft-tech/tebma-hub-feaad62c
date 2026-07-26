import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AdminPage } from "@/components/admin/AdminShell";
import { TextField, TextArea, SaveBar } from "@/components/admin/AdminForm";
import { adminGetStyle, adminUpsertStyle } from "@/lib/admin.functions";
import { toast } from "sonner";

const qo = (id: string) => queryOptions({ queryKey: ["admin", "style", id], queryFn: () => adminGetStyle({ data: { id } }) });

export const Route = createFileRoute("/_authenticated/admin/styles/$id")({
  loader: async ({ context, params }) => {
    const row = await context.queryClient.ensureQueryData(qo(params.id));
    if (!row) throw notFound();
  },
  component: () => {
    const { id } = Route.useParams();
    const { data } = useSuspenseQuery(qo(id));
    const nav = useNavigate();
    const [pending, setPending] = useState(false);
    if (!data) return null;
    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      setPending(true);
      const fd = new FormData(e.currentTarget);
      try {
        await adminUpsertStyle({
          data: {
            id,
            name: String(fd.get("name") ?? ""),
            slug: String(fd.get("slug") ?? ""),
            tagline: String(fd.get("tagline") ?? "") || null,
            description: String(fd.get("description") ?? ""),
            cover_url: String(fd.get("cover_url") ?? "") || null,
            sort_order: Number(fd.get("sort_order") ?? 0),
          },
        });
        toast.success("Saved");
        nav({ to: "/admin/styles" });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Save failed");
      } finally {
        setPending(false);
      }
    }
    return (
      <AdminPage title="Edit discipline">
        <form onSubmit={onSubmit} className="bg-background border border-border rounded-md p-6 space-y-4 max-w-3xl">
          <TextField label="Name" name="name" required defaultValue={data.name} />
          <TextField label="Slug" name="slug" required defaultValue={data.slug} />
          <TextField label="Tagline" name="tagline" defaultValue={data.tagline} />
          <TextField label="Cover URL" name="cover_url" type="url" defaultValue={data.cover_url} />
          <TextField label="Sort order" name="sort_order" type="number" defaultValue={data.sort_order} />
          <TextArea label="Description" name="description" rows={12} defaultValue={data.description} />
          <SaveBar pending={pending} cancelTo="/admin/styles" />
        </form>
      </AdminPage>
    );
  },
});
