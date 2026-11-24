/**
 * Phrases that SDD 5.7 rules out of anything a player reads. The list is
 * short on purpose: every finding fails the build, so each pattern has to be
 * a fault nearly every time it matches. Rewrite the sentence that trips one.
 */

interface Rule {
  pattern: RegExp;
  message: (found: string) => string;
}

const pointsBack = (found: string): string =>
  `"${found}" points back at something without saying what. Say the thing again.`;

const nameAsVerb = (found: string): string =>
  `"${found}" uses "name" as a verb, and most records have a field called name. Write "ask for" a field or "identify" a person.`;

const RULES: Rule[] = [
  {
    pattern:
      /\b(?:the same way|as before|as above|as earlier|the former|the latter)\b/i,
    message: pointsBack,
  },
  { pattern: /\bnaming\b/i, message: nameAsVerb },
  { pattern: /\bnamed\b(?! after\b)/i, message: nameAsVerb },
  // An instruction that opens a sentence: "Name each country".
  {
    pattern:
      /(?:^|[.!?:]\s+)Name\s+(?:the|a|an|each|every|both|all|one|it|them|who|whoever|which|what)\b/,
    message: nameAsVerb,
  },
  {
    pattern: /\b(?:to|you|must|can|cannot|should|will|would)\s+name\b/i,
    message: nameAsVerb,
  },
  {
    pattern:
      /\bnames\s+(?:the|a|an|each|every|no|what|which|who|whoever|nothing)\b/i,
    message: nameAsVerb,
  },
  {
    // "JSON object" and "input object" are the real names of things.
    pattern: /(?<!\bJSON |\binput[ -])\bobjects?\b/i,
    message: (found) =>
      `"${found}": the game calls one item in the archive a record.`,
  },
];

/** Inline code is quoted material, not wording. */
function withoutCode(text: string): string {
  return text.replace(/`[^`\n]+`/g, "…");
}

/** What SDD 5.7 objects to in a passage. Empty when the passage is clean. */
export function styleIssues(text: string): string[] {
  const prose = withoutCode(text).replace(/\s+/g, " ").trim();
  const found: string[] = [];
  for (const { pattern, message } of RULES) {
    const match = pattern.exec(prose);
    if (match) found.push(message(match[0].replace(/^[.!?:]\s+/, "")));
  }
  return found;
}

/** Inline Markdown, which only some fields render (SDD 5.7). */
export const MARKUP = /`[^`\n]+`|\*[^*\n]+\*|\[[^\]\n]+\]\(glossary:[\w-]+\)/;

/** The glossary entries a passage links to. */
export function glossaryLinks(text: string): string[] {
  return [...text.matchAll(/\]\(glossary:([\w-]+)\)/g)].map(
    (match) => match[1] as string,
  );
}
