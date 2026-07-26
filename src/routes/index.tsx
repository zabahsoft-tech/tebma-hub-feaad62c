import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/site/PageShell";
import { listPublishedNews, listStyles } from "@/lib/public.functions";
import { VerifyWidget } from "@/components/site/VerifyWidget";
import heroImg from "@/assets/hero-martial-artist.jpg";

const newsQO = queryOptions({ queryKey: ["news", "home"], queryFn: () => listPublishedNews({ data: { limit: 3 } }) });
const stylesQO = queryOptions({ queryKey: ["styles", "home"], queryFn: () => listStyles() });

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    await Promise.all([context.queryClient.ensureQueryData(newsQO), context.queryClient.ensureQueryData(stylesQO)]);
  },
  head: () => ({
    meta: [
      { title: "World TEBMA Martial Arts Federation — The Global Standard" },
      {
        name: "description",
        content:
          "Global governing body for traditional TEBMA martial arts. Verify certificates, explore disciplines, and follow federation news across 140 nations.",
      },
      { property: "og:title", content: "World TEBMA Martial Arts Federation" },
      {
        property: "og:description",
        content:
          "The Global Standard for Traditional Martial Arts — certification, disciplines, and news from the World TEBMA Federation.",
      },
      { property: "og:url", content: "https://tebma-hub.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://tebma-hub.lovable.app/" }],
  }),
  component: HomePage,
});

function HomePage() {
  const { data: news } = useSuspenseQuery(newsQO);
  const { data: styles } = useSuspenseQuery(stylesQO);

  return (
    <PageShell>
      {/* Hero */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
            <div className="lg:w-7/12">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-6">
                Established 1974 · 140 Member Nations
              </span>
              <h1 className="text-5xl lg:text-7xl font-medium leading-[1.05] tracking-tight mb-8 text-balance">
                The Global Standard for Traditional Martial Arts.
              </h1>
              <p className="text-lg text-muted-foreground max-w-[52ch] text-pretty mb-10">
                Preserving the technical integrity and philosophical foundations of TEBMA disciplines. The federation
                oversees certification, competition, and standards for member schools worldwide.
              </p>
              <VerifyWidget />
            </div>
            <div className="lg:w-5/12">
              <img
                src={heroImg}
                alt="Federation martial artist performing a high kick in traditional white gi"
                width={1000}
                height={1200}
                className="w-full aspect-[4/5] object-cover rounded-md ring-1 ring-black/5"
              />
            </div>
          </div>
        </div>
      </section>

      {/* News */}
      <section className="py-20 md:py-24 bg-muted/40 border-y border-border/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-2">
                Updates
              </span>
              <h2 className="text-3xl font-medium tracking-tight">Latest Dispatch</h2>
            </div>
            <Link to="/news" className="text-sm font-medium border-b border-foreground pb-1">
              View archive
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-10 md:gap-12">
            {news.map((n) => (
              <article key={n.id} className="group">
                <Link to="/news/$slug" params={{ slug: n.slug }} className="block">
                  <div className="w-full aspect-video bg-muted rounded-md mb-6 overflow-hidden ring-1 ring-black/5">
                    {n.cover_url ? (
                      <img src={n.cover_url} alt="" loading="lazy" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-muted to-accent" />
                    )}
                  </div>
                  <time className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                    {n.published_at ? new Date(n.published_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : ""}
                  </time>
                  <h3 className="text-xl font-medium mt-3 mb-4 tracking-tight leading-tight text-balance group-hover:text-muted-foreground transition-colors">
                    {n.title}
                  </h3>
                  {n.excerpt ? <p className="text-sm text-muted-foreground leading-relaxed">{n.excerpt}</p> : null}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Styles */}
      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center text-center mb-16">
            <h2 className="text-3xl font-medium tracking-tight mb-4">Disciplines of TEBMA</h2>
            <p className="text-muted-foreground max-w-[56ch]">
              The federation oversees the technical governance and formal ranking for the primary pillars of traditional combat.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {styles.map((st) => (
              <Link
                key={st.id}
                to="/styles/$slug"
                params={{ slug: st.slug }}
                className="group relative aspect-[4/5] bg-muted rounded-md overflow-hidden ring-1 ring-black/5"
              >
                {st.cover_url ? (
                  <img src={st.cover_url} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-foreground/5 to-foreground/10" />
                )}
                <div className="relative h-full p-6 flex flex-col justify-end">
                  <h3 className="text-lg font-medium tracking-tight">{st.name}</h3>
                  {st.tagline ? <p className="text-xs text-muted-foreground mt-1">{st.tagline}</p> : null}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Membership CTA */}
      <section className="py-20 md:py-24 bg-foreground text-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
            <div className="max-w-xl">
              <h2 className="text-4xl font-medium tracking-tight mb-6">Federation Membership</h2>
              <p className="text-background/70 text-lg leading-relaxed">
                Join a community of dedicated practitioners. Gain rank recognition, tournament eligibility, and access
                to the official technique dictionary.
              </p>
            </div>
            <div className="flex flex-col gap-3 min-w-[280px]">
              <Link
                to="/membership"
                className="w-full text-center bg-background text-foreground py-3 px-6 rounded-sm font-medium text-sm hover:opacity-90 transition-opacity"
              >
                Apply for membership
              </Link>
              <Link
                to="/contact"
                className="w-full text-center bg-transparent border border-background/30 text-background py-3 px-6 rounded-sm font-medium text-sm hover:bg-background/10 transition-colors"
              >
                Register an organization
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
