import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import DOMPurify from "isomorphic-dompurify";
import { PageShell } from "@/components/site/PageShell";
import { getNewsBySlug } from "@/lib/public.functions";

const SITE = "https://tebma-hub.lovable.app";

const qo = (slug: string) =>
  queryOptions({ queryKey: ["news", slug], queryFn: () => getNewsBySlug({ data: { slug } }) });

function absoluteImage(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  if (url.startsWith("/")) return `${SITE}${url}`;
  return null;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export const Route = createFileRoute("/news/$slug")({
  loader: async ({ context, params }) => {
    const row = await context.queryClient.ensureQueryData(qo(params.slug));
    if (!row) throw notFound();
    return row;
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Article not found — World TEBMA Federation" }, { name: "robots", content: "noindex" }] };
    }
    const url = `${SITE}/news/${params.slug}`;
    const bodyText = stripHtml(loaderData.body ?? "");
    const rawDesc =
      loaderData.excerpt && loaderData.excerpt.trim().length >= 50
        ? loaderData.excerpt.trim()
        : bodyText.length >= 60
          ? bodyText
          : `${loaderData.title} — an official dispatch from the World TEBMA Martial Arts Federation.`;
    const desc = rawDesc.length > 160 ? rawDesc.slice(0, 157).trimEnd() + "…" : rawDesc;
    const image = absoluteImage(loaderData.cover_url);
    const published = loaderData.published_at ?? undefined;

    return {
      meta: [
        { title: `${loaderData.title} — World TEBMA Federation` },
        { name: "description", content: desc },
        { name: "keywords", content: `TEBMA, martial arts, federation, ${loaderData.title}` },
        { name: "author", content: "World TEBMA Martial Arts Federation" },
        { name: "robots", content: "index,follow,max-image-preview:large,max-snippet:-1" },
        { property: "og:title", content: loaderData.title },
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
        ...(published
          ? [
              { property: "article:published_time", content: published },
              { property: "article:section", content: "News" },
            ]
          : []),
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: loaderData.title },
        { name: "twitter:description", content: desc },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: Article,
});

function Article() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(qo(slug));
  if (!data) return null;

  const sanitizedBody = DOMPurify.sanitize(data.body ?? "", {
    USE_PROFILES: { html: true },
    ADD_ATTR: ["target", "rel"],
  });
  const image = absoluteImage(data.cover_url);
  const url = `${SITE}/news/${slug}`;
  const published = data.published_at ?? undefined;
  const desc =
    (data.excerpt && data.excerpt.trim()) ||
    stripHtml(data.body ?? "").slice(0, 160) ||
    undefined;

  return (
    <PageShell>
      <article className="max-w-3xl mx-auto px-6 py-20">
        <Link to="/news" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
          ← All news
        </Link>
        {published ? (
          <time
            dateTime={published}
            className="block mt-8 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest"
          >
            {new Date(published).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </time>
        ) : null}
        <h1 className="mt-4 text-4xl md:text-5xl font-medium tracking-tight text-balance">{data.title}</h1>
        {data.excerpt ? <p className="mt-6 text-lg text-muted-foreground text-pretty">{data.excerpt}</p> : null}
        {data.cover_url ? (
          <figure className="mt-10">
            <img
              src={data.cover_url}
              alt={data.title}
              className="w-full rounded-md ring-1 ring-black/5"
              loading="eager"
              decoding="async"
            />
          </figure>
        ) : null}
        <div
          className="mt-10 prose prose-neutral max-w-none text-[15px] leading-relaxed prose-headings:font-medium prose-headings:tracking-tight prose-a:text-foreground prose-a:underline-offset-4 prose-img:rounded-md"
          dangerouslySetInnerHTML={{ __html: sanitizedBody }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "NewsArticle",
              headline: data.title,
              description: desc,
              datePublished: published,
              dateModified: published,
              mainEntityOfPage: { "@type": "WebPage", "@id": url },
              image: image ? [image] : undefined,
              author: {
                "@type": "Organization",
                name: "World TEBMA Martial Arts Federation",
                url: SITE,
              },
              publisher: {
                "@type": "Organization",
                name: "World TEBMA Martial Arts Federation",
                url: SITE,
              },
              inLanguage: "en",
            }),
          }}
        />
      </article>
    </PageShell>
  );
}
