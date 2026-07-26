import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/site/PageShell";
import { getStyleBySlug } from "@/lib/public.functions";

const qo = (slug: string) =>
  queryOptions({ queryKey: ["style", slug], queryFn: () => getStyleBySlug({ data: { slug } }) });

export const Route = createFileRoute("/styles/$slug")({
  loader: async ({ context, params }) => {
    const row = await context.queryClient.ensureQueryData(qo(params.slug));
    if (!row) throw notFound();
    return row;
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Discipline not found" }, { name: "robots", content: "noindex" }] };
    const url = `https://tebma-hub.lovable.app/styles/${params.slug}`;
    const desc =
      loaderData.tagline ??
      `Technical overview of ${loaderData.name}, a discipline governed by the World TEBMA Martial Arts Federation.`;
    return {
      meta: [
        { title: `${loaderData.name} — TEBMA Discipline` },
        { name: "description", content: desc.slice(0, 160) },
        { property: "og:title", content: `${loaderData.name} — TEBMA Discipline` },
        { property: "og:description", content: desc.slice(0, 160) },
        { property: "og:url", content: url },
        ...(loaderData.cover_url ? [{ property: "og:image", content: loaderData.cover_url }, { name: "twitter:image", content: loaderData.cover_url }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: StyleDetail,
});

function StyleDetail() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(qo(slug));
  if (!data) return null;
  return (
    <PageShell>
      <article className="max-w-3xl mx-auto px-6 py-20">
        <Link to="/styles" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">← All disciplines</Link>
        <h1 className="mt-8 text-4xl md:text-5xl font-medium tracking-tight text-balance">{data.name}</h1>
        {data.tagline ? <p className="mt-3 text-lg text-muted-foreground">{data.tagline}</p> : null}
        {data.cover_url ? <img src={data.cover_url} alt="" className="mt-10 w-full rounded-md ring-1 ring-black/5" /> : null}
        <div className="mt-10 text-[15px] leading-relaxed whitespace-pre-wrap">{data.description}</div>
      </article>
    </PageShell>
  );
}
