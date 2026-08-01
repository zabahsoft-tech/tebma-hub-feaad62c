import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PageShell, PageHeader } from "@/components/site/PageShell";
import { getContactInfo, submitContact } from "@/lib/public.functions";
import { toast } from "sonner";
import { Mail, Phone, Globe, Clock, MapPin, Facebook, Instagram, Youtube, Twitter } from "lucide-react";

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

  const siteTitle = (info as { site_title?: string | null } | null)?.site_title?.trim() || "World TEBMA Federation";
  const intro = (info as { contact_intro?: string | null } | null)?.contact_intro?.trim() || "Reach the federation headquarters for enquiries, media, or member support.";
  const hours = (info as { office_hours?: string | null } | null)?.office_hours?.trim() || null;
  const mapUrl = (info as { map_embed_url?: string | null } | null)?.map_embed_url?.trim() || null;

  const offices: Array<{ k: string; v: string }> = [];
  if (info?.hq_address) offices.push({ k: "Headquarters", v: info.hq_address });
  if (info?.asia_office) offices.push({ k: "Asia office", v: info.asia_office });
  if (info?.americas_office) offices.push({ k: "Americas office", v: info.americas_office });

  const channels: Array<{ k: string; v: string; href?: string; Icon: typeof Mail }> = [];
  if (info?.general_email) channels.push({ k: "General enquiries", v: info.general_email, href: `mailto:${info.general_email}`, Icon: Mail });
  if (info?.media_email) channels.push({ k: "Media", v: info.media_email, href: `mailto:${info.media_email}`, Icon: Mail });
  if (info?.phone) channels.push({ k: "Phone", v: info.phone, href: `tel:${info.phone.replace(/\s+/g, "")}`, Icon: Phone });
  if (info?.website) channels.push({ k: "Website", v: info.website, href: info.website, Icon: Globe });
  if (hours) channels.push({ k: "Office hours", v: hours, Icon: Clock });

  const socials: Array<{ label: string; href: string; Icon: typeof Facebook }> = [];
  if (info?.facebook) socials.push({ label: "Facebook", href: info.facebook, Icon: Facebook });
  if (info?.instagram) socials.push({ label: "Instagram", href: info.instagram, Icon: Instagram });
  if (info?.youtube) socials.push({ label: "YouTube", href: info.youtube, Icon: Youtube });
  if (info?.twitter) socials.push({ label: "Twitter / X", href: info.twitter, Icon: Twitter });

  return (
    <PageShell>
      <PageHeader eyebrow="Correspondence" title={`Contact ${siteTitle}`} description={intro} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: siteTitle,
            url: info?.website ?? "https://tebma-hub.lovable.app",
            email: info?.general_email ?? undefined,
            telephone: info?.phone ?? undefined,
            address: info?.hq_address ?? undefined,
            sameAs: socials.map((s) => s.href),
          }),
        }}
      />
      <section className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-[1.05fr_1fr] gap-12">
        <div className="space-y-10">
          {channels.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-4">
              {channels.map((c) => (
                <div key={c.k} className="border border-border rounded-md p-4 flex gap-3">
                  <c.Icon className="size-4 mt-0.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <div className="min-w-0">
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{c.k}</div>
                    <div className="mt-1 text-sm break-words">
                      {c.href ? (
                        <a href={c.href} className="hover:underline underline-offset-4">{c.v}</a>
                      ) : (
                        c.v
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {offices.length > 0 && (
            <div className="space-y-5">
              <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Offices</h2>
              {offices.map((o) => (
                <div key={o.k} className="border-b border-border pb-4 flex gap-3">
                  <MapPin className="size-4 mt-1 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{o.k}</div>
                    <div className="mt-1 text-base whitespace-pre-line">{o.v}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {socials.length > 0 && (
            <div>
              <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Follow {siteTitle}</h2>
              <ul className="flex flex-wrap gap-2">
                {socials.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={s.label}
                      title={s.label}
                      className="inline-flex size-10 items-center justify-center rounded-sm border border-border text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      <s.Icon className="size-4" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {mapUrl && (
            <div className="overflow-hidden rounded-md border border-border">
              <iframe
                src={mapUrl}
                title={`${siteTitle} location map`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-72 w-full border-0"
              />
            </div>
          )}
        </div>

        <form onSubmit={onSubmit} className="border border-border rounded-md p-6 space-y-4 h-fit lg:sticky lg:top-28">
          <h2 className="text-lg font-medium tracking-tight">Send a message</h2>
          <p className="text-sm text-muted-foreground">We usually respond within two business days.</p>
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
