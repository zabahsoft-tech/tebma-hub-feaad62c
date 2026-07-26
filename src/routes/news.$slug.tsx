import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/site/PageShell";
import { getNewsBySlug } from "@/lib/public.functions";

const qo = (slug: string) =>
  queryOptions({ queryKey: ["news", slug], queryFn: () => getNewsBySlug({ data: { slug } }) });

export const Route = createFileRoute("/news/$slug")({
  loader: async ({ context, params }) => {
    const row = await context.queryClient.ensureQueryData(qo(params.slug));
    if (!row) throw notFound();
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Article not found" }, { name: "robots", content: "noindex" }] };
    return {
      meta: [
        { title: `News — ${params.slug}` },
        { name: "description", content: "Federation article" },
        { property: "og:url", content: `/news/${params.slug}` },
        { property: "og:type", content: "article" },
      ],
      links: [{ rel: "canonical", href: `/news/${params.slug}` }],
    };
  },
  component: Article,
});

function Article() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(qo(slug));
  if (!data) return null;
  return (
    <PageShell>
      <article className="max-w-3xl mx-auto px-6 py-20">
        <Link to="/news" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">← All news</Link>
        <time className="block mt-8 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
          {data.published_at ? new Date(data.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : ""}
        </time>
        <h1 className="mt-4 text-4xl md:text-5xl font-medium tracking-tight text-balance">{data.title}</h1>
        {data.excerpt ? <p className="mt-6 text-lg text-muted-foreground text-pretty">{data.excerpt}</p> : null}
        {data.cover_url ? (
          <img src={data.cover_url} alt="" className="mt-10 w-full rounded-md ring-1 ring-black/5" />
        ) : null}
        <div className="mt-10 prose prose-neutral max-w-none whitespace-pre-wrap text-[15px] leading-relaxed">
          {data.body}
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              headline: data.title,
              datePublished: data.published_at,
              description: data.excerpt ?? undefined,
              image: data.cover_url ?? undefined,
            }),
          }}
        />
      </article>
    </PageShell>
  );
}
