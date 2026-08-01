import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AdminPage } from "@/components/admin/AdminShell";
import { TextField, SaveBar } from "@/components/admin/AdminForm";
import { RichEditor } from "@/components/admin/RichEditor";
import { ImageUpload } from "@/components/admin/ImageUpload";

import { adminGetRule, adminUpsertRule } from "@/lib/admin.functions";
import { toast } from "sonner";

const qo = (id: string) => queryOptions({ queryKey: ["admin", "rule", id], queryFn: () => adminGetRule({ data: { id } }) });

export const Route = createFileRoute("/_authenticated/admin/rules/$id")({
  loader: async ({ context, params }) => {
    const row = await context.queryClient.ensureQueryData(qo(params.id));
    if (!row) throw notFound();
  },
  component: () => {
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
        await adminUpsertRule({
          data: {
            id,
            title: String(fd.get("title") ?? ""),
            slug: String(fd.get("slug") ?? ""),
            body: String(fd.get("body") ?? ""),
            sort_order: Number(fd.get("sort_order") ?? 0),
          },
        });
        toast.success("Saved");
        nav({ to: "/admin/rules" });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Save failed");
      } finally {
        setPending(false);
      }
    }
    return (
      <AdminPage title="Edit rules section">
        <form onSubmit={onSubmit} className="bg-background border border-border rounded-md p-6 space-y-4 max-w-3xl">
          <TextField label="Title" name="title" required defaultValue={data.title} />
          <TextField label="Slug" name="slug" required defaultValue={data.slug} />
          <TextField label="Sort order" name="sort_order" type="number" defaultValue={data.sort_order} />
          <RichEditor name="body" folder="rules" defaultValue={data.body} placeholder="Write the rules section. Use headings, lists, and links." />
          <SaveBar pending={pending} cancelTo="/admin/rules" />
        </form>
      </AdminPage>
    );
  },
});
