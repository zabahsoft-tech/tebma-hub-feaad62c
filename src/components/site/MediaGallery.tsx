import { useCallback, useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, Play } from "lucide-react";

export type PublicMediaItem = {
  id: string;
  kind: "image" | "video" | "embed";
  url: string;
  poster_url: string | null;
  caption: string | null;
};

export function MediaGallery({ items, term }: { items: PublicMediaItem[]; term: string }) {
  const photos = items.filter((m) => m.kind === "image");
  const videos = items.filter((m) => m.kind !== "image");
  const [open, setOpen] = useState<number | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (d: number) => setOpen((i) => (i === null ? i : (i + d + photos.length) % photos.length)),
    [photos.length],
  );

  useEffect(() => {
    if (open === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, step]);

  if (!items.length) return null;

  return (
    <div className="mt-12 space-y-12">
      {photos.length > 0 && (
        <section>
          <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">Photos</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {photos.map((p, i) => (
              <figure key={p.id} className="space-y-2">
                <button
                  type="button"
                  onClick={() => setOpen(i)}
                  aria-label={`Open photo${p.caption ? `: ${p.caption}` : ` of ${term}`}`}
                  className="block w-full aspect-[4/3] overflow-hidden rounded-sm ring-1 ring-black/5 bg-muted"
                >
                  <img
                    src={p.url}
                    alt={p.caption ? `${term} — ${p.caption}` : term}
                    loading="lazy"
                    className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                  />
                </button>
                {p.caption ? <figcaption className="text-xs text-muted-foreground">{p.caption}</figcaption> : null}
              </figure>
            ))}
          </div>
        </section>
      )}

      {videos.length > 0 && (
        <section>
          <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">Video</h2>
          <div className="space-y-8">
            {videos.map((v) => (
              <figure key={v.id} className="space-y-2">
                <div className="aspect-video w-full overflow-hidden rounded-sm ring-1 ring-black/5 bg-black">
                  {v.kind === "embed" ? (
                    <iframe
                      src={v.url}
                      title={v.caption ? `${term} — ${v.caption}` : `${term} video`}
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  ) : (
                    <video
                      src={v.url}
                      poster={v.poster_url ?? undefined}
                      controls
                      preload="metadata"
                      playsInline
                      className="w-full h-full"
                    />
                  )}
                </div>
                {v.caption ? <figcaption className="text-xs text-muted-foreground">{v.caption}</figcaption> : null}
              </figure>
            ))}
          </div>
        </section>
      )}

      {open !== null && photos[open] ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6"
          onClick={close}
        >
          <button type="button" aria-label="Close" onClick={close} className="absolute top-5 right-5 text-white/80 hover:text-white">
            <X className="size-6" />
          </button>
          {photos.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous photo"
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
                className="absolute left-4 text-white/80 hover:text-white"
              >
                <ChevronLeft className="size-8" />
              </button>
              <button
                type="button"
                aria-label="Next photo"
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
                className="absolute right-4 text-white/80 hover:text-white"
              >
                <ChevronRight className="size-8" />
              </button>
            </>
          )}
          <figure className="max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <img
              src={photos[open].url}
              alt={photos[open].caption ? `${term} — ${photos[open].caption}` : term}
              className="max-h-[80vh] w-auto mx-auto object-contain"
            />
            {photos[open].caption ? (
              <figcaption className="mt-3 text-center text-sm text-white/70">{photos[open].caption}</figcaption>
            ) : null}
          </figure>
        </div>
      ) : null}
    </div>
  );
}

export function VideoBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm">
      <Play className="size-2.5" /> Video
    </span>
  );
}
