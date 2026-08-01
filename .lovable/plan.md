# Individual pages for each Rules section

Today all rules sections render stacked on `/rules` with anchor links. This gives every section its own page with a cover image, excerpt, and rich-text body.

## What changes

- `/rules` becomes an index: a card grid of sections (cover image, title, short excerpt) instead of one long document.
- New `/rules/$slug` page per section: cover image, title, rich-text body, and prev/next links back to the index.
- Admin (New/Edit rules section) gains a cover image upload and an excerpt field, keeping the existing rich editor for the body.
- Each rule page gets its own SEO metadata (title, description, og tags, canonical) and Article JSON-LD, and is added to `/sitemap.xml`.

## Technical notes

- Migration: add `cover_url text` and `excerpt text` to `public.rules_sections` (nullable, no new policies needed).
- `src/lib/public.functions.ts`: extend `listRules` select with the new fields; add `getRuleBySlug`.
- `src/lib/admin.functions.ts`: extend the rules upsert schema/insert with `cover_url` and `excerpt`.
- New route `src/routes/rules.$slug.tsx`; rewrite `src/routes/rules.tsx` as the index grid (keeps the same URL).
- Admin forms `admin.rules.new.tsx` / `admin.rules.$id.tsx`: add `ImageUpload` (folder `rules`) and an excerpt `TextField`.
- Sitemap route: emit one entry per rules slug alongside the existing static `/rules`.
