import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AdminPage } from "@/components/admin/AdminShell";
import { TextField, CheckField, SelectField, SaveBar } from "@/components/admin/AdminForm";
import { RichEditor } from "@/components/admin/RichEditor";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { adminUpsertPage, adminListCategories } from "@/lib/admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/pages/new")({
  component: NewPage,
});

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 120);
}

function NewPage() {
  const nav = useNavigate();
  const [pending, setPending] = useState(false);
  const [slugDirty, setSlugDirty] = useState(false);
  const { data: cats } = useQuery({ queryKey: ["admin", "categories"], queryFn: () => adminListCategories() });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    try {
      await adminUpsertPage({
        data: {
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
      toast.success("Page created");
      nav({ to: "/admin/pages" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <AdminPage title="New page" description="Create a custom page with rich content, images, and search metadata.">
      <form onSubmit={onSubmit} className="bg-background border border-border rounded-md p-6 space-y-6 max-w-4xl">
        <TextField
          label="Title"
          name="title"
          required
          onChange={(e) => {
            if (!slugDirty) {
              const el = e.currentTarget.form?.elements.namedItem("slug") as HTMLInputElement | null;
              if (el) el.value = slugify(e.currentTarget.value);
            }
          }}
        />
        <TextField label="URL slug" name="slug" required placeholder="history-of-the-federation" onChange={() => setSlugDirty(true)} />
        <SelectField
          label="Category"
          name="category_id"
          options={[{ value: "", label: "— No category —" }, ...(cats ?? []).map((c) => ({ value: c.id, label: c.name }))]}
        />
        <ImageUpload name="cover_url" folder="pages" />
        <TextField label="Excerpt (summary shown in listings)" name="excerpt" maxLength={300} />
        <RichEditor name="body" folder="pages" placeholder="Write the page content. Use headings, lists, links, and images." />
        <TextField label="SEO title (defaults to page title)" name="seo_title" maxLength={200} />
        <TextField label="SEO description (50–160 chars ideal)" name="seo_description" maxLength={300} />
        <TextField label="Sort order" name="sort_order" type="number" defaultValue={0} />
        <CheckField label="Publish immediately" name="published" defaultChecked />
        <SaveBar pending={pending} cancelTo="/admin/pages" />
      </form>
    </AdminPage>
  );
}
