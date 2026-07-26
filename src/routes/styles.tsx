import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { PageShell, PageHeader } from "@/components/site/PageShell";
import { listStyles } from "@/lib/public.functions";

const qo = queryOptions({ queryKey: ["styles", "all"], queryFn: () => listStyles() });

export const Route = createFileRoute("/styles")({
  loader: ({ context }) => context.queryClient.ensureQueryData(qo),
  head: () => ({
    meta: [
      { title: "Disciplines & Styles — World TEBMA Federation" },
      { name: "description", content: "Explore the technical disciplines governed by the World TEBMA Federation, from Koshiki Karatedo to Kenjutsu." },
      { property: "og:title", content: "Disciplines & Styles — World TEBMA Federation" },
      { property: "og:description", content: "Explore the technical disciplines governed by the World TEBMA Federation." },
      { property: "og:url", content: "/styles" },
    ],
    links: [{ rel: "canonical", href: "/styles" }],
  }),
  component: StylesIndex,
});

function StylesIndex() {
  const { data } = useSuspenseQuery(qo);
  return (
    <PageShell>
      <PageHeader eyebrow="Disciplines" title="Styles of the Federation" description="Formal disciplines governed by the World TEBMA Federation, with standardized curricula and rank progression." />
      <section className="max-w-7xl mx-auto px-6 py-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((st) => (
          <Link key={st.id} to="/styles/$slug" params={{ slug: st.slug }} className="group border border-border rounded-md p-8 hover:border-foreground/40 transition-colors">
            <h2 className="text-2xl font-medium tracking-tight">{st.name}</h2>
            {st.tagline ? <p className="mt-2 text-sm text-muted-foreground">{st.tagline}</p> : null}
            <p className="mt-4 text-sm text-muted-foreground line-clamp-4">{st.description}</p>
            <span className="mt-6 inline-block text-xs font-medium uppercase tracking-widest border-b border-foreground pb-0.5">
              View {st.name} details
            </span>
          </Link>
        ))}
      </section>
    </PageShell>
  );
}
