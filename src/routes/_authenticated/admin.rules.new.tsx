import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AdminPage } from "@/components/admin/AdminShell";
import { TextField, SaveBar } from "@/components/admin/AdminForm";
import { RichEditor } from "@/components/admin/RichEditor";
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
          <TextField label="Sort order" name="sort_order" type="number" defaultValue={0} />
          <TextArea label="Body" name="body" rows={16} />
          <SaveBar pending={pending} cancelTo="/admin/rules" />
        </form>
      </AdminPage>
    );
  },
});
