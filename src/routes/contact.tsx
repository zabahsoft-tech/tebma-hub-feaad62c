import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell, PageHeader } from "@/components/site/PageShell";
import { submitContact } from "@/lib/public.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
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
  return (
    <PageShell>
      <PageHeader eyebrow="Correspondence" title="Contact the Federation" description="Reach the federation headquarters for enquiries, media, or member support." />
      <section className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-10">
        <div className="space-y-8">
          {[
            { k: "Headquarters", v: "12 Rue de l'Etuve, Brussels" },
            { k: "Asia office", v: "3-1 Marunouchi, Tokyo" },
            { k: "Americas office", v: "225 Broadway, New York" },
            { k: "General enquiries", v: "office@tebma.org" },
            { k: "Media", v: "media@tebma.org" },
          ].map((r) => (
            <div key={r.k} className="border-b border-border pb-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{r.k}</div>
              <div className="mt-1 text-lg">{r.v}</div>
            </div>
          ))}
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
