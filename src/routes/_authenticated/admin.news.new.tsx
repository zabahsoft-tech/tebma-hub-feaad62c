import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AdminPage } from "@/components/admin/AdminShell";
import { TextField, TextArea, CheckField, SaveBar } from "@/components/admin/AdminForm";
import { adminUpsertNews } from "@/lib/admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/news/new")({
  component: NewNews,
});

function NewNews() {
  const nav = useNavigate();
  const [pending, setPending] = useState(false);
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
    <AdminPage title="New article">
      <form onSubmit={onSubmit} className="bg-background border border-border rounded-md p-6 space-y-4 max-w-3xl">
        <TextField label="Title" name="title" required />
        <TextField label="Slug" name="slug" required placeholder="new-year-championship-2026" />
        <TextField label="Cover image URL" name="cover_url" type="url" />
        <TextArea label="Excerpt" name="excerpt" rows={3} />
        <TextArea label="Body" name="body" rows={14} />
        <CheckField label="Publish immediately" name="published" />
        <SaveBar pending={pending} cancelTo="/admin/news" />
      </form>
    </AdminPage>
  );
}
