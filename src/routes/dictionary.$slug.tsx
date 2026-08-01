import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/site/PageShell";
import { getDictionaryBySlug } from "@/lib/public.functions";
import { MediaGallery, type PublicMediaItem } from "@/components/site/MediaGallery";


const qo = (slug: string) =>
  queryOptions({ queryKey: ["dict", slug], queryFn: () => getDictionaryBySlug({ data: { slug } }) });

export const Route = createFileRoute("/dictionary/$slug")({
  loader: async ({ context, params }) => {
    const row = await context.queryClient.ensureQueryData(qo(params.slug));
    if (!row) throw notFound();
    return row;
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Entry not found" }, { name: "robots", content: "noindex" }] };
    const url = `https://tebma-hub.lovable.app/dictionary/${params.slug}`;
    const desc =
      loaderData.description && loaderData.description.length >= 50
        ? loaderData.description.slice(0, 160)
        : `${loaderData.term} — a technique entry in the World TEBMA Photo Dictionary of federation-standard martial arts techniques.`;
    return {
      meta: [
        { title: `${loaderData.term} — TEBMA Photo Dictionary` },
        { name: "description", content: desc },
        { property: "og:title", content: `${loaderData.term} — TEBMA Photo Dictionary` },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        ...(loaderData.image_url ? [{ property: "og:image", content: loaderData.image_url }, { name: "twitter:image", content: loaderData.image_url }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: DictDetail,
});

function DictDetail() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(qo(slug));
  if (!data) return null;

  const media = (data.media ?? []) as PublicMediaItem[];
  const site = "https://tebma-hub.lovable.app";
  const abs = (u: string) => (u.startsWith("http") ? u : `${site}${u}`);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: data.term,
    description: data.description?.replace(/<[^>]*>/g, "").slice(0, 300),
    url: `${site}/dictionary/${slug}`,
    inDefinedTermSet: { "@type": "DefinedTermSet", name: "World TEBMA Photo Dictionary", url: `${site}/dictionary` },
    ...(media.length
      ? {
          subjectOf: media.map((m) =>
            m.kind === "image"
              ? { "@type": "ImageObject", contentUrl: abs(m.url), caption: m.caption ?? data.term }
              : {
                  "@type": "VideoObject",
                  name: m.caption ?? `${data.term} — video`,
                  description: m.caption ?? `Demonstration video for ${data.term}.`,
                  thumbnailUrl: abs(m.poster_url || data.image_url || `${site}/og.jpg`),
                  uploadDate: new Date().toISOString(),
                  ...(m.kind === "embed" ? { embedUrl: m.url } : { contentUrl: abs(m.url) }),
                },
          ),
        }
      : {}),
  };

  return (
    <PageShell>
      <article className="max-w-3xl mx-auto px-6 py-20">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <Link to="/dictionary" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">← Dictionary</Link>
        <h1 className="mt-8 text-4xl md:text-5xl font-medium tracking-tight">{data.term}</h1>
        {data.tags?.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {data.tags.map((t) => (
              <span key={t} className="text-[10px] uppercase tracking-widest text-muted-foreground bg-muted px-2 py-0.5 rounded-sm">
                {t}
              </span>
            ))}
          </div>
        ) : null}
        {data.image_url ? (
          <figure className="mt-8">
            <img
              src={data.image_url}
              alt={(data as { image_caption?: string | null }).image_caption ? `${data.term} — ${(data as { image_caption?: string | null }).image_caption}` : data.term}
              className="w-full rounded-md ring-1 ring-black/5"
            />
            {(data as { image_caption?: string | null }).image_caption ? (
              <figcaption className="mt-2 text-xs text-muted-foreground">{(data as { image_caption?: string | null }).image_caption}</figcaption>
            ) : null}
          </figure>
        ) : null}
        <div className="prose prose-neutral max-w-none mt-8 text-[15px] leading-relaxed" dangerouslySetInnerHTML={{ __html: data.description }} />
        <MediaGallery items={media} term={data.term} />
      </article>
    </PageShell>
  );
}

