import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PageShell, PageHeader } from "@/components/site/PageShell";
import { listGallery } from "@/lib/public.functions";
import { embedThumbnail } from "@/lib/embed";
import { Film, Play, X } from "lucide-react";


const qo = queryOptions({ queryKey: ["gallery"], queryFn: () => listGallery() });

export const Route = createFileRoute("/gallery")({
  loader: ({ context }) => context.queryClient.ensureQueryData(qo),
  head: () => ({
    meta: [
      { title: "Gallery — World TEBMA Federation" },
      { name: "description", content: "Photographs from World TEBMA Federation events, championships, seminars, and member schools." },
      { property: "og:title", content: "Gallery — World TEBMA Federation" },
      { property: "og:description", content: "Photographs from federation events and seminars." },
      { property: "og:url", content: "https://tebma-hub.lovable.app/gallery" },
    ],
    links: [{ rel: "canonical", href: "https://tebma-hub.lovable.app/gallery" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "World TEBMA Federation Photo Gallery",
          description: "A collection of photographs from federation championships, seminars, and member schools.",
          url: "https://tebma-hub.lovable.app/gallery",
          about: "Traditional martial arts events and training",
        }),
      },
    ],
  }),
  component: GalleryPage,
});

type GalleryItem = {
  id: string;
  kind?: string | null;
  url: string;
  poster_url?: string | null;
  caption?: string | null;
};

function GalleryPage() {
  const { data } = useSuspenseQuery(qo);
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);
  const items = data.photos as GalleryItem[];

  const videoLd = items
    .filter((p) => p.kind === "embed")
    .map((p) => ({
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: p.caption ?? "World TEBMA Federation video",
      description: p.caption ?? "Video from the World TEBMA Federation gallery.",
      thumbnailUrl: p.poster_url || embedThumbnail(p.url) || "https://tebma-hub.lovable.app/og.jpg",
      embedUrl: p.url,
      uploadDate: new Date().toISOString(),
    }));

  return (
    <PageShell>
      <PageHeader eyebrow="Archives" title="Gallery" description="Photographs and videos from championships, seminars, and member schools." />
      <section className="max-w-7xl mx-auto px-6 py-16">
        {videoLd.length > 0 ? (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(videoLd) }} />
        ) : null}
        {items.length === 0 ? (
          <p className="text-muted-foreground">No photos published yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {items.map((p) => {
              const isVideo = p.kind === "embed";
              const thumb = isVideo ? p.poster_url || embedThumbnail(p.url) : p.url;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setLightbox(p)}
                  aria-label={
                    isVideo
                      ? p.caption
                        ? `Play video: ${p.caption}`
                        : "Play video"
                      : p.caption
                        ? `View full-size photo: ${p.caption}`
                        : "View full-size photo"
                  }
                  className="group relative aspect-square bg-muted rounded-md overflow-hidden ring-1 ring-black/5"
                >
                  {thumb ? (
                    <img src={thumb} alt={p.caption ?? ""} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <span className="absolute inset-0 grid place-items-center">
                      <Film className="size-6 text-muted-foreground" />
                    </span>
                  )}
                  {isVideo ? (
                    <>
                      <span className="absolute inset-0 grid place-items-center bg-black/25 group-hover:bg-black/35 transition-colors">
                        <span className="grid place-items-center size-12 rounded-full bg-white/90">
                          <Play className="size-5 text-black translate-x-[1px]" />
                        </span>
                      </span>
                      <span className="absolute top-2 left-2 text-[10px] uppercase tracking-widest bg-black/70 text-white px-1.5 py-0.5 rounded-sm">
                        Video
                      </span>
                    </>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}
      </section>
      {lightbox ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.kind === "embed" ? "Video player" : "Photo viewer"}
          className="fixed inset-0 z-50 bg-black/90 grid place-items-center p-6"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setLightbox(null)}
            className="absolute top-5 right-5 text-white/80 hover:text-white"
          >
            <X className="size-6" />
          </button>
          {lightbox.kind === "embed" ? (
            <div className="w-full max-w-5xl aspect-video" onClick={(e) => e.stopPropagation()}>
              <iframe
                src={lightbox.url}
                title={lightbox.caption ?? "Federation video"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded-md"
              />
            </div>
          ) : (
            <img src={lightbox.url} alt={lightbox.caption ?? ""} className="max-w-full max-h-full object-contain" />
          )}
        </div>
      ) : null}
    </PageShell>
  );
}

