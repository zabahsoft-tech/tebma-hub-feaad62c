import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { PageShell, PageHeader } from "@/components/site/PageShell";
import { listRules } from "@/lib/public.functions";

const qo = queryOptions({ queryKey: ["rules"], queryFn: () => listRules() });

export const Route = createFileRoute("/rules")({
  loader: ({ context }) => context.queryClient.ensureQueryData(qo),
  head: () => ({
    meta: [
      { title: "Rules & Bylaws — World TEBMA Federation" },
      { name: "description", content: "The official regulatory framework of the World TEBMA Federation: code of conduct, competition rules, grading syllabus, and anti-doping policy." },
      { property: "og:title", content: "Rules & Bylaws — World TEBMA Federation" },
      { property: "og:description", content: "Official regulatory framework of the World TEBMA Federation." },
      { property: "og:url", content: "/rules" },
    ],
    links: [{ rel: "canonical", href: "/rules" }],
  }),
  component: RulesPage,
});

function RulesPage() {
  const { data } = useSuspenseQuery(qo);
  return (
    <PageShell>
      <PageHeader eyebrow="Regulatory" title="Rules & Bylaws" description="The official regulatory framework of the World TEBMA Federation." />
      <section className="max-w-3xl mx-auto px-6 py-16">
        <nav className="mb-12 border border-border rounded-md p-6">
          <span className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">Contents</span>
          <ul className="space-y-2">
            {data.map((r) => (
              <li key={r.id}>
                <a href={`#${r.slug}`} className="text-sm text-muted-foreground hover:text-foreground">{r.title}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="space-y-12">
          {data.map((r) => (
            <section key={r.id} id={r.slug} className="scroll-mt-24">
              <h2 className="text-2xl font-medium tracking-tight mb-4">{r.title}</h2>
              <div className="prose prose-neutral max-w-none text-[15px] leading-relaxed" dangerouslySetInnerHTML={{ __html: r.body }} />
            </section>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
