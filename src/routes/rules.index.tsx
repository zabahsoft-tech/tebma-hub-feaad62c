import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { PageShell, PageHeader } from "@/components/site/PageShell";
import { listRules } from "@/lib/public.functions";

const qo = queryOptions({ queryKey: ["rules"], queryFn: () => listRules() });

function stripHtml(html: string, len = 160) {
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > len ? `${text.slice(0, len)}…` : text;
}

export const Route = createFileRoute("/rules/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(qo),
  head: () => ({
    meta: [
      { title: "Rules & Bylaws — World TEBMA Federation" },
      { name: "description", content: "The official regulatory framework of the World TEBMA Federation: code of conduct, competition rules, grading syllabus, and anti-doping policy." },
      { property: "og:title", content: "Rules & Bylaws — World TEBMA Federation" },
      { property: "og:description", content: "Official regulatory framework of the World TEBMA Federation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://tebma-hub.lovable.app/rules" },
    ],
    links: [{ rel: "canonical", href: "https://tebma-hub.lovable.app/rules" }],
  }),
  component: RulesPage,
});

function RulesPage() {
  const { data } = useSuspenseQuery(qo);
  return (
    <PageShell>
      <PageHeader eyebrow="Regulatory" title="Rules & Bylaws" description="The official regulatory framework of the World TEBMA Federation." />
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((r) => (
            <Link
              key={r.id}
              to="/rules/$slug"
              params={{ slug: r.slug }}
              className="group border border-border rounded-md overflow-hidden flex flex-col hover:border-foreground/40 transition-colors"
            >
              {r.cover_url ? (
                <div className="aspect-[16/10] overflow-hidden bg-muted">
                  <img
                    src={r.cover_url}
                    alt={r.title}
                    loading="lazy"
                    className="size-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                </div>
              ) : (
                <div className="aspect-[16/10] bg-muted" aria-hidden="true" />
              )}
              <div className="p-6 flex-1 flex flex-col">
                <h2 className="text-lg font-medium tracking-tight">{r.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {r.excerpt || stripHtml(r.body ?? "")}
                </p>
                <span className="mt-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground group-hover:text-foreground">
                  Read section
                </span>
              </div>
            </Link>
          ))}
        </div>
        {data.length === 0 && <p className="text-sm text-muted-foreground">No rules sections published yet.</p>}
      </section>
    </PageShell>
  );
}
