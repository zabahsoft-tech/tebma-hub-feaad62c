import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader } from "@/components/site/PageShell";
import dojoImg from "@/assets/dojo-hall.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About the Federation — World TEBMA" },
      { name: "description", content: "History, structure, and leadership of the World TEBMA Martial Arts Federation." },
      { property: "og:title", content: "About the Federation — World TEBMA" },
      { property: "og:description", content: "History, structure, and leadership of the World TEBMA Federation." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <PageShell>
      <PageHeader eyebrow="Institution" title="About the Federation" description="A brief history of the World TEBMA Federation, its structure, and the leadership that stewards it." />
      <section className="max-w-3xl mx-auto px-6 py-16 space-y-12">
        <img src={dojoImg} alt="Traditional dojo hall" loading="lazy" className="w-full rounded-md ring-1 ring-black/5" />
        <div className="space-y-6 text-[15px] leading-relaxed text-muted-foreground">
          <p>
            Founded in 1974, the World TEBMA Federation was formed to preserve the technical integrity and philosophical
            foundations of traditional TEBMA disciplines. Today, the federation operates across 140 member nations,
            certifying schools, licensing instructors, and hosting international competition under a unified rulebook.
          </p>
          <p>
            The federation is governed by a General Assembly of continental representatives, a Technical Committee that
            maintains the grading syllabus, and an Ethics Committee that upholds the code of conduct.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          {[
            { k: "Founded", v: "1974" },
            { k: "Member nations", v: "140" },
            { k: "Registered practitioners", v: "4.1M" },
            { k: "Continental federations", v: "5" },
          ].map((s) => (
            <div key={s.k} className="border border-border p-6 rounded-md">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{s.k}</span>
              <div className="mt-2 text-3xl font-medium tracking-tight">{s.v}</div>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
