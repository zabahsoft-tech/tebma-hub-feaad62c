import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AdminPage } from "@/components/admin/AdminShell";
import { TextField, CheckField, SaveBar } from "@/components/admin/AdminForm";
import { adminGetCategory, adminUpsertCategory } from "@/lib/admin.functions";
import { toast } from "sonner";

const qo = (id: string) =>
  queryOptions({ queryKey: ["admin", "categories", id], queryFn: () => adminGetCategory({ data: { id } }) });

export const Route = createFileRoute("/_authenticated/admin/categories/$id")({
  loader: async ({ context, params }) => {
    const row = await context.queryClient.ensureQueryData(qo(params.id));
    if (!row) throw notFound();
  },
  component: EditCategory,
});

function EditCategory() {
  const { id } = Route.useParams();
  const { data } = useSuspenseQuery(qo(id));
  const nav = useNavigate();
  const [pending, setPending] = useState(false);
  if (!data) return null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    try {
      await adminUpsertCategory({
        data: {
          id,
          slug: String(fd.get("slug") ?? ""),
          name: String(fd.get("name") ?? ""),
          sort_order: Number(fd.get("sort_order") ?? 0) || 0,
          visible_in_nav: fd.get("visible_in_nav") === "on",
        },
      });
      toast.success("Saved");
      nav({ to: "/admin/categories" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <AdminPage title="Edit category">
      <form onSubmit={onSubmit} className="bg-background border border-border rounded-md p-6 space-y-6 max-w-2xl">
        <TextField label="Name" name="name" required defaultValue={data.name} />
        <TextField label="URL slug" name="slug" required defaultValue={data.slug} />
        <TextField label="Sort order" name="sort_order" type="number" defaultValue={data.sort_order} />
        <CheckField label="Show in site navigation" name="visible_in_nav" defaultChecked={data.visible_in_nav} />
        <SaveBar pending={pending} cancelTo="/admin/categories" />
      </form>
    </AdminPage>
  );
}
