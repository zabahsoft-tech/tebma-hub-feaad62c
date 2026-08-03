# Deploying to cPanel (shared hosting)

The site is now a pure client-side SPA — no Node.js runtime is required on the server.

## 1. Build

```bash
bun install
bun run build:spa
```

The static output is written to **`dist/client`** (assets, prerendered route shells,
`index.html`, and `.htaccess`).

## 2. Upload

1. Zip the **contents** of `dist/client` (not the folder itself).
2. In cPanel → File Manager, open `public_html` (or your subdomain's document root).
3. Upload the zip and extract it there.
4. Confirm `.htaccess` is present (enable "Show hidden files" in File Manager settings).

## 3. Verify

- Open the domain — the site should load.
- Refresh on a deep link such as `/news` — the `.htaccess` rewrite serves `index.html`,
  so client-side routing keeps working.
- Sign in at `/auth` and confirm the admin dashboard loads.

## Notes

- All data, authentication, and file uploads go straight from the browser to the backend,
  so nothing else needs configuring on cPanel.
- `sitemap.xml` is a static file in `public/`. Add new top-level pages there when you
  create them.
- Rendering is client-side, so social/crawler previews use the metadata in the HTML shell.
