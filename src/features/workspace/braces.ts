/** Open braces minus closing braces, outside strings and comments. */
export function braceBalance(text: string): number {
  let balance = 0;
  let inString = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inString) {
      if (char === "\\") i++;
      else if (char === '"') inString = false;
    } else if (char === '"') {
      inString = true;
    } else if (char === "#") {
      const end = text.indexOf("\n", i);
      i = end < 0 ? text.length : end;
    } else if (char === "{") {
      balance++;
    } else if (char === "}") {
      balance--;
    }
  }
  return balance;
}
