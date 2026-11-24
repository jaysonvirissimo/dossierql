// Fails the build if the site to be published refers to any other origin
// (SDD section 10). Every asset is served from the game's own origin.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const dist = fileURLToPath(new URL("../dist", import.meta.url));

/**
 * Strings in vendored code that look like addresses and are never
 * requested: XML namespace names, and the documentation links that React
 * and GraphQL.js print in error messages.
 */
const INERT = [
  /^https?:\/\/www\.w3\.org\//,
  // GraphQL.js describes its built-in types with these two references.
  /^https:\/\/en\.wikipedia\.org\/wiki\/IEEE_floating_point$/,
  /^https:\/\/commonmark\.org\/$/,
  /^https:\/\/react\.dev\//,
  /^https:\/\/(?:www\.)?graphql\.org\//,
  /^https:\/\/spec\.graphql\.org\//,
  /^https:\/\/github\.com\/graphql\//,
  // button-sounds' default home for its recordings. The game sets the
  // library's path to its own sounds/ folder before any sound loads
  // (src/sound/sound.ts), so this address is never requested.
  /^https:\/\/cdn\.jsdelivr\.net\/npm\/button-sounds@[\d.]+\/assets\/$/,
  // The footer's link to the game's own source, followed only by choice.
  /^https:\/\/github\.com\/jaysonvirissimo\/dossierql$/,
  /^https?:\/\/localhost\b/,
  /^https?:\/\/example\.com\b/,
];

function files(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}

const TEXT = new Set([".html", ".css", ".js", ".svg", ".json", ".txt"]);
const problems: string[] = [];

for (const path of files(dist)) {
  const extension = extname(path);
  if (!TEXT.has(extension)) continue;
  const text = readFileSync(path, "utf8");
  const name = relative(dist, path);
  const urls =
    text.match(
      /(?:https?:)?\/\/[a-z0-9][a-z0-9.-]*\.[a-z]{2,}[^\s"'`)<>\\]*/gi,
    ) ?? [];
  for (const url of urls) {
    // A bare "//" inside script is far more often a comment or a regular
    // expression than a protocol-relative address.
    if (url.startsWith("//") && extension === ".js") continue;
    // Markup and styles may not name another origin at all.
    const strict = extension === ".html" || extension === ".css";
    const namespace = /^https?:\/\/www\.w3\.org\//.test(url);
    if (strict ? !namespace : !INERT.some((pattern) => pattern.test(url))) {
      problems.push(`${name}: ${url}`);
    }
  }
}

if (problems.length > 0) {
  console.error("check-origins: the built site refers to another origin:");
  for (const problem of [...new Set(problems)]) console.error(`  ${problem}`);
  process.exit(1);
}
console.log("check-origins: the built site refers to no other origin.");
