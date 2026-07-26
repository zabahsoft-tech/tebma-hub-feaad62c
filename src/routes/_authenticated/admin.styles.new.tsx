import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AdminPage } from "@/components/admin/AdminShell";
import { TextField, TextArea, SaveBar } from "@/components/admin/AdminForm";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { adminUpsertStyle } from "@/lib/admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/styles/new")({
  component: () => {
    const nav = useNavigate();
    const [pending, setPending] = useState(false);
    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      setPending(true);
      const fd = new FormData(e.currentTarget);
      try {
        await adminUpsertStyle({
          data: {
            name: String(fd.get("name") ?? ""),
            slug: String(fd.get("slug") ?? ""),
            tagline: String(fd.get("tagline") ?? "") || null,
            description: String(fd.get("description") ?? ""),
            cover_url: String(fd.get("cover_url") ?? "") || null,
            sort_order: Number(fd.get("sort_order") ?? 0),
          },
        });
        toast.success("Created");
        nav({ to: "/admin/styles" });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Save failed");
      } finally {
        setPending(false);
      }
    }
    return (
      <AdminPage title="New discipline">
        <form onSubmit={onSubmit} className="bg-background border border-border rounded-md p-6 space-y-4 max-w-3xl">
          <TextField label="Name" name="name" required />
          <TextField label="Slug" name="slug" required />
          <TextField label="Tagline" name="tagline" />
          <ImageUpload name="cover_url" folder="styles" />
          <TextField label="Sort order" name="sort_order" type="number" defaultValue={0} />
          <TextArea label="Description" name="description" rows={12} />
          <SaveBar pending={pending} cancelTo="/admin/styles" />
        </form>
      </AdminPage>
    );
  },
});
