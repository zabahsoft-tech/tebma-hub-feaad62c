import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { PageShell, PageHeader } from "@/components/site/PageShell";
import { listPublishedNews } from "@/lib/public.functions";

const qo = queryOptions({ queryKey: ["news", "all"], queryFn: () => listPublishedNews({ data: { limit: 100 } }) });

export const Route = createFileRoute("/news")({
  loader: ({ context }) => context.queryClient.ensureQueryData(qo),
  head: () => ({
    meta: [
      { title: "News & Bulletins — World TEBMA Federation" },
      { name: "description", content: "Official announcements, technical updates, and championship dispatches from the World TEBMA Martial Arts Federation." },
      { property: "og:title", content: "News & Bulletins — World TEBMA Federation" },
      { property: "og:description", content: "Official announcements and dispatches from the World TEBMA Federation." },
      { property: "og:url", content: "/news" },
    ],
    links: [{ rel: "canonical", href: "/news" }],
  }),
  component: NewsIndex,
});

function NewsIndex() {
  const { data } = useSuspenseQuery(qo);
  return (
    <PageShell>
      <PageHeader eyebrow="Newsroom" title="News & Bulletins" description="Official announcements, technical updates, and championship dispatches." />
      <section className="max-w-7xl mx-auto px-6 py-16">
        {data.length === 0 ? (
          <p className="text-muted-foreground">No articles published yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {data.map((n) => (
              <article key={n.id}>
                <Link to="/news/$slug" params={{ slug: n.slug }} className="group block">
                  <div className="w-full aspect-video bg-muted rounded-md mb-5 overflow-hidden ring-1 ring-black/5">
                    {n.cover_url ? (
                      <img src={n.cover_url} alt="" loading="lazy" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-muted to-accent" />
                    )}
                  </div>
                  <time className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                    {n.published_at ? new Date(n.published_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : ""}
                  </time>
                  <h2 className="text-xl font-medium mt-3 mb-3 tracking-tight leading-tight group-hover:text-muted-foreground transition-colors">
                    {n.title}
                  </h2>
                  {n.excerpt ? <p className="text-sm text-muted-foreground leading-relaxed">{n.excerpt}</p> : null}
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
