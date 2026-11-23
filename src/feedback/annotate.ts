import type { ResultError } from "../engine/mission.ts";
import { isUndocumented } from "../graphql/schema.ts";

/**
 * The records clerk's note beneath an error. A note says where to look and
 * is worded as a suggestion. It never contains the text to type, and it
 * never replaces the original error (SDD 3.9). Notes follow the wording
 * rules of SDD 5.7: each says who does what and repeats what it refers to.
 */
interface Rule {
  test: RegExp;
  note: (
    match: RegExpExecArray,
    error: ResultError,
    aliasAvailable: boolean,
  ) => string;
}

function near(error: ResultError): string {
  return error.line === undefined ? "" : ` near line ${String(error.line)}`;
}

const VALUE_KIND =
  "The value you gave is not of the kind that this argument takes. Text goes in double quotes.";

const RULES: Rule[] = [
  {
    test: /braces(?: after "\w+")? are empty\.$|^Syntax Error: Expected Name, found "?\}"?/,
    note: (_m, e) =>
      `A pair of braces${near(e)} has no field inside it. A line that starts with # is a comment, and a comment does not count as a field. The clerk suggests asking for at least one field inside those braces.`,
  },
  {
    test: /^Syntax Error: Unterminated string/,
    note: (_m, e) =>
      `A quotation mark${near(e)} is opened and never closed. Text needs a quotation mark at both ends.`,
  },
  {
    test: /^Syntax Error: Expected "on"/,
    note: (_m, e) =>
      `A fragment${near(e)} has to say which type of record it is written for. The type goes between the fragment's name and its braces. The glossary entry for a fragment shows how.`,
  },
  {
    test: /^Syntax Error: Unexpected Name/,
    note: (_m, e) =>
      `The clerk does not recognise the word${near(e)} in that position. A request begins with the word query. Anything you define after the query's closing brace also begins with a word the archive knows. The glossary shows how each is written.`,
  },
  {
    test: /^Syntax Error: Unexpected "\}"/,
    note: (_m, e) =>
      `The request has a closing brace${near(e)} with no opening brace to match it. The editor adds a closing brace each time you type an opening brace, so a closing brace you type yourself can be one too many. The clerk suggests deleting the extra closing brace.`,
  },
  {
    test: /^Syntax Error:/,
    note: (_m, e) =>
      `The clerk could not read the request${near(e)}. It may help to count the braces and parentheses, and to check that each one you opened is also closed.`,
  },
  {
    test: /^Cannot query field "fragment" on type/,
    note: () =>
      "A fragment is not a field, so you cannot define one inside the query's braces. You define a fragment after the query's closing brace, and you use the fragment inside the braces.",
  },
  {
    // Only an interface or a union gets this suggestion, so only from
    // clearance 7 does the note speak of a kind of record.
    test: /^Cannot query field "(\w+)" on type "(\w+)"\. Did you mean to use an inline fragment on (.+)\?$/,
    note: (m) => {
      const kinds = [...String(m[3]).matchAll(/"(\w+)"/g)].map((k) =>
        String(k[1]),
      );
      const which =
        kinds.length === 1
          ? `${String(kinds[0])} has it`
          : `${kinds.join(" and ")} have it`;
      return `Not every kind of ${String(m[2])} has "${String(m[1])}". ${which}. To ask for a field that belongs to one kind, put the field inside an inline fragment for that kind. The glossary entry for an inline fragment shows how.`;
    },
  },
  {
    test: /^Fragment cannot be spread here as objects of type "(\w+)" can never be of type "(\w+)"/,
    note: (m) =>
      `The inline fragment for ${String(m[2])} stands inside a field that returns ${String(m[1])} records, and a record of type ${String(m[1])} is never of type ${String(m[2])}. An inline fragment goes inside a field that can return ${String(m[2])} records. The documentation panel lists the kinds of record that each interface stands for.`,
  },
  {
    test: /^Cannot query field "(\w+)" on type "(\w+)"/,
    note: (m) =>
      isUndocumented(String(m[2]))
        ? `The archive keeps no "${String(m[1])}" on ${String(m[2])}. ${String(m[2])} is not in the documentation panel, but the archive can describe ${String(m[2])} itself. The glossary entry for introspection shows how to ask which fields ${String(m[2])} has.`
        : `The archive keeps no "${String(m[1])}" on ${String(m[2])}. The documentation panel lists the fields that ${String(m[2])} does have.`,
  },
  {
    test: /^Field "(\w+)" of type "([^"]+)" must have a selection of subfields/,
    note: (m) =>
      `"${String(m[1])}" returns a record, not a single value. The clerk asks which of that record's fields you want. They go in braces after "${String(m[1])}".`,
  },
  {
    test: /^Field "(\w+)" must not have a selection since type "([^"]+)" has no subfields/,
    note: (m) =>
      `"${String(m[1])}" is a single value with nothing inside it to open. The clerk suggests removing the braces after "${String(m[1])}".`,
  },
  {
    test: /^Fields "(\w+)" conflict because they have differing arguments/,
    note: (m, _e, aliasAvailable) =>
      `You asked for "${String(m[1])}" more than once with different values. Both answers would have the same field name in the response. ${
        aliasAvailable
          ? "The clerk suggests an alias in front of each one. The glossary entry for an alias shows how to write one."
          : `The clerk suggests asking for "${String(m[1])}" once per transmission. Keep one lookup in this query and transmit the other separately.`
      }`,
  },
  {
    test: /^Fields "(\w+)" conflict/,
    note: (m, _e, aliasAvailable) =>
      `Two fields in the request would both come back as "${String(m[1])}", with different contents. ${
        aliasAvailable
          ? "The clerk suggests an alias in front of one of the two."
          : "The clerk suggests asking for the two fields in separate transmissions."
      }`,
  },
  {
    test: /^Unknown argument "(\w+)" on field "([\w.]+)"/,
    note: (m) =>
      `${String(m[2])} does not take "${String(m[1])}". The documentation panel shows the arguments that ${String(m[2])} accepts.`,
  },
  {
    test: /^Field "(\w+)" argument "(\w+)" of type "[^"]+" is required/,
    note: (m) =>
      `The clerk cannot tell which record you want. "${String(m[1])}" needs a value for "${String(m[2])}", in parentheses after "${String(m[1])}".`,
  },
  {
    test: /^Argument "[\w.]*\((\w+):\)" of (?:required )?type "[^"]+" is required/,
    note: (m) =>
      `The clerk cannot tell which record you want. The field needs a value for "${String(m[1])}", in parentheses after the field.`,
  },
  {
    test: /^Variable "\$(\w+)" is not defined/,
    note: (m) =>
      `"$${String(m[1])}" is used but never declared. You declare a variable, with its type, in parentheses after the operation's name. The glossary entry for a variable shows how.`,
  },
  {
    test: /^Variable "\$(\w+)" is never used/,
    note: (m) =>
      `"$${String(m[1])}" is declared, and nothing in the request uses it.`,
  },
  {
    test: /^Variable "\$(\w+)" of required type "[^"]+" was not provided/,
    note: (m) =>
      `The request declares "$${String(m[1])}", and no value came with the request. You type the value in the variables panel, as JSON.`,
  },
  {
    test: /^Variable "\$(\w+)" /,
    note: (m) =>
      `The value you gave for "$${String(m[1])}" is not of the type that the request declares for "$${String(m[1])}".`,
  },
  {
    test: /^Unknown fragment "(\w+)"/,
    note: (m) =>
      `The request spreads "${String(m[1])}", and there is no fragment of that name in the request.`,
  },
  {
    test: /^Fragment "(\w+)" is never used/,
    note: (m) =>
      `"${String(m[1])}" is defined and never spread. To use a fragment, you write three dots and the fragment's name in the place where you want its fields.`,
  },
  {
    test: /^Fragment "(\w+)" cannot be spread here as objects of type "(\w+)" can never be of type "(\w+)"/,
    note: (m) =>
      `The fragment "${String(m[1])}" is written for records of type ${String(m[3])}. The place where the request spreads it holds a record of type ${String(m[2])}.`,
  },
  {
    test: /^Cannot spread fragment "(\w+)" within itself/,
    note: (m) =>
      `The fragment "${String(m[1])}" spreads itself, either directly or through another fragment. The archive refuses this, because the request would never end. A fragment does not follow a chain of records for you. The query has to open each level of the chain that you want, and you can spread "${String(m[1])}" inside each level.`,
  },
  {
    test: /^Unknown type "(\w+)"/,
    note: (m) =>
      `The archive has no type called "${String(m[1])}" at your clearance. The documentation panel lists the types that exist.`,
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
      "The clerk declines to follow a trail this long in one request. The clerk suggests opening fewer records inside one another.",
  },
  {
    test: /^The archive declines to copy out this many records/,
    note: () =>
      "The request would empty several filing cabinets. The clerk will answer if you ask about one record, or open fewer links from each record.",
  },
  {
    test: /^A transmission carries one operation/,
    note: () =>
      "The clerk sends one request at a time. Everything you want can go inside the braces of a single request.",
  },
  {
    test: /^The archive answers queries|operation is not supported by the schema/,
    note: () => "You can read from this archive and do nothing else to it.",
  },
  {
    test: /^The request contains no operation/,
    note: () => "There is nothing on the form to send yet.",
  },
];

const FALLBACK = (error: ResultError) =>
  `The clerk returns the request with the archive's own note${near(error)}, and suggests checking the request against the documentation panel.`;

export function annotate(error: ResultError, aliasAvailable: boolean): string {
  for (const rule of RULES) {
    const match = rule.test.exec(error.message);
    if (match) return rule.note(match, error, aliasAvailable);
  }
  return FALLBACK(error);
}
