import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AdminPage } from "@/components/admin/AdminShell";
import { TextField, CheckField, SaveBar } from "@/components/admin/AdminForm";
import { RichEditor } from "@/components/admin/RichEditor";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { adminGetNews, adminUpsertNews } from "@/lib/admin.functions";
import { readNewsForm, validateNews, type NewsFormErrors } from "@/lib/news-form";
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
  const [errors, setErrors] = useState<NewsFormErrors>({});
  if (!data) return null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const values = readNewsForm(new FormData(e.currentTarget));
    const found = validateNews(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setPending(true);
    try {
      await adminUpsertNews({ data: { id, ...values } });
      toast.success("Saved");
      nav({ to: "/admin/news" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Save failed";
      if (/slug/i.test(message)) setErrors({ slug: message });
      toast.error(message);
    } finally {
      setPending(false);
    }
  }

  return (
    <AdminPage title="Edit article">
      <form onSubmit={onSubmit} noValidate className="bg-background border border-border rounded-md p-6 space-y-6 max-w-4xl">
        <TextField label="Title" name="title" defaultValue={data.title} error={errors.title} />
        <TextField
          label="URL slug"
          name="slug"
          defaultValue={data.slug}
          hint="Lowercase letters, numbers and hyphens. Must be unique."
          error={errors.slug}
        />
        <ImageUpload name="cover_url" defaultValue={data.cover_url} folder="news" />
        <TextField
          label="Excerpt (SEO description, 50–160 chars ideal)"
          name="excerpt"
          maxLength={300}
          defaultValue={data.excerpt}
          error={errors.excerpt}
        />
        <div>
          <RichEditor name="body" defaultValue={data.body} folder="news" />
          {errors.body ? <p className="mt-1 text-xs text-destructive">{errors.body}</p> : null}
        </div>
        <CheckField label="Published" name="published" defaultChecked={data.published} />
        <SaveBar pending={pending} cancelTo="/admin/news" />
      </form>
    </AdminPage>
  );
}
