# Photo Dictionary: multiple images + video

Turn each dictionary entry from "one photo" into a small media set: a gallery of photos, uploaded video clips, and embedded YouTube/Vimeo videos — all managed from the admin entry form and shown on the public entry page.

## Admin experience (`/admin/dictionary/new` and `/admin/dictionary/:id`)

A new "Media" block below the main image:

- **Photos**: upload several images at once, each with an optional caption, drag-free reordering via up/down buttons, and remove. The first photo stays the entry's cover (used for cards and social previews).
- **Videos**: two ways to add one
  - Paste a YouTube or Vimeo link — validated and stored as an embed.
  - Upload an MPF/MP4/WebM file (up to 100MB) straight to storage.
  - Each video gets an optional caption and an optional poster image.
- Items are saved together with the entry when you press Save.

## Public entry page (`/dictionary/:slug`)

- Lead image, then a responsive photo grid with captions; clicking opens a lightbox with keyboard arrows and Esc.
- Video section: embedded YouTube/Vimeo players (lazy-loaded, privacy-friendly `youtube-nocookie`) and native `<video>` players with poster for uploaded clips.
- SEO: existing meta stays; add `ImageObject` entries and, when a video exists, `VideoObject` JSON-LD so techniques can surface in image/video search. Gallery images get descriptive alt text from their captions.
- The dictionary index card keeps using the cover image; entries with video get a small "video" badge.

## Technical notes

**Database** (one migration)
- New table `public.dictionary_media`: `id`, `entry_id` (FK → `dictionary_entries`, cascade delete), `kind` (`image` | `video` | `embed`), `url`, `poster_url`, `caption`, `sort_order`, `created_at`.
- GRANTs: `SELECT` to `anon` and `authenticated`, full CRUD to `authenticated`, `ALL` to `service_role`; RLS with public read + admin write (`has_role(auth.uid(),'admin')`), matching `gallery_photos`.
- Existing `dictionary_entries.image_url` is kept as the cover; no data migration needed.

**Uploads**
- Current path (`adminUploadMedia`) base64-encodes files through a server function — fine for images, not for 100MB video. Add `adminCreateMediaUploadUrl` (admin-checked) that returns a Supabase signed upload URL for a `dictionary/…` key; the browser PUTs the file directly. Images keep the existing flow.
- Allow `video/mp4`, `video/webm`, `video/quicktime` on the video path only.
- `/api/public/media/*` currently downloads the whole object into memory. For video keys it will instead 302-redirect to a short-lived signed URL so seeking/range requests work in the player.

**Server functions**
- `getDictionaryBySlug` and `listDictionary` return the media rows (ordered by `sort_order`).
- `adminGetDictionary` returns media; `adminUpsertDictionary` accepts a `media` array and replaces the entry's rows in one call.

**New components**
- `src/components/admin/MediaManager.tsx` — the admin list editor (add photo, add video file, add embed, caption, reorder, delete) writing a hidden JSON field.
- `src/components/site/MediaGallery.tsx` — public grid + lightbox + video players.

## Not included

Audio clips (you didn't select them) and bulk media reuse across entries.
