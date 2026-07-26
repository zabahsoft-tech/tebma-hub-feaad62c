import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AdminPage } from "@/components/admin/AdminShell";
import { TextField, CheckField, SaveBar } from "@/components/admin/AdminForm";
import { RichEditor } from "@/components/admin/RichEditor";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { adminUpsertNews } from "@/lib/admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/news/new")({
  component: NewNews,
});

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

function NewNews() {
  const nav = useNavigate();
  const [pending, setPending] = useState(false);
  const [slugDirty, setSlugDirty] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    try {
      await adminUpsertNews({
        data: {
          slug: String(fd.get("slug") ?? ""),
          title: String(fd.get("title") ?? ""),
          excerpt: String(fd.get("excerpt") ?? "") || null,
          body: String(fd.get("body") ?? ""),
          cover_url: String(fd.get("cover_url") ?? "") || null,
          published: fd.get("published") === "on",
        },
      });
      toast.success("Article created");
      nav({ to: "/admin/news" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setPending(false);
    }
  }
  return (
    <AdminPage title="New article" description="Compose a federation dispatch with rich formatting and inline images.">
      <form onSubmit={onSubmit} className="bg-background border border-border rounded-md p-6 space-y-6 max-w-4xl">
        <TextField
          label="Title"
          name="title"
          required
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
          required
          placeholder="new-year-championship-2026"
          onChange={() => setSlugDirty(true)}
        />
        <ImageUpload name="cover_url" folder="news" />
        <TextField
          label="Excerpt (SEO description, 50–160 chars ideal)"
          name="excerpt"
          maxLength={300}
          placeholder="One-sentence summary that appears in search results and social cards."
        />
        <RichEditor name="body" folder="news" placeholder="Write the full article. Use headings, lists, links, and images." />
        <CheckField label="Publish immediately" name="published" />
        <SaveBar pending={pending} cancelTo="/admin/news" />
      </form>
    </AdminPage>
  );
}
