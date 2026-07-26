import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PageShell, PageHeader } from "@/components/site/PageShell";
import { getContactInfo, submitContact } from "@/lib/public.functions";
import { toast } from "sonner";

const contactQO = queryOptions({ queryKey: ["public", "contact-info"], queryFn: () => getContactInfo() });

export const Route = createFileRoute("/contact")({
  loader: ({ context }) => context.queryClient.ensureQueryData(contactQO),
  head: () => ({
    meta: [
      { title: "Contact — World TEBMA Federation" },
      { name: "description", content: "Reach the World TEBMA Federation headquarters. General enquiries, media, and member support." },
      { property: "og:title", content: "Contact — World TEBMA Federation" },
      { property: "og:description", content: "Reach the World TEBMA Federation headquarters." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { data: info } = useSuspenseQuery(contactQO);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    try {
      await submitContact({
        data: {
          name: String(fd.get("name") ?? ""),
          email: String(fd.get("email") ?? ""),
          subject: String(fd.get("subject") ?? "") || null,
          message: String(fd.get("message") ?? ""),
        },
      });
      toast.success("Message received. Thank you.");
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  const rows: Array<{ k: string; v: string; href?: string }> = [];
  if (info?.hq_address) rows.push({ k: "Headquarters", v: info.hq_address });
  if (info?.asia_office) rows.push({ k: "Asia office", v: info.asia_office });
  if (info?.americas_office) rows.push({ k: "Americas office", v: info.americas_office });
  if (info?.general_email) rows.push({ k: "General enquiries", v: info.general_email, href: `mailto:${info.general_email}` });
  if (info?.media_email) rows.push({ k: "Media", v: info.media_email, href: `mailto:${info.media_email}` });
  if (info?.phone) rows.push({ k: "Phone", v: info.phone, href: `tel:${info.phone.replace(/\s+/g, "")}` });
  if (info?.website) rows.push({ k: "Website", v: info.website, href: info.website });

  const socials: Array<{ label: string; href: string }> = [];
  if (info?.facebook) socials.push({ label: "Facebook", href: info.facebook });
  if (info?.instagram) socials.push({ label: "Instagram", href: info.instagram });
  if (info?.youtube) socials.push({ label: "YouTube", href: info.youtube });
  if (info?.twitter) socials.push({ label: "Twitter / X", href: info.twitter });

  return (
    <PageShell>
      <PageHeader eyebrow="Correspondence" title="Contact the Federation" description="Reach the federation headquarters for enquiries, media, or member support." />
      <section className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-10">
        <div className="space-y-8">
          {rows.map((r) => (
            <div key={r.k} className="border-b border-border pb-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{r.k}</div>
              <div className="mt-1 text-lg">
                {r.href ? (
                  <a href={r.href} className="hover:underline underline-offset-4">{r.v}</a>
                ) : (
                  r.v
                )}
              </div>
            </div>
          ))}
          {socials.length > 0 && (
            <div className="pt-2">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Follow</div>
              <ul className="flex flex-wrap gap-3">
                {socials.map((s) => (
                  <li key={s.label}>
                    <a href={s.href} target="_blank" rel="noreferrer" className="inline-block border border-border rounded-sm px-3 py-1.5 text-sm hover:bg-muted">{s.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <form onSubmit={onSubmit} className="border border-border rounded-md p-6 space-y-4 h-fit">
          <h2 className="text-lg font-medium tracking-tight">Send a message</h2>
          <Field label="Name" name="name" required />
          <Field label="Email" name="email" type="email" required />
          <Field label="Subject" name="subject" />
          <label className="block text-sm">
            <span className="block text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1.5">Message</span>
            <textarea name="message" rows={6} required className="w-full py-2 px-3 bg-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-foreground/30" />
          </label>
          <button disabled={pending} className="w-full bg-foreground text-background py-3 rounded-sm text-sm font-medium disabled:opacity-60">
            {pending ? "Sending…" : "Send"}
          </button>
        </form>
      </section>
    </PageShell>
  );
}

function Field({ label, name, type = "text", required }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <label className="block text-sm">
      <span className="block text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1.5">{label}</span>
      <input name={name} type={type} required={required} className="w-full py-2 px-3 bg-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-foreground/30" />
    </label>
  );
}
