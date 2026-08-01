import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/site/PageShell";
import { getRuleBySlug } from "@/lib/public.functions";
import { ArrowLeft, ArrowRight } from "lucide-react";

const qo = (slug: string) =>
  queryOptions({ queryKey: ["rules", slug], queryFn: () => getRuleBySlug({ data: { slug } }) });

function stripHtml(html: string, len = 155) {
  const text = (html ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > len ? `${text.slice(0, len)}…` : text;
}

export const Route = createFileRoute("/rules/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(qo(params.slug));
    if (!data) throw notFound();
    return data;
  },
  head: ({ params, loaderData }) => {
    const url = `https://tebma-hub.lovable.app/rules/${params.slug}`;
    if (!loaderData) {
      return { meta: [{ title: "Unavailable — World TEBMA Federation" }, { name: "robots", content: "noindex" }] };
    }
    const r = loaderData.rule;
    const desc = r.excerpt || stripHtml(r.body ?? "") || "Official rules of the World TEBMA Federation.";
    const title = `${r.title} — Rules — World TEBMA Federation`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
        ...(r.cover_url && r.cover_url.startsWith("https://")
          ? [
              { property: "og:image", content: r.cover_url },
              { name: "twitter:image", content: r.cover_url },
            ]
          : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: r.title,
            description: desc,
            mainEntityOfPage: url,
            publisher: { "@type": "Organization", name: "World TEBMA Martial Arts Federation" },
          }),
        },
      ],
    };
  },
  component: RuleDetail,
});

function RuleDetail() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(qo(slug));
  if (!data) return null;
  const { rule, prev, next } = data;

  return (
    <PageShell>
      <article className="max-w-3xl mx-auto px-6 py-16">
        <Link to="/rules" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3.5" /> Rules & Bylaws
        </Link>
        <h1 className="mt-6 text-4xl font-medium tracking-tight">{rule.title}</h1>
        {rule.excerpt && <p className="mt-4 text-lg text-muted-foreground leading-relaxed">{rule.excerpt}</p>}
        {rule.cover_url && (
          <img src={rule.cover_url} alt={rule.title} className="mt-10 w-full rounded-md border border-border object-cover" />
        )}
        <div
          className="prose prose-neutral max-w-none mt-10 text-[15px] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: rule.body }}
        />
        <nav className="mt-16 border-t border-border pt-8 flex flex-col sm:flex-row gap-6 justify-between">
          {prev ? (
            <Link to="/rules/$slug" params={{ slug: prev.slug }} className="group max-w-xs">
              <span className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Previous</span>
              <span className="mt-1 inline-flex items-center gap-2 text-sm group-hover:underline">
                <ArrowLeft className="size-3.5" /> {prev.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link to="/rules/$slug" params={{ slug: next.slug }} className="group max-w-xs sm:text-right">
              <span className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Next</span>
              <span className="mt-1 inline-flex items-center gap-2 text-sm group-hover:underline">
                {next.title} <ArrowRight className="size-3.5" />
              </span>
            </Link>
          )}
        </nav>
      </article>
    </PageShell>
  );
}
