# Deploying to cPanel (shared hosting)

The site is now a pure client-side SPA — no Node.js runtime is required on the server.

## 1. Build

```bash
bun install
bun run build
```

The static output is written to `.output/public` (client assets + `index.html` shell + `.htaccess`).

## 2. Upload

1. Zip the **contents** of `.output/public` (not the folder itself).
2. In cPanel → File Manager, open `public_html` (or your subdomain's document root).
3. Upload the zip and extract it there.
4. Confirm `.htaccess` is present (enable "Show hidden files" in File Manager settings).

## 3. Verify

- Open the domain — the site should load.
- Refresh on a deep link such as `/news` — the `.htaccess` rewrite serves `index.html` so routing works.
- Sign in at `/auth` and confirm the admin dashboard loads.

## Notes

- All data, auth, and file uploads go directly from the browser to the backend, so nothing else needs configuring on cPanel.
- `sitemap.xml` is a static file in `public/`. Add new top-level pages there when you create them.
- Because rendering is client-side, social/crawler previews use the shared metadata in the HTML shell.
