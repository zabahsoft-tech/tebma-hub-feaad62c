// The SPA build emits `_shell.html`. Static hosts expect `index.html` at the
// document root, so publish a copy under both names.
import { copyFile } from "node:fs/promises";
import { join } from "node:path";

const OUT_DIR = join(process.cwd(), "dist", "client");

await copyFile(join(OUT_DIR, "_shell.html"), join(OUT_DIR, "index.html"));
console.log("[spa-shell] wrote dist/client/index.html");
