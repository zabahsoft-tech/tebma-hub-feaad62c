import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/site/PageShell";
import { getDictionaryBySlug } from "@/lib/public.functions";

const qo = (slug: string) =>
  queryOptions({ queryKey: ["dict", slug], queryFn: () => getDictionaryBySlug({ data: { slug } }) });

export const Route = createFileRoute("/dictionary/$slug")({
  loader: async ({ context, params }) => {
    const row = await context.queryClient.ensureQueryData(qo(params.slug));
    if (!row) throw notFound();
  },
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — TEBMA Photo Dictionary` },
      { name: "description", content: "Technique entry from the World TEBMA Photo Dictionary." },
      { property: "og:url", content: `/dictionary/${params.slug}` },
    ],
    links: [{ rel: "canonical", href: `/dictionary/${params.slug}` }],
  }),
  component: DictDetail,
});

function DictDetail() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(qo(slug));
  if (!data) return null;
  return (
    <PageShell>
      <article className="max-w-3xl mx-auto px-6 py-20">
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
        {data.image_url ? <img src={data.image_url} alt="" className="mt-8 w-full rounded-md ring-1 ring-black/5" /> : null}
        <div className="mt-8 whitespace-pre-wrap text-[15px] leading-relaxed">{data.description}</div>
      </article>
    </PageShell>
  );
}
