import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import DOMPurify from "isomorphic-dompurify";
import { PageShell } from "@/components/site/PageShell";
import { getPageBySlug } from "@/lib/public.functions";

const SITE = "https://tebma-hub.lovable.app";

const qo = (slug: string) => queryOptions({ queryKey: ["page", slug], queryFn: () => getPageBySlug({ data: { slug } }) });

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function absoluteImage(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  if (url.startsWith("/")) return `${SITE}${url}`;
  return null;
}

export const Route = createFileRoute("/p/$slug")({
  loader: async ({ context, params }) => {
    const row = await context.queryClient.ensureQueryData(qo(params.slug));
    if (!row) throw notFound();
    return row;
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Page not found — World TEBMA Federation" }, { name: "robots", content: "noindex" }] };
    }
    const url = `${SITE}/p/${params.slug}`;
    const title = loaderData.seo_title?.trim() || `${loaderData.title} — World TEBMA Federation`;
    const bodyText = stripHtml(loaderData.body ?? "");
    const raw =
      loaderData.seo_description?.trim() ||
      loaderData.excerpt?.trim() ||
      (bodyText.length >= 60 ? bodyText : `${loaderData.title} — World TEBMA Martial Arts Federation.`);
    const desc = raw.length > 160 ? raw.slice(0, 157).trimEnd() + "…" : raw;
    const image = absoluteImage(loaderData.cover_url);
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { name: "robots", content: "index,follow,max-image-preview:large,max-snippet:-1" },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { property: "og:site_name", content: "World TEBMA Federation" },
        ...(image
          ? [
              { property: "og:image", content: image },
              { property: "og:image:alt", content: loaderData.title },
              { name: "twitter:image", content: image },
            ]
          : []),
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: PageDetail,
});

function PageDetail() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(qo(slug));
  if (!data) return null;
  const html = DOMPurify.sanitize(data.body ?? "", { USE_PROFILES: { html: true }, ADD_ATTR: ["target", "rel"] });
  const url = `${SITE}/p/${slug}`;

  return (
    <PageShell>
      <article className="max-w-3xl mx-auto px-6 py-20">
        <nav aria-label="Breadcrumb" className="text-xs uppercase tracking-widest text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          {data.category ? (
            <>
              <span className="mx-2">/</span>
              <Link to="/c/$slug" params={{ slug: data.category.slug }} className="hover:text-foreground">
                {data.category.name}
              </Link>
            </>
          ) : null}
        </nav>
        <h1 className="mt-6 text-4xl md:text-5xl font-medium tracking-tight text-balance">{data.title}</h1>
        {data.excerpt ? <p className="mt-6 text-lg text-muted-foreground text-pretty">{data.excerpt}</p> : null}
        {data.cover_url ? (
          <figure className="mt-10">
            <img src={data.cover_url} alt={data.title} className="w-full rounded-md ring-1 ring-black/5" decoding="async" />
          </figure>
        ) : null}
        <div
          className="mt-10 prose prose-neutral max-w-none text-[15px] leading-relaxed prose-headings:font-medium prose-headings:tracking-tight prose-a:text-foreground prose-a:underline-offset-4 prose-img:rounded-md"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Article",
                  headline: data.title,
                  description: data.seo_description ?? data.excerpt ?? undefined,
                  dateModified: data.updated_at,
                  datePublished: data.published_at ?? data.updated_at,
                  mainEntityOfPage: { "@type": "WebPage", "@id": url },
                  image: absoluteImage(data.cover_url) ? [absoluteImage(data.cover_url)] : undefined,
                  author: { "@type": "Organization", name: "World TEBMA Martial Arts Federation", url: SITE },
                  publisher: { "@type": "Organization", name: "World TEBMA Martial Arts Federation", url: SITE },
                  inLanguage: "en",
                },
                {
                  "@type": "BreadcrumbList",
                  itemListElement: [
                    { "@type": "ListItem", position: 1, name: "Home", item: SITE },
                    ...(data.category
                      ? [{ "@type": "ListItem", position: 2, name: data.category.name, item: `${SITE}/c/${data.category.slug}` }]
                      : []),
                    { "@type": "ListItem", position: data.category ? 3 : 2, name: data.title, item: url },
                  ],
                },
              ],
            }),
          }}
        />
      </article>
    </PageShell>
  );
}
