import { useState } from "react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { TextField } from "@/components/admin/AdminForm";

/** Photo-or-video-link picker shared by the gallery add/edit forms. */
export function GalleryItemFields({
  defaultKind = "image",
  defaultUrl = "",
  defaultPoster = null,
}: {
  defaultKind?: "image" | "embed";
  defaultUrl?: string;
  defaultPoster?: string | null;
}) {
  const [kind, setKind] = useState<"image" | "embed">(defaultKind);

  return (
    <div className="space-y-4">
      <div>
        <span className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Item type</span>
        <div className="inline-flex rounded-sm border border-border overflow-hidden">
          {(["image", "embed"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              aria-pressed={kind === k}
              className={`px-4 py-1.5 text-sm ${kind === k ? "bg-foreground text-background" : "bg-background hover:bg-muted"}`}
            >
              {k === "image" ? "Photo" : "Video link"}
            </button>
          ))}
        </div>
      </div>

      <input type="hidden" name="kind" value={kind} />

      {kind === "image" ? (
        <ImageUpload key="img" name="url" label="Photo" defaultValue={defaultKind === "image" ? defaultUrl : ""} folder="gallery" />
      ) : (
        <>
          <TextField
            key="url"
            label="YouTube or Vimeo link"
            name="url"
            required
            defaultValue={defaultKind === "embed" ? defaultUrl : ""}
            placeholder="https://www.youtube.com/watch?v=..."
          />
          <ImageUpload name="poster_url" label="Thumbnail (optional)" defaultValue={defaultPoster ?? ""} folder="gallery" />
        </>
      )}
    </div>
  );
}
