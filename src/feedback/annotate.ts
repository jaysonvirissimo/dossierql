import type { ResultError } from "../engine/mission.ts";

/**
 * The records clerk's note beneath an error. A note says where to look and
 * is worded as a suggestion. It never contains the text to type, and it
 * never replaces the original error (SDD 3.9).
 */
interface Rule {
  test: RegExp;
  note: (match: RegExpExecArray, error: ResultError) => string;
}

function near(error: ResultError): string {
  return error.line === undefined ? "" : ` near line ${String(error.line)}`;
}

const VALUE_KIND =
  "The value given is not of the kind this argument takes. Text goes in double quotes.";

const RULES: Rule[] = [
  {
    test: /has an empty selection\.$|^Syntax Error: Expected Name, found "?\}"?/,
    note: (_m, e) =>
      `A pair of braces${near(e)} has nothing inside it that the archive can read. A comment is not a field, so the clerk suggests naming at least one.`,
  },
  {
    test: /^Syntax Error: Unterminated string/,
    note: (_m, e) => `A quotation mark${near(e)} was opened and never closed.`,
  },
  {
    test: /^Syntax Error:/,
    note: (_m, e) =>
      `The clerk could not read the request${near(e)}. It may help to count the braces and parentheses and see that each one opened is closed.`,
  },
  {
    test: /^Cannot query field "(\w+)" on type "(\w+)"/,
    note: (m) =>
      `The archive keeps no "${String(m[1])}" on a ${String(m[2])}. The documentation panel lists what a ${String(m[2])} does have.`,
  },
  {
    test: /^Field "(\w+)" of type "([^"]+)" must have a selection of subfields/,
    note: (m) =>
      `"${String(m[1])}" returns a record, not a single value. The clerk asks which of that record's fields you want, in braces after it.`,
  },
  {
    test: /^Field "(\w+)" must not have a selection since type "([^"]+)" has no subfields/,
    note: (m) =>
      `"${String(m[1])}" is a single value with nothing inside it to select. The braces after it can go.`,
  },
  {
    test: /^Fields "(\w+)" conflict because they have differing arguments/,
    note: (m) =>
      `The response cannot hold two entries both called "${String(m[1])}". Each use of the field needs a name of its own in front of it. The glossary has an entry on this.`,
  },
  {
    test: /^Fields "(\w+)" conflict/,
    note: (m) =>
      `Two selections would both come back as "${String(m[1])}" with different contents. The clerk suggests giving one of them another name.`,
  },
  {
    test: /^Unknown argument "(\w+)" on field "([\w.]+)"/,
    note: (m) =>
      `${String(m[2])} does not take "${String(m[1])}". The documentation panel shows the arguments it accepts.`,
  },
  {
    test: /^Field "(\w+)" argument "(\w+)" of type "[^"]+" is required/,
    note: (m) =>
      `The clerk cannot tell which record is wanted. "${String(m[1])}" needs its "${String(m[2])}" given in parentheses.`,
  },
  {
    test: /^Argument "[\w.]*\((\w+):\)" of (?:required )?type "[^"]+" is required/,
    note: (m) =>
      `The clerk cannot tell which record is wanted. The field needs its "${String(m[1])}" given in parentheses.`,
  },
  {
    test: /^Variable "\$(\w+)" is not defined/,
    note: (m) =>
      `"$${String(m[1])}" is used but never declared. A variable is declared, with its type, beside the operation's name.`,
  },
  {
    test: /^Variable "\$(\w+)" is never used/,
    note: (m) =>
      `"$${String(m[1])}" is declared and then not used anywhere in the request.`,
  },
  {
    test: /^Variable "\$(\w+)" of required type "[^"]+" was not provided/,
    note: (m) =>
      `The request declares "$${String(m[1])}" and no value came with it. Values are supplied in the variables panel, as JSON.`,
  },
  {
    test: /^Variable "\$(\w+)" /,
    note: (m) =>
      `The value supplied for "$${String(m[1])}" is not of the type the request declares for it.`,
  },
  {
    test: /^Unknown fragment "(\w+)"/,
    note: (m) =>
      `The request spreads "${String(m[1])}" and no fragment of that name is defined in it.`,
  },
  {
    test: /^Fragment "(\w+)" is never used/,
    note: (m) =>
      `"${String(m[1])}" is defined and never spread. A fragment is used by writing three dots and its name where the fields are wanted.`,
  },
  {
    test: /^Fragment "(\w+)" cannot be spread here as objects of type "(\w+)" can never be of type "(\w+)"/,
    note: (m) =>
      `"${String(m[1])}" is written for a ${String(m[3])}, and this place holds a ${String(m[2])}.`,
  },
  {
    test: /^Unknown type "(\w+)"/,
    note: (m) =>
      `The archive has no type called "${String(m[1])}" at your clearance. The documentation panel lists the types there are.`,
  },
  { test: /^Expected value of type "[^"]+", found /, note: () => VALUE_KIND },
  { test: /cannot represent/, note: () => VALUE_KIND },
  {
    test: /is classified above your clearance\.$/,
    note: () =>
      "This one entry is withheld and comes back empty. Everything else in the response is good. The clerk suggests asking again after a promotion.",
  },
  {
    test: /^This request nests selections more than/,
    note: () =>
      "The clerk declines to follow a trail this long in one request. A shorter chain of records will be fetched.",
  },
  {
    test: /^The archive declines to copy out this many records/,
    note: () =>
      "The request would empty several filing cabinets. Asking about one record, or fewer links from each, will get an answer.",
  },
  {
    test: /^A transmission carries one operation/,
    note: () =>
      "The clerk sends one request at a time. Everything wanted can go inside a single one.",
  },
  {
    test: /^The archive answers queries|operation is not supported by the schema/,
    note: () => "This archive can be read from and nothing more.",
  },
  {
    test: /^The request contains no operation/,
    note: () => "There is nothing on the form to send yet.",
  },
];

const FALLBACK = (error: ResultError) =>
  `The clerk returns the request with the archive's own note${near(error)}, and suggests checking it against the documentation panel.`;

export function annotate(error: ResultError): string {
  for (const rule of RULES) {
    const match = rule.test.exec(error.message);
    if (match) return rule.note(match, error);
  }
  return FALLBACK(error);
}
