import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AdminPage } from "@/components/admin/AdminShell";
import { TextField, CheckField, SelectField, SaveBar } from "@/components/admin/AdminForm";
import { RichEditor } from "@/components/admin/RichEditor";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { adminGetPage, adminUpsertPage, adminListCategories } from "@/lib/admin.functions";
import { toast } from "sonner";

const qo = (id: string) => queryOptions({ queryKey: ["admin", "pages", id], queryFn: () => adminGetPage({ data: { id } }) });

export const Route = createFileRoute("/_authenticated/admin/pages/$id")({
  loader: async ({ context, params }) => {
    const row = await context.queryClient.ensureQueryData(qo(params.id));
    if (!row) throw notFound();
  },
  component: EditPage,
});

function EditPage() {
  const { id } = Route.useParams();
  const { data } = useSuspenseQuery(qo(id));
  const { data: cats } = useQuery({ queryKey: ["admin", "categories"], queryFn: () => adminListCategories() });
  const nav = useNavigate();
  const [pending, setPending] = useState(false);
  if (!data) return null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    try {
      await adminUpsertPage({
        data: {
          id,
          slug: String(fd.get("slug") ?? ""),
          title: String(fd.get("title") ?? ""),
          category_id: String(fd.get("category_id") ?? ""),
          excerpt: String(fd.get("excerpt") ?? "") || null,
          body: String(fd.get("body") ?? ""),
          cover_url: String(fd.get("cover_url") ?? "") || null,
          seo_title: String(fd.get("seo_title") ?? "") || null,
          seo_description: String(fd.get("seo_description") ?? "") || null,
          published: fd.get("published") === "on",
          sort_order: Number(fd.get("sort_order") ?? 0) || 0,
        },
      });
      toast.success("Saved");
      nav({ to: "/admin/pages" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <AdminPage title="Edit page">
      <form onSubmit={onSubmit} className="bg-background border border-border rounded-md p-6 space-y-6 max-w-4xl">
        <TextField label="Title" name="title" required defaultValue={data.title} />
        <TextField label="URL slug" name="slug" required defaultValue={data.slug} />
        <SelectField
          label="Category"
          name="category_id"
          defaultValue={data.category_id ?? ""}
          options={[{ value: "", label: "— No category —" }, ...(cats ?? []).map((c) => ({ value: c.id, label: c.name }))]}
        />
        <ImageUpload name="cover_url" defaultValue={data.cover_url} folder="pages" />
        <TextField label="Excerpt (summary shown in listings)" name="excerpt" maxLength={300} defaultValue={data.excerpt} />
        <RichEditor name="body" defaultValue={data.body} folder="pages" />
        <TextField label="SEO title (defaults to page title)" name="seo_title" maxLength={200} defaultValue={data.seo_title} />
        <TextField label="SEO description (50–160 chars ideal)" name="seo_description" maxLength={300} defaultValue={data.seo_description} />
        <TextField label="Sort order" name="sort_order" type="number" defaultValue={data.sort_order} />
        <CheckField label="Published" name="published" defaultChecked={data.published} />
        <SaveBar pending={pending} cancelTo="/admin/pages" />
      </form>
    </AdminPage>
  );
}
