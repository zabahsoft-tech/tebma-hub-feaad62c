import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AdminPage } from "@/components/admin/AdminShell";
import { TextField, SaveBar } from "@/components/admin/AdminForm";
import { GalleryItemFields } from "@/components/admin/GalleryItemFields";
import { adminUpsertPhoto } from "@/lib/admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/gallery/new")({
  component: () => {
    const nav = useNavigate();
    const [pending, setPending] = useState(false);
    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      setPending(true);
      const fd = new FormData(e.currentTarget);
      try {
        await adminUpsertPhoto({
          data: {
            kind: (String(fd.get("kind") ?? "image") as "image" | "embed"),
            url: String(fd.get("url") ?? ""),
            poster_url: String(fd.get("poster_url") ?? "") || null,
            caption: String(fd.get("caption") ?? "") || null,
            sort_order: Number(fd.get("sort_order") ?? 0),
          },
        });
        toast.success("Added");
        nav({ to: "/admin/gallery" });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Save failed");
      } finally {
        setPending(false);
      }
    }
    return (
      <AdminPage title="Add gallery item">
        <form onSubmit={onSubmit} className="bg-background border border-border rounded-md p-6 space-y-4 max-w-2xl">
          <GalleryItemFields />
          <TextField label="Caption" name="caption" />
          <TextField label="Sort order" name="sort_order" type="number" defaultValue={0} />
          <SaveBar pending={pending} cancelTo="/admin/gallery" />
        </form>
      </AdminPage>
    );
  },
});
