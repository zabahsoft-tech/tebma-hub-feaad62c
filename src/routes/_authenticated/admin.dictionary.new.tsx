import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AdminPage } from "@/components/admin/AdminShell";
import { TextField, TextArea, SaveBar } from "@/components/admin/AdminForm";
import { adminUpsertDictionary } from "@/lib/admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/dictionary/new")({
  component: () => {
    const nav = useNavigate();
    const [pending, setPending] = useState(false);
    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      setPending(true);
      const fd = new FormData(e.currentTarget);
      const tags = String(fd.get("tags") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
      try {
        await adminUpsertDictionary({
          data: {
            term: String(fd.get("term") ?? ""),
            slug: String(fd.get("slug") ?? ""),
            description: String(fd.get("description") ?? ""),
            image_url: String(fd.get("image_url") ?? "") || null,
            tags,
          },
        });
        toast.success("Created");
        nav({ to: "/admin/dictionary" });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Save failed");
      } finally {
        setPending(false);
      }
    }
    return (
      <AdminPage title="New dictionary entry">
        <form onSubmit={onSubmit} className="bg-background border border-border rounded-md p-6 space-y-4 max-w-3xl">
          <TextField label="Term" name="term" required />
          <TextField label="Slug" name="slug" required />
          <TextField label="Image URL" name="image_url" type="url" />
          <TextField label="Tags (comma separated)" name="tags" placeholder="stance, defense, beginner" />
          <TextArea label="Description" name="description" rows={10} />
          <SaveBar pending={pending} cancelTo="/admin/dictionary" />
        </form>
      </AdminPage>
    );
  },
});
