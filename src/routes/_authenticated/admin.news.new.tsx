import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AdminPage } from "@/components/admin/AdminShell";
import { TextField, CheckField, SaveBar } from "@/components/admin/AdminForm";
import { RichEditor } from "@/components/admin/RichEditor";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { adminUpsertNews } from "@/lib/admin.functions";
import { readNewsForm, slugify, validateNews, type NewsFormErrors } from "@/lib/news-form";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/news/new")({
  component: NewNews,
});

function NewNews() {
  const nav = useNavigate();
  const [pending, setPending] = useState(false);
  const [slugDirty, setSlugDirty] = useState(false);
  const [errors, setErrors] = useState<NewsFormErrors>({});

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
      await adminUpsertNews({ data: values });
      toast.success("Article created");
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
    <AdminPage title="New article" description="Compose a federation dispatch with rich formatting and inline images.">
      <form onSubmit={onSubmit} noValidate className="bg-background border border-border rounded-md p-6 space-y-6 max-w-4xl">
        <TextField
          label="Title"
          name="title"
          error={errors.title}
          onChange={(e) => {
            if (!slugDirty) {
              const slug = slugify(e.currentTarget.value);
              const el = e.currentTarget.form?.elements.namedItem("slug") as HTMLInputElement | null;
              if (el) el.value = slug;
            }
          }}
        />
        <TextField
          label="URL slug"
          name="slug"
          placeholder="new-year-championship-2026"
          hint="Lowercase letters, numbers and hyphens. Must be unique."
          error={errors.slug}
          onChange={() => setSlugDirty(true)}
        />
        <ImageUpload name="cover_url" folder="news" />
        <TextField
          label="Excerpt (SEO description, 50–160 chars ideal)"
          name="excerpt"
          maxLength={300}
          error={errors.excerpt}
          placeholder="One-sentence summary that appears in search results and social cards."
        />
        <div>
          <RichEditor name="body" folder="news" placeholder="Write the full article. Use headings, lists, links, and images." />
          {errors.body ? <p className="mt-1 text-xs text-destructive">{errors.body}</p> : null}
        </div>
        <CheckField label="Publish immediately" name="published" defaultChecked />
        <SaveBar pending={pending} cancelTo="/admin/news" />
      </form>
    </AdminPage>
  );
}
