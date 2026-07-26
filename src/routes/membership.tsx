import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell, PageHeader } from "@/components/site/PageShell";
import { submitMembership } from "@/lib/public.functions";
import { toast } from "sonner";

const TIERS = [
  { id: "individual", name: "Individual Practitioner", price: "$60/yr", desc: "Ranked identity, tournament eligibility, digital certificate & dictionary access." },
  { id: "school", name: "Registered School", price: "$450/yr", desc: "Full accreditation, instructor licensing, and hosting rights for regional events." },
  { id: "national", name: "National Body", price: "By invitation", desc: "Continental voting seat, championship hosting rights, and technical committee representation." },
];

export const Route = createFileRoute("/membership")({
  head: () => ({
    meta: [
      { title: "Membership — World TEBMA Federation" },
      { name: "description", content: "Apply for individual, school, or national membership in the World TEBMA Federation. Rank recognition, tournament access, and technical resources." },
      { property: "og:title", content: "Membership — World TEBMA Federation" },
      { property: "og:description", content: "Apply for World TEBMA Federation membership." },
      { property: "og:url", content: "/membership" },
    ],
    links: [{ rel: "canonical", href: "/membership" }],
  }),
  component: MembershipPage,
});

function MembershipPage() {
  const [tier, setTier] = useState(TIERS[0].id);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    try {
      await submitMembership({
        data: {
          full_name: String(fd.get("full_name") ?? ""),
          email: String(fd.get("email") ?? ""),
          country: String(fd.get("country") ?? "") || null,
          tier,
          message: String(fd.get("message") ?? "") || null,
        },
      });
      toast.success("Application received. The federation office will be in touch.");
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setPending(false);
    }
  }

  return (
    <PageShell>
      <PageHeader eyebrow="Enrollment" title="Membership" description="Join the federation as an individual practitioner, a registered school, or a national governing body." />
      <section className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 grid sm:grid-cols-3 gap-4 self-start">
          {TIERS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTier(t.id)}
              className={`text-left border rounded-md p-6 transition-colors ${tier === t.id ? "border-foreground bg-foreground/[0.03]" : "border-border hover:border-foreground/40"}`}
            >
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t.price}</div>
              <div className="mt-2 text-lg font-medium tracking-tight">{t.name}</div>
              <div className="mt-3 text-sm text-muted-foreground">{t.desc}</div>
            </button>
          ))}
        </div>
        <form onSubmit={onSubmit} className="border border-border rounded-md p-6 space-y-4">
          <h2 className="text-lg font-medium tracking-tight">Apply</h2>
          <Field label="Full name" name="full_name" required />
          <Field label="Email" name="email" type="email" required />
          <Field label="Country" name="country" />
          <label className="block text-sm">
            <span className="block text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1.5">Message</span>
            <textarea name="message" rows={4} className="w-full py-2 px-3 bg-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-foreground/30" />
          </label>
          <button disabled={pending} className="w-full bg-foreground text-background py-3 rounded-sm text-sm font-medium disabled:opacity-60">
            {pending ? "Submitting…" : "Submit application"}
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
