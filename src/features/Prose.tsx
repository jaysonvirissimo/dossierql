import type { ReactNode } from "react";
import { href } from "../routes/parseRoute.ts";

const INLINE = /(\*[^*\n]+\*|`[^`\n]+`|\[[^\]\n]+\]\(glossary:[\w-]+\))/g;

/**
 * Mission prose with its small inline subset of Markdown: emphasis, code,
 * and links to glossary entries (SDD 5.4).
 */
export function inline(text: string): ReactNode[] {
  return text.split(INLINE).map((part, index) => {
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return <code key={index}>{part.slice(1, -1)}</code>;
    }
    const link = /^\[([^\]]+)\]\(glossary:([\w-]+)\)$/.exec(part);
    if (link) {
      return (
        <a key={index} href={href({ name: "manual", entryId: link[2] ?? "" })}>
          {link[1]}
        </a>
      );
    }
    return part;
  });
}

export function Prose({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const paragraphs = text
    .trim()
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, " "));
  return (
    <div className={className ? `prose ${className}` : "prose"}>
      {paragraphs.map((paragraph, index) => (
        <p key={index}>{inline(paragraph)}</p>
      ))}
    </div>
  );
}
