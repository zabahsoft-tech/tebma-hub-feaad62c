import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { PageShell, PageHeader } from "@/components/site/PageShell";
import { listDictionary } from "@/lib/public.functions";

const qo = queryOptions({ queryKey: ["dictionary"], queryFn: () => listDictionary() });

export const Route = createFileRoute("/dictionary")({
  loader: ({ context }) => context.queryClient.ensureQueryData(qo),
  head: () => ({
    meta: [
      { title: "Photo Dictionary — World TEBMA Federation" },
      { name: "description", content: "A searchable visual glossary of TEBMA martial arts techniques, stances, strikes, and etiquette." },
      { property: "og:title", content: "Photo Dictionary — World TEBMA Federation" },
      { property: "og:description", content: "A searchable visual glossary of TEBMA techniques." },
      { property: "og:url", content: "/dictionary" },
    ],
    links: [{ rel: "canonical", href: "/dictionary" }],
  }),
  component: DictionaryPage,
});

function DictionaryPage() {
  const { data } = useSuspenseQuery(qo);
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return data;
    return data.filter(
      (d) =>
        d.term.toLowerCase().includes(t) ||
        d.description.toLowerCase().includes(t) ||
        (d.tags ?? []).some((tag) => tag.toLowerCase().includes(t)),
    );
  }, [q, data]);
  return (
    <PageShell>
      <PageHeader eyebrow="Glossary" title="Photo Dictionary" description="A visual glossary of federation-standard techniques, stances, and etiquette." />
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-10 max-w-xl">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search techniques, tags, or terms…"
            className="w-full py-3 px-4 bg-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-foreground/30"
          />
        </div>
        {filtered.length === 0 ? (
          <p className="text-muted-foreground">No entries match your search.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((d) => (
              <Link key={d.id} to="/dictionary/$slug" params={{ slug: d.slug }} className="group border border-border rounded-md overflow-hidden hover:border-foreground/40 transition-colors">
                <div className="aspect-[4/3] bg-muted">
                  {d.image_url ? (
                    <img src={d.image_url} alt="" loading="lazy" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-muted to-accent" />
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-medium tracking-tight">{d.term}</h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{d.description}</p>
                  {d.tags?.length ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {d.tags.slice(0, 3).map((t) => (
                        <span key={t} className="text-[10px] uppercase tracking-widest text-muted-foreground bg-muted px-2 py-0.5 rounded-sm">
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
