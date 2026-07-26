
## Overview

A modern editorial marketing site + admin CMS for the World TEBMA Martial Arts Federation. Public site is fast and SEO-optimized. Admins log in to a dedicated dashboard and manage every content type through full-page forms (no modals). Certificate verification supports both QR scan and manual ID lookup.

Design direction: Modern Editorial (off-white / ink, Instrument Sans, restrained accent, generous whitespace).

## Public site — routes

- `/` — Hero, quick certificate verify widget, latest news (3), styles preview, membership CTA, footer
- `/news` — Article grid with search
- `/news/$slug` — Article page (cover, body, metadata) with Article JSON-LD
- `/membership` — Membership tiers + apply form (dedicated page)
- `/gallery` — Photo grid with lightbox (filter by album)
- `/rules` — Rules & bylaws, table of contents, downloadable sections
- `/styles` — Grid of disciplines
- `/styles/$slug` — Discipline detail
- `/verify` — Manual ID input + QR scanner (camera) + result state (valid / invalid / revoked)
- `/verify/$code` — Deep link from QR that auto-verifies
- `/about` — History, leadership, structure
- `/contact` — Contact form + info
- `/dictionary` — Searchable photo dictionary grid
- `/dictionary/$slug` — Technique detail (image, description, tags, related)

Each route gets its own `head()` with unique title, description, og:title, og:description, canonical, og:url. Article / Style / Technique pages emit JSON-LD.

## Admin CMS — routes (under `/_authenticated/admin`)

- `/admin` — Dashboard: counts, recent activity, quick links
- `/admin/news`, `/admin/news/new`, `/admin/news/$id/edit`
- `/admin/gallery`, `/admin/gallery/new`, `/admin/gallery/$id/edit` (upload to storage)
- `/admin/styles` (+ new/edit)
- `/admin/rules` (+ new/edit)
- `/admin/dictionary` (+ new/edit)
- `/admin/certificates`, `/admin/certificates/new`, `/admin/certificates/$id` (view QR)
- `/admin/members` (list membership applications, mark reviewed)
- `/admin/messages` (contact form submissions)

All forms are dedicated pages. Sidebar layout for admin (shadcn `Sidebar`). Every list uses a Table with search + pagination.

## Certificate verification

- Each certificate row has a public unique `code` (e.g. `TBM-2025-8829XK`) and status: `active | revoked | expired`.
- Admin creates a certificate (holder name, rank, style, issue date, expiry). System generates the code and a QR image pointing to `/verify/{code}`.
- Public verify page: manual code entry OR "Scan QR" button (uses `html5-qrcode` in a `<ClientOnly>` wrapper). Result card shows holder, rank, style, issue/expiry, status badge, and a "Not valid" state for unknown / revoked / expired.

## Backend — Lovable Cloud (Supabase)

Tables (all with `GRANT`s and RLS):
- `profiles` (id -> auth.users, display_name, avatar_url) — auto-created via trigger
- `user_roles` (id, user_id, role enum `admin`) + `has_role()` security-definer fn
- `news_articles` (id, slug, title, excerpt, body, cover_url, published, published_at, created_at)
- `styles` (id, slug, name, tagline, description, cover_url, order)
- `rules_sections` (id, slug, title, body, order)
- `gallery_albums` (id, slug, title, description, cover_url)
- `gallery_photos` (id, album_id, url, caption, order)
- `dictionary_entries` (id, slug, term, description, image_url, tags[], style_id)
- `certificates` (id, code unique, holder_name, rank, style_id, issued_on, expires_on, status)
- `membership_applications` (id, name, email, country, tier, message, status, created_at)
- `contact_messages` (id, name, email, subject, message, created_at)

Policies:
- Public `SELECT` (TO anon) on published content only (news where published=true, styles, rules, gallery, dictionary, certificates for verify).
- Admin-only INSERT/UPDATE/DELETE via `has_role(auth.uid(),'admin')`.
- `membership_applications` and `contact_messages`: anon INSERT allowed, admin-only SELECT.

Storage buckets (public): `news-covers`, `gallery`, `styles`, `dictionary`, `certificates` (for QR PNGs).

Auth: Email/password (admin-only accounts — no public signup UI). First admin promoted via SQL seed. `/auth` public route with sign-in form.

## SEO & performance

- Per-route `head()` metadata with unique title/description/og.
- Article, Style, Technique routes emit JSON-LD (Article, Thing, DefinedTerm).
- `robots.txt` allows all; `/sitemap.xml` server route enumerating routes + published dynamic entries.
- Semantic HTML (`<article>`, `<nav>`, `<main>`, `<h1>` per page), alt text on all images, lazy-loading below the fold, responsive `srcset` where practical.
- Data loading via TanStack Query `ensureQueryData` + `useSuspenseQuery`.

## Technical notes (for the developer)

- Stack: TanStack Start + React 19 + Tailwind v4 + shadcn (already scaffolded).
- Note on the user's "No SSR / cPanel" request: the platform is TanStack Start on Cloudflare Workers. Deployment target is Lovable hosting (custom domain supported); this is not deployable to shared cPanel. Confirmed with the user before planning.
- Design tokens: add `--font-sans: 'Instrument Sans'` via `<link>` in `__root.tsx` head; set `--brand-ink`, `--brand-paper`, `--brand-accent` in `src/styles.css` under `:root` and register in `@theme inline`.
- Image placeholders in the chosen prototype (hero, news cards, styles, dictionary) become `imagegen` calls saved under `src/assets/` and imported.
- QR generation: `qrcode` npm package (server function returns data URL, stored in `certificates.qr_url` in `certificates` storage bucket).
- QR scanning: `html5-qrcode`, loaded via `React.lazy` inside `<ClientOnly>` on `/verify`.
- Admin layout uses shadcn `Sidebar` (icon-collapsible) with links to each resource; `SidebarTrigger` in header.
- All admin data mutations go through `createServerFn` with `.middleware([requireSupabaseAuth])`; role checked via `has_role`.
- Public reads use loaders calling public server fns (server publishable client) so SSR works without auth.
- Certificate verify server fn is public: takes `code`, returns sanitized fields only.
- Contact + membership submit server fns are public (anon INSERT policy).

## Build order

1. Enable Lovable Cloud, run migration (all tables, RLS, GRANTs, roles, trigger, seed admin placeholder + a few demo rows so the site isn't empty).
2. Create storage buckets.
3. Add design tokens + Instrument Sans; replace `src/routes/index.tsx` placeholder with the home built from the chosen direction.
4. Public routes + shared header/footer + per-route `head()`.
5. Verify page (manual + QR scan) + `/verify/$code`.
6. `/auth` sign-in page + `_authenticated/route.tsx` gate.
7. Admin sidebar layout + dashboard + CRUD pages for each resource (list + new + edit as dedicated routes).
8. Certificate create flow — auto-generate code + QR PNG, store in bucket.
9. `robots.txt` + `/sitemap.xml` server route.
10. Generate hero + section images and wire them in.
