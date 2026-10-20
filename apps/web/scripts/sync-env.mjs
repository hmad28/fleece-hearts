import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

// Neon CLI owns the root env file; Next.js workers read apps/web/.env.local.
const rootPath = resolve(import.meta.dirname, "../../../.env.local");
const webPath = resolve(import.meta.dirname, "../.env.local");
let root;
try { root = await readFile(rootPath, "utf8"); } catch { process.exit(0); }
let existing = "";
try { existing = await readFile(webPath, "utf8"); } catch { /* no web env yet */ }
const rootKeys = new Set(root.split(/\r?\n/).map((line) => line.match(/^([A-Za-z_][\w]*)=/)?.[1]).filter(Boolean));
const preserved = existing.split(/\r?\n/).filter((line) => {
  const key = line.match(/^([A-Za-z_][\w]*)=/)?.[1];
  return !key || !rootKeys.has(key);
});
await writeFile(webPath, `${preserved.join("\n").trim()}\n${root.trim()}\n`.trimStart());
console.log("Synced root .env.local to apps/web/.env.local");
