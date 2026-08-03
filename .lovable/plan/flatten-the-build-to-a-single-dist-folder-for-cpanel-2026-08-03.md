# Flatten the build to a single `dist/` folder for cPanel

Goal: `bun run build:spa` produces one folder — `dist/` — with `index.html` at its root, ready to upload straight into `public_html`. No `client/` or `server/` subfolders.

## What changes

1. **Post-build flatten step** (`scripts/make-spa-shell.mjs`)
   - Keep the existing `_shell.html` → `index.html` copy.
   - Then move everything from `dist/client/` up into `dist/`.
   - Delete the leftover `dist/client`, `dist/server`, and any nitro/worker output — nothing server-side is used on cPanel.
   - Verify `dist/index.html` and `dist/.htaccess` exist and fail the build loudly if not.

2. **Deployment doc** (`DEPLOY-CPANEL.md`)
   - Update paths from `dist/client` to `dist`.

## About "use edge functions" and dynamic behaviour

The site is already fully dynamic without any server: every page (news, gallery, rules, styles, dictionary, pages, contact/membership forms, certificate verification, and the whole admin CMS) reads and writes the cloud database directly from the browser, protected by row-level security. Certificate lookup runs as a secured database function.

Adding backend functions would put a server back in the picture, which is exactly what shared cPanel hosting can't run — and it isn't needed, since nothing in the site currently depends on server-side code. So this plan keeps the serverless setup and only fixes the build output shape.

If you specifically want some logic moved server-side later (for example hiding certificate data behind an API), that can be added as a cloud-hosted function that the static site calls over HTTPS — say the word and I'll plan that separately.

## Verification

- Run the build, list `dist/` and confirm: `index.html`, `.htaccess`, `assets/`, `robots.txt`, `sitemap.xml`, no `client/` or `server/`.
- Serve `dist/` locally and load the home page, `/news`, and `/verify` to confirm live data still loads.
