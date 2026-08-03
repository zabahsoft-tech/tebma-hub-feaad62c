# Convert the site to a no-SSR SPA for shared cPanel hosting

Goal: produce a build that is nothing but static files (HTML, JS, CSS) which can be uploaded to a cPanel `public_html` folder, with the backend (database, auth, storage) still hosted in the cloud and called directly from the browser.

## What changes for you

- The whole site becomes a browser-rendered app. No server code runs on cPanel.
- The CMS dashboard, login, forms, gallery, dictionary and certificate verification all keep working, because they will talk to the backend directly from the browser.
- Page titles and meta tags are set after the page loads. Google still indexes it; some social-preview scrapers may only see the generic site title.
- Deployment becomes: build the site, download the output folder, upload it into `public_html`.

## Security consequences (must be accepted)

Some data is currently protected by server-only code using the secret service key. Without a server, those paths have to be reopened to the browser:

- Certificate verification: the lookup function must be made callable by anonymous visitors again, returning only the safe display fields (code, holder name, rank, style, country, dates, status).
- Media files: the `media` storage bucket must become public-read, replacing the current server proxy at `/api/public/media/*`. Existing stored URLs get rewritten to public storage URLs.
- Admin write access stays protected by login + role rules enforced in the database.

## Work plan

### 1. Turn off SSR and switch to static output
- Set the app to SPA mode so every route renders in the browser only, and the build emits a static `index.html` shell plus assets.
- Remove the SSR-only pieces: `src/server.ts` error wrapper, the server-entry override in `vite.config.ts`, the request middleware in `src/start.ts`, and the server error-page module.
- Delete server routes: `src/routes/api/public/media.$.tsx` and `src/routes/sitemap[.]xml.ts`.

### 2. Replace all server functions with browser data access
- Rewrite `src/lib/public.functions.ts` (17 functions) as `src/lib/public.data.ts` using the browser client with the publishable key.
- Rewrite `src/lib/admin.functions.ts` (37 functions) as `src/lib/admin.data.ts` using the logged-in browser client; keep the same Zod validation, slug/code uniqueness checks and error messages.
- Rewrite `src/lib/media.functions.ts` / `media-client.ts` to upload directly to storage from the browser.
- Update every route and component that imports these (~45 files) to call the new functions; keep the existing TanStack Query usage so loading states are unchanged.

### 3. Backend adjustments
- Migration: allow anonymous execution of `verify_certificate_by_code` again.
- Make the `media` bucket public and add anon read policy; add an insert/update policy for admins so uploads still work from the browser.
- Confirm anon read grants/policies exist for all public content tables (news, styles, rules, gallery, dictionary, pages, categories, contact info) and anon insert for membership + contact forms.

### 4. SEO in a SPA
- Replace route `head()` metadata with a small client-side head manager that sets title, description, canonical, OG/Twitter tags and JSON-LD after render.
- Generate `public/sitemap.xml` at build time from the database instead of serving it dynamically, and keep `robots.txt`.

### 5. cPanel deployment kit
- Add `public/.htaccess` with a rewrite that sends all unknown paths to `index.html` (required for deep links and refresh), plus gzip and long cache headers for hashed assets.
- Add `DEPLOY-CPANEL.md` with the exact steps: build, take the output folder, upload to `public_html`, keep `.htaccess`.

## Technical notes

- SPA mode via TanStack Start's `ssr: false` / prerender-disabled config so the output is a static shell; no Node or Worker runtime is required at serve time.
- All backend access uses the publishable key already exposed via `VITE_SUPABASE_*`; row-level security remains the enforcement layer.
- The service-role key is no longer usable anywhere in the app, so nothing in the codebase may import `client.server.ts` after this change.
- The Lovable preview and published URL keep working — they will just serve the same SPA.

## Scope note

This is a large refactor (~50 files) and it permanently gives up server-side rendering and service-role protection. Once done, reverting means redoing the same work in the other direction.
