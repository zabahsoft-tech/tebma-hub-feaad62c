## Goal

Add a CMS-managed **Pages** system grouped by **Categories**. Each category becomes a dropdown in the site navbar listing its published pages. Pages are authored with the rich editor, support image upload, and carry full per-page SEO.

## Database

Two new tables (with RLS + grants, public read / admin write, matching existing tables):

- `page_categories` — `slug`, `name`, `sort_order`, `visible_in_nav`
- `pages` — `slug`, `title`, `category_id`, `excerpt`, `body` (rich HTML), `cover_url`, `seo_title`, `seo_description`, `published`, `published_at`, `sort_order`

Public (anon) can read categories and published pages; admins manage everything.

## Public site

- New route `/p/$slug` — renders a page: cover image, title, rich HTML body via `prose`, breadcrumb back to its category.
- New route `/c/$slug` — category landing listing its published pages (cards with cover + excerpt).
- **Navbar**: fetch categories + their pages once (cached query) and append a dropdown per category after the fixed links (News, Membership, Gallery…). Fixed links stay unchanged. Dropdown built with the existing shadcn `NavigationMenu`/`DropdownMenu`, keyboard accessible, and collapsing into a stacked list on mobile.
- Footer gets a "Sections" column listing categories (small addition, optional to keep).

## SEO

- Per-page `head()`: `seo_title` (falls back to title) `— TEBMA`, `seo_description` (falls back to excerpt), `og:title`, `og:description`, `og:type: article`, `og:image`/`twitter:image` from `cover_url` when it's an absolute URL, self-referencing `canonical` and `og:url`.
- `Article` + `BreadcrumbList` JSON-LD on page detail; `CollectionPage` JSON-LD on category route.
- `sitemap.xml` extended to include all published pages and categories.

## Admin CMS

New sidebar group entries under Content:

- `/admin/categories` — list + `new` / `$id` form pages (name, slug auto-suggest, sort order, show-in-nav toggle).
- `/admin/pages` — list + `new` / `$id` form pages with: title, slug, category select, excerpt, **RichEditor** body, **ImageUpload** cover (picture only, no URL field — same component already used for news/styles), SEO title + SEO description fields, publish toggle (defaults to published), sort order.

All forms are dedicated routes (no modals), following the existing `admin.[resource].tsx` layout + `.index/.new/.$id` structure. Server functions added to `src/lib/public.functions.ts` (public reads) and `src/lib/admin.functions.ts` (admin CRUD).

## Seed

One starter category ("Federation") with one sample published page so the navbar dropdown is visible immediately.

## Files touched

- migration: `page_categories`, `pages`
- `src/lib/public.functions.ts`, `src/lib/admin.functions.ts`
- `src/components/site/SiteHeader.tsx` (+ footer)
- `src/routes/p.$slug.tsx`, `src/routes/c.$slug.tsx`, `src/routes/sitemap[.]xml.ts`
- `src/routes/_authenticated/admin.categories.*`, `admin.pages.*`
- `src/components/admin/AdminShell.tsx` (nav entries)
