// The SPA build emits `dist/client/_shell.html`. Shared hosting (cPanel) expects a
// single folder with `index.html` at its root, so flatten everything into `dist/`.
import { access, copyFile, readdir, rename, rm } from "node:fs/promises";
import { join } from "node:path";

const DIST = join(process.cwd(), "dist");
const CLIENT = join(DIST, "client");

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

if (await exists(join(CLIENT, "_shell.html"))) {
  await copyFile(join(CLIENT, "_shell.html"), join(CLIENT, "index.html"));
}

// Move dist/client/* -> dist/*
if (await exists(CLIENT)) {
  for (const entry of await readdir(CLIENT)) {
    await rm(join(DIST, entry), { recursive: true, force: true });
    await rename(join(CLIENT, entry), join(DIST, entry));
  }
  await rm(CLIENT, { recursive: true, force: true });
}

// Nothing server-side is deployed to cPanel.
for (const dir of ["server", "nitro", ".nitro", "_worker.js"]) {
  await rm(join(DIST, dir), { recursive: true, force: true });
}

for (const required of ["index.html", ".htaccess"]) {
  if (!(await exists(join(DIST, required)))) {
    console.error(`[spa-shell] missing dist/${required} — build output is incomplete`);
    process.exit(1);
  }
}

console.log("[spa-shell] dist/ is ready for upload (index.html at root)");
