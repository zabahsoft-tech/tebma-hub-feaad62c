// Emits a static SPA shell (index.html) into dist/client so the build can be
// dropped onto plain static hosting such as cPanel.
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const OUT_DIR = join(process.cwd(), "dist", "client");
const ASSETS_DIR = join(OUT_DIR, "assets");

const files = await readdir(ASSETS_DIR);

const css = files.filter((f) => f.endsWith(".css"));

let entry = null;
for (const file of files.filter((f) => f.endsWith(".js"))) {
  const source = await readFile(join(ASSETS_DIR, file), "utf8");
  if (source.includes("hydrateRoot") || source.includes("createRoot")) {
    entry = file;
    break;
  }
}
if (!entry) throw new Error("Could not locate the client entry chunk in dist/client/assets");

const TITLE = "World TEBMA Martial Arts Federation";
const DESCRIPTION =
  "Global governing body for traditional TEBMA martial arts. Certification, competition, and standards across 140 member nations.";

const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${TITLE}</title>
    <meta name="description" content="${DESCRIPTION}" />
    <meta property="og:site_name" content="World TEBMA Federation" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${TITLE}" />
    <meta property="og:description" content="${DESCRIPTION}" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="icon" href="/favicon.ico" type="image/x-icon" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" />
${css.map((f) => `    <link rel="stylesheet" href="/assets/${f}" />`).join("\n")}
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/assets/${entry}"></script>
  </body>
</html>
`;

await writeFile(join(OUT_DIR, "index.html"), html, "utf8");
console.log(`[spa-shell] wrote dist/client/index.html (entry: ${entry})`);
