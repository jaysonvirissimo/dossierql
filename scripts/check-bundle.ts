// Checks the size of what a first visit downloads against a budget, so a
// size warning never becomes a standing one (SDD 4.3).
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const dist = fileURLToPath(new URL("../dist", import.meta.url));

/** Budgets in kilobytes, gzipped. */
const BUDGET = {
  /** Script and style the first screen needs. */
  initial: 130,
  /** The largest chunk loaded on demand: editor, GraphQL engine, world data. */
  lazyChunk: 260,
} as const;

function gzipKb(path: string): number {
  return gzipSync(readFileSync(path)).length / 1024;
}

const html = readFileSync(join(dist, "index.html"), "utf8");
const initialFiles = [
  ...html.matchAll(/(?:src|href)="\.\/(assets\/[^"]+\.(?:js|css))"/g),
]
  .map((match) => match[1])
  .filter((file): file is string => file !== undefined);
if (initialFiles.length === 0) {
  console.error("check-bundle: index.html names no script or stylesheet.");
  process.exit(1);
}

const initial = initialFiles.reduce(
  (total, file) => total + gzipKb(join(dist, file)),
  0,
);
const lazy = readdirSync(join(dist, "assets"))
  .filter(
    (name) => name.endsWith(".js") && !initialFiles.includes(`assets/${name}`),
  )
  .map((name) => ({ name, kb: gzipKb(join(dist, "assets", name)) }))
  .sort((a, b) => b.kb - a.kb);

const failures: string[] = [];
console.log(
  `initial: ${initial.toFixed(1)} kB gzip (budget ${String(BUDGET.initial)}) from ${initialFiles.join(", ")}`,
);
if (initial > BUDGET.initial)
  failures.push("The initial bundle is over budget.");
for (const chunk of lazy) {
  console.log(
    `on demand: ${chunk.kb.toFixed(1)} kB gzip (budget ${String(BUDGET.lazyChunk)}) ${chunk.name}`,
  );
  if (chunk.kb > BUDGET.lazyChunk) {
    failures.push(`${chunk.name} is over the on-demand budget.`);
  }
}
if (lazy.length === 0) {
  failures.push(
    "Nothing is loaded on demand: the editor and world data are in the initial bundle.",
  );
}
for (const failure of failures) console.error(`check-bundle: ${failure}`);
if (failures.length > 0) process.exit(1);
