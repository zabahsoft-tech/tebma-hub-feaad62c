import { useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";
import { uploadMediaFile } from "@/lib/media-client";

export function ImageUpload({
  name,
  defaultValue,
  folder = "covers",
  label = "Cover image",
}: {
  name: string;
  defaultValue?: string | null;
  folder?: string;
  label?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string>(defaultValue ?? "");
  const [busy, setBusy] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setBusy(true);
    try {
      const newUrl = await uploadMediaFile(f, folder);
      setUrl(newUrl);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
        {label}
      </label>
      <div className="flex items-start gap-4">
        <div className="relative w-40 h-28 rounded-sm border border-border bg-muted overflow-hidden shrink-0">
          {url ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <img src={url} className="w-full h-full object-cover" />
          ) : (
            <div className="grid place-items-center w-full h-full text-muted-foreground text-xs">
              No image
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="inline-flex items-center gap-2 border border-border bg-background px-3 py-1.5 rounded-sm text-sm hover:bg-muted disabled:opacity-50"
            >
              <Upload className="size-3.5" />
              {busy ? "Uploading…" : url ? "Replace" : "Upload image"}
            </button>
            {url ? (
              <button
                type="button"
                onClick={() => setUrl("")}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
              >
                <X className="size-3" /> Remove
              </button>
            ) : null}
          </div>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="or paste an image URL"
            className="w-full text-sm border border-border rounded-sm px-3 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
          />
          <p className="text-[11px] text-muted-foreground">PNG, JPG, WEBP, AVIF up to 10MB. Used for cards, sharing previews, and OpenGraph.</p>
        </div>
      </div>
      <input type="hidden" name={name} value={url} />
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
    </div>
  );
}
