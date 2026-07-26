import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AdminPage } from "@/components/admin/AdminShell";
import { TextField, CheckField, SaveBar } from "@/components/admin/AdminForm";
import { RichEditor } from "@/components/admin/RichEditor";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { adminGetNews, adminUpsertNews } from "@/lib/admin.functions";
import { toast } from "sonner";

const qo = (id: string) => queryOptions({ queryKey: ["admin", "news", id], queryFn: () => adminGetNews({ data: { id } }) });

export const Route = createFileRoute("/_authenticated/admin/news/$id")({
  loader: async ({ context, params }) => {
    const row = await context.queryClient.ensureQueryData(qo(params.id));
    if (!row) throw notFound();
  },
  component: EditNews,
});

function EditNews() {
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
      await adminUpsertNews({
        data: {
          id,
          slug: String(fd.get("slug") ?? ""),
          title: String(fd.get("title") ?? ""),
          excerpt: String(fd.get("excerpt") ?? "") || null,
          body: String(fd.get("body") ?? ""),
          cover_url: String(fd.get("cover_url") ?? "") || null,
          published: fd.get("published") === "on",
        },
      });
      toast.success("Saved");
      nav({ to: "/admin/news" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setPending(false);
    }
  }
  return (
    <AdminPage title="Edit article">
      <form onSubmit={onSubmit} className="bg-background border border-border rounded-md p-6 space-y-6 max-w-4xl">
        <TextField label="Title" name="title" required defaultValue={data.title} />
        <TextField label="URL slug" name="slug" required defaultValue={data.slug} />
        <ImageUpload name="cover_url" defaultValue={data.cover_url} folder="news" />
        <TextField label="Excerpt (SEO description, 50–160 chars ideal)" name="excerpt" maxLength={300} defaultValue={data.excerpt} />
        <RichEditor name="body" defaultValue={data.body} folder="news" />
        <CheckField label="Published" name="published" defaultChecked={data.published} />
        <SaveBar pending={pending} cancelTo="/admin/news" />
      </form>
    </AdminPage>
  );
}
