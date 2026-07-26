import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { PageShell, PageHeader } from "@/components/site/PageShell";
import { getCategoryBySlug } from "@/lib/public.functions";

const SITE = "https://tebma-hub.lovable.app";

const qo = (slug: string) =>
  queryOptions({ queryKey: ["category", slug], queryFn: () => getCategoryBySlug({ data: { slug } }) });

export const Route = createFileRoute("/c/$slug")({
  loader: async ({ context, params }) => {
    const row = await context.queryClient.ensureQueryData(qo(params.slug));
    if (!row) throw notFound();
    return row;
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Category not found — World TEBMA Federation" }, { name: "robots", content: "noindex" }] };
    }
    const url = `${SITE}/c/${params.slug}`;
    const title = `${loaderData.name} — World TEBMA Federation`;
    const desc = `Browse ${loaderData.pages.length} page${loaderData.pages.length === 1 ? "" : "s"} in ${loaderData.name}, published by the World TEBMA Martial Arts Federation.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { name: "robots", content: "index,follow" },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: CategoryIndex,
});

function CategoryIndex() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(qo(slug));
  if (!data) return null;

  return (
    <PageShell>
      <PageHeader eyebrow="Category" title={data.name} description={`Pages published under ${data.name}.`} />
      <section className="max-w-7xl mx-auto px-6 py-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.pages.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pages published in this category yet.</p>
        ) : (
          data.pages.map((p) => (
            <Link
              key={p.id}
              to="/p/$slug"
              params={{ slug: p.slug }}
              className="group border border-border rounded-md overflow-hidden hover:border-foreground/40 transition-colors"
            >
              {p.cover_url ? (
                <img src={p.cover_url} alt={p.title} className="w-full aspect-[16/10] object-cover" loading="lazy" decoding="async" />
              ) : null}
              <div className="p-6">
                <h2 className="text-xl font-medium tracking-tight">{p.title}</h2>
                {p.excerpt ? <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{p.excerpt}</p> : null}
                <span className="mt-5 inline-block text-xs font-medium uppercase tracking-widest border-b border-foreground pb-0.5">
                  Read {p.title}
                </span>
              </div>
            </Link>
          ))
        )}
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: data.name,
            url: `${SITE}/c/${slug}`,
            hasPart: data.pages.map((p) => ({ "@type": "Article", headline: p.title, url: `${SITE}/p/${p.slug}` })),
          }),
        }}
      />
    </PageShell>
  );
}
