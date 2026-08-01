import { useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Film, ImagePlus, Link2, Upload, X } from "lucide-react";
import { uploadMediaFile, uploadLargeMediaFile } from "@/lib/media-client";

export type MediaItem = {
  kind: "image" | "video" | "embed";
  url: string;
  poster_url?: string | null;
  caption?: string | null;
};

export function toEmbedUrl(raw: string): string | null {
  const url = raw.trim();
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return null;
}

export function MediaManager({
  name,
  defaultValue = [],
  folder = "dictionary",
}: {
  name: string;
  defaultValue?: MediaItem[];
  folder?: string;
}) {
  const [items, setItems] = useState<MediaItem[]>(defaultValue);
  const [busy, setBusy] = useState(false);
  const [embed, setEmbed] = useState("");
  const photoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const posterRef = useRef<HTMLInputElement>(null);
  const [posterFor, setPosterFor] = useState<number | null>(null);

  function update(i: number, patch: Partial<MediaItem>) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }
  function remove(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }
  function move(i: number, dir: -1 | 1) {
    setItems((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  async function onPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    setBusy(true);
    try {
      for (const f of files) {
        const url = await uploadMediaFile(f, folder);
        setItems((prev) => [...prev, { kind: "image", url, caption: "" }]);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function onVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setBusy(true);
    try {
      const url = await uploadLargeMediaFile(f, folder);
      setItems((prev) => [...prev, { kind: "video", url, caption: "" }]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function onPoster(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    const idx = posterFor;
    setPosterFor(null);
    if (!f || idx === null) return;
    setBusy(true);
    try {
      const url = await uploadMediaFile(f, folder);
      update(idx, { poster_url: url });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  function addEmbed() {
    const url = toEmbedUrl(embed);
    if (!url) {
      toast.error("Paste a YouTube or Vimeo link");
      return;
    }
    setItems((prev) => [...prev, { kind: "embed", url, caption: "" }]);
    setEmbed("");
  }

  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
        Media gallery
      </label>

      <div className="space-y-3">
        {items.map((it, i) => (
          <div key={`${it.url}-${i}`} className="flex gap-3 items-start border border-border rounded-sm p-3 bg-background">
            <div className="w-28 h-20 shrink-0 rounded-sm bg-muted overflow-hidden grid place-items-center">
              {it.kind === "image" ? (
                <img src={it.url} alt="" className="w-full h-full object-cover" />
              ) : it.poster_url ? (
                <img src={it.poster_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <Film className="size-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {it.kind === "embed" ? "Embedded video" : it.kind === "video" ? "Video file" : "Photo"}
                </span>
                {i === 0 && it.kind === "image" ? (
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm">
                    First photo
                  </span>
                ) : null}
              </div>
              <input
                type="text"
                value={it.caption ?? ""}
                onChange={(ev) => update(i, { caption: ev.target.value })}
                placeholder="Caption (optional)"
                maxLength={300}
                className="w-full border border-border rounded-sm px-2 py-1.5 text-sm bg-background"
              />
              {it.kind !== "image" ? (
                <button
                  type="button"
                  onClick={() => {
                    setPosterFor(i);
                    posterRef.current?.click();
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
                >
                  {it.poster_url ? "Replace poster image" : "Add poster image"}
                </button>
              ) : null}
              <p className="text-[11px] text-muted-foreground truncate">{it.url}</p>
            </div>
            <div className="flex flex-col gap-1">
              <button type="button" aria-label="Move up" onClick={() => move(i, -1)} className="p-1 text-muted-foreground hover:text-foreground">
                <ArrowUp className="size-4" />
              </button>
              <button type="button" aria-label="Move down" onClick={() => move(i, 1)} className="p-1 text-muted-foreground hover:text-foreground">
                <ArrowDown className="size-4" />
              </button>
              <button type="button" aria-label="Remove" onClick={() => remove(i)} className="p-1 text-muted-foreground hover:text-destructive">
                <X className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => photoRef.current?.click()}
          className="inline-flex items-center gap-2 border border-border bg-background px-3 py-1.5 rounded-sm text-sm hover:bg-muted disabled:opacity-50"
        >
          <ImagePlus className="size-3.5" /> Add photos
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => videoRef.current?.click()}
          className="inline-flex items-center gap-2 border border-border bg-background px-3 py-1.5 rounded-sm text-sm hover:bg-muted disabled:opacity-50"
        >
          <Upload className="size-3.5" /> Upload video
        </button>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={embed}
            onChange={(e) => setEmbed(e.target.value)}
            placeholder="YouTube or Vimeo link"
            className="border border-border rounded-sm px-2 py-1.5 text-sm bg-background w-56"
          />
          <button
            type="button"
            onClick={addEmbed}
            className="inline-flex items-center gap-2 border border-border bg-background px-3 py-1.5 rounded-sm text-sm hover:bg-muted"
          >
            <Link2 className="size-3.5" /> Add
          </button>
        </div>
        {busy ? <span className="text-xs text-muted-foreground">Uploading…</span> : null}
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Photos: PNG, JPG, WEBP, AVIF up to 10MB each. Video files: MP4, WebM or MOV up to 100MB.
      </p>

      <input type="hidden" name={name} value={JSON.stringify(items)} />
      <input ref={photoRef} type="file" accept="image/*" multiple className="hidden" onChange={onPhotos} />
      <input ref={videoRef} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={onVideo} />
      <input ref={posterRef} type="file" accept="image/*" className="hidden" onChange={onPoster} />
    </div>
  );
}
