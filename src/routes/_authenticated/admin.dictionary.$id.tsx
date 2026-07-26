import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AdminPage } from "@/components/admin/AdminShell";
import { TextField, SaveBar } from "@/components/admin/AdminForm";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { RichEditor } from "@/components/admin/RichEditor";
import { adminGetDictionary, adminUpsertDictionary } from "@/lib/admin.functions";
import { toast } from "sonner";

const qo = (id: string) => queryOptions({ queryKey: ["admin", "dict", id], queryFn: () => adminGetDictionary({ data: { id } }) });

export const Route = createFileRoute("/_authenticated/admin/dictionary/$id")({
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
      const tags = String(fd.get("tags") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
      try {
        await adminUpsertDictionary({
          data: {
            id,
            term: String(fd.get("term") ?? ""),
            slug: String(fd.get("slug") ?? ""),
            description: String(fd.get("description") ?? ""),
            image_url: String(fd.get("image_url") ?? "") || null,
            tags,
          },
        });
        toast.success("Saved");
        nav({ to: "/admin/dictionary" });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Save failed");
      } finally {
        setPending(false);
      }
    }
    return (
      <AdminPage title="Edit dictionary entry">
        <form onSubmit={onSubmit} className="bg-background border border-border rounded-md p-6 space-y-4 max-w-3xl">
          <TextField label="Term" name="term" required defaultValue={data.term} />
          <TextField label="Slug" name="slug" required defaultValue={data.slug} />
          <ImageUpload name="image_url" label="Image" defaultValue={data.image_url} folder="dictionary" />
          <TextField label="Tags (comma separated)" name="tags" defaultValue={(data.tags ?? []).join(", ")} />
          <RichEditor name="description" folder="dictionary" defaultValue={data.description} placeholder="Describe the technique, stance, or term." />
          <SaveBar pending={pending} cancelTo="/admin/dictionary" />
        </form>
      </AdminPage>
    );
  },
});
