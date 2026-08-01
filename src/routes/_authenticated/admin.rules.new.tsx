import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AdminPage } from "@/components/admin/AdminShell";
import { TextField, SaveBar } from "@/components/admin/AdminForm";
import { RichEditor } from "@/components/admin/RichEditor";
import { ImageUpload } from "@/components/admin/ImageUpload";

import { adminUpsertRule } from "@/lib/admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/rules/new")({
  component: () => {
    const nav = useNavigate();
    const [pending, setPending] = useState(false);
    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      setPending(true);
      const fd = new FormData(e.currentTarget);
      try {
        await adminUpsertRule({
          data: {
            title: String(fd.get("title") ?? ""),
            slug: String(fd.get("slug") ?? ""),
            excerpt: String(fd.get("excerpt") ?? "") || null,
            cover_url: String(fd.get("cover_url") ?? "") || null,
            body: String(fd.get("body") ?? ""),
            sort_order: Number(fd.get("sort_order") ?? 0),
          },
        });

        toast.success("Created");
        nav({ to: "/admin/rules" });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Save failed");
      } finally {
        setPending(false);
      }
    }
    return (
      <AdminPage title="New rules section">
        <form onSubmit={onSubmit} className="bg-background border border-border rounded-md p-6 space-y-4 max-w-3xl">
          <TextField label="Title" name="title" required />
          <TextField label="Slug" name="slug" required />
          <ImageUpload name="cover_url" folder="rules" />
          <TextField label="Excerpt (short summary shown in the listing)" name="excerpt" maxLength={300} />
          <TextField label="Sort order" name="sort_order" type="number" defaultValue={0} />
          <RichEditor name="body" folder="rules" placeholder="Write the rules section. Use headings, lists, and links." />
          <SaveBar pending={pending} cancelTo="/admin/rules" />
        </form>
      </AdminPage>

    );
  },
});
