import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AdminPage } from "@/components/admin/AdminShell";
import { TextField, TextArea, SaveBar } from "@/components/admin/AdminForm";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { adminGetContactInfo, adminUpsertContactInfo } from "@/lib/admin.functions";
import { toast } from "sonner";

const qo = queryOptions({ queryKey: ["admin", "contact-info"], queryFn: () => adminGetContactInfo() });

export const Route = createFileRoute("/_authenticated/admin/contact")({
  loader: ({ context }) => context.queryClient.ensureQueryData(qo),
  component: ContactInfoPage,
});

function ContactInfoPage() {
  const { data } = useSuspenseQuery(qo);
  const nav = useNavigate();
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => (String(fd.get(k) ?? "").trim() || null);
    try {
      await adminUpsertContactInfo({
        data: {
          hq_address: get("hq_address"),
          asia_office: get("asia_office"),
          americas_office: get("americas_office"),
          general_email: get("general_email"),
          media_email: get("media_email"),
          phone: get("phone"),
          website: get("website"),
          facebook: get("facebook"),
          instagram: get("instagram"),
          youtube: get("youtube"),
          twitter: get("twitter"),
          logo_url: get("logo_url"),
        },
      });
      toast.success("Contact info updated");
      nav({ to: "/admin/contact" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <AdminPage
      title="Contact information"
      description="Edit the addresses, emails, and social handles shown on the public Contact page."
    >
      <form onSubmit={onSubmit} className="bg-background border border-border rounded-md p-6 space-y-6 max-w-3xl">
        <section className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Brand</h2>
          <ImageUpload name="logo_url" label="Federation logo" folder="branding" defaultValue={(data as { logo_url?: string | null } | null)?.logo_url ?? ""} />
        </section>
        <section className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Offices</h2>
          <TextArea label="Headquarters address" name="hq_address" rows={2} defaultValue={data?.hq_address ?? ""} />
          <TextArea label="Asia office" name="asia_office" rows={2} defaultValue={data?.asia_office ?? ""} />
          <TextArea label="Americas office" name="americas_office" rows={2} defaultValue={data?.americas_office ?? ""} />
        </section>
        <section className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Contact</h2>
          <TextField label="General enquiries email" name="general_email" type="email" defaultValue={data?.general_email ?? ""} />
          <TextField label="Media email" name="media_email" type="email" defaultValue={data?.media_email ?? ""} />
          <TextField label="Phone" name="phone" defaultValue={data?.phone ?? ""} />
          <TextField label="Website" name="website" type="url" defaultValue={data?.website ?? ""} />
        </section>
        <section className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Social</h2>
          <TextField label="Facebook URL" name="facebook" type="url" defaultValue={data?.facebook ?? ""} />
          <TextField label="Instagram URL" name="instagram" type="url" defaultValue={data?.instagram ?? ""} />
          <TextField label="YouTube URL" name="youtube" type="url" defaultValue={data?.youtube ?? ""} />
          <TextField label="Twitter / X URL" name="twitter" type="url" defaultValue={data?.twitter ?? ""} />
        </section>
        <SaveBar pending={pending} cancelTo="/admin" />
      </form>
    </AdminPage>
  );
}
