import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AdminPage } from "@/components/admin/AdminShell";
import { TextField, CheckField, SaveBar } from "@/components/admin/AdminForm";
import { adminUpsertCategory } from "@/lib/admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/categories/new")({
  component: NewCategory,
});

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 120);
}

function NewCategory() {
  const nav = useNavigate();
  const [pending, setPending] = useState(false);
  const [slugDirty, setSlugDirty] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    try {
      await adminUpsertCategory({
        data: {
          slug: String(fd.get("slug") ?? ""),
          name: String(fd.get("name") ?? ""),
          sort_order: Number(fd.get("sort_order") ?? 0) || 0,
          visible_in_nav: fd.get("visible_in_nav") === "on",
        },
      });
      toast.success("Category created");
      nav({ to: "/admin/categories" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <AdminPage title="New category" description="Categories group custom pages and can appear in the site navigation.">
      <form onSubmit={onSubmit} className="bg-background border border-border rounded-md p-6 space-y-6 max-w-2xl">
        <TextField
          label="Name"
          name="name"
          required
          onChange={(e) => {
            if (!slugDirty) {
              const el = e.currentTarget.form?.elements.namedItem("slug") as HTMLInputElement | null;
              if (el) el.value = slugify(e.currentTarget.value);
            }
          }}
        />
        <TextField label="URL slug" name="slug" required placeholder="federation" onChange={() => setSlugDirty(true)} />
        <TextField label="Sort order" name="sort_order" type="number" defaultValue={0} />
        <CheckField label="Show in site navigation" name="visible_in_nav" defaultChecked />
        <SaveBar pending={pending} cancelTo="/admin/categories" />
      </form>
    </AdminPage>
  );
}
