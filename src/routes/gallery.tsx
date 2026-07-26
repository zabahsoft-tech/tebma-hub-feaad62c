import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PageShell, PageHeader } from "@/components/site/PageShell";
import { listGallery } from "@/lib/public.functions";

const qo = queryOptions({ queryKey: ["gallery"], queryFn: () => listGallery() });

export const Route = createFileRoute("/gallery")({
  loader: ({ context }) => context.queryClient.ensureQueryData(qo),
  head: () => ({
    meta: [
      { title: "Gallery — World TEBMA Federation" },
      { name: "description", content: "Photographs from World TEBMA Federation events, championships, seminars, and member schools." },
      { property: "og:title", content: "Gallery — World TEBMA Federation" },
      { property: "og:description", content: "Photographs from federation events and seminars." },
      { property: "og:url", content: "/gallery" },
    ],
    links: [{ rel: "canonical", href: "/gallery" }],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  const { data } = useSuspenseQuery(qo);
  const [lightbox, setLightbox] = useState<string | null>(null);
  return (
    <PageShell>
      <PageHeader eyebrow="Archives" title="Gallery" description="Photographs from championships, seminars, and member schools." />
      <section className="max-w-7xl mx-auto px-6 py-16">
        {data.photos.length === 0 ? (
          <p className="text-muted-foreground">No photos published yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {data.photos.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setLightbox(p.url)}
                className="group relative aspect-square bg-muted rounded-md overflow-hidden ring-1 ring-black/5"
              >
                <img src={p.url} alt={p.caption ?? ""} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </button>
            ))}
          </div>
        )}
      </section>
      {lightbox ? (
        <div
          className="fixed inset-0 z-50 bg-black/90 grid place-items-center p-6"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt="" className="max-w-full max-h-full object-contain" />
        </div>
      ) : null}
    </PageShell>
  );
}
