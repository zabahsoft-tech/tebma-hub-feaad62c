# Gallery: add YouTube/Vimeo video items

Today the gallery only holds uploaded photos. This adds video items alongside photos, so an admin can either upload an image or paste a YouTube (or Vimeo) link when adding a gallery item.

## What changes for admins

On the Add/Edit gallery item page, a small selector at the top: **Photo** or **Video link**.

- Photo: the existing image upload, unchanged.
- Video link: paste a YouTube or Vimeo URL. The link is converted to a proper embed URL automatically, and an optional thumbnail image can be uploaded (if omitted, YouTube's own thumbnail is used).

Caption and sort order work the same for both.

## What changes for visitors

The gallery grid shows photos and videos together in the same ordered grid. Video tiles show the thumbnail with a play overlay and a small "Video" label. Clicking a video opens the lightbox with an embedded player; clicking a photo behaves as it does now. Keyboard close (Escape) and accessible labels included.

## Database

Add two columns to the gallery photos table:

- `kind` — `image` or `embed`, defaults to `image` so all existing rows stay photos
- `poster_url` — optional thumbnail for video items

## Technical notes

- Migration: `ALTER TABLE public.gallery_photos ADD COLUMN kind ... DEFAULT 'image' NOT NULL, ADD COLUMN poster_url text`. Reuses the existing `dictionary_media_kind` enum or a new check constraint; no new table, existing RLS/grants unchanged.
- `photoSchema` in `src/lib/admin.functions.ts` gains `kind` and `poster_url`; `adminUpsertPhoto` persists them. For embeds the URL is normalised with the existing `toEmbedUrl` helper (currently in `src/components/admin/MediaManager.tsx`) — it will be moved to a shared `src/lib/embed.ts` so both dictionary and gallery use one implementation.
- `listGallery` in `src/lib/public.functions.ts` selects the new columns.
- `src/routes/_authenticated/admin.gallery.new.tsx` and `admin.gallery.$id.tsx` get the type toggle plus the URL/poster fields.
- `src/routes/gallery.tsx` renders video tiles and an iframe lightbox, and its JSON-LD gains `VideoObject` entries for embedded videos (name, thumbnailUrl, embedUrl) so videos are indexable.
