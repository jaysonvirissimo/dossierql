import { Kind, parse } from "graphql";
import type { ReactNode } from "react";

/**
 * Introspection results describe the archive, not its records, so they hold
 * no facts and nothing in them can be cited (SDD 3.7). They are shown
 * compactly: one entry for each type, one line for each field, and each type
 * reference as its layers in the order the query asked for them.
 */

const META = new Set(["__schema", "__type", "__typename"]);

/** The response keys of a request's top-level introspection fields. */
export function introspectionRoots(operation: string): Set<string> {
  const roots = new Set<string>();
  try {
    for (const definition of parse(operation).definitions) {
      if (definition.kind !== Kind.OPERATION_DEFINITION) continue;
      for (const selection of definition.selectionSet.selections) {
        if (selection.kind === Kind.FIELD && META.has(selection.name.value)) {
          roots.add(selection.alias?.value ?? selection.name.value);
        }
      }
    }
  } catch {
    // A request that did not parse was never answered.
  }
  return roots;
}

type Value = unknown;

function isObject(value: Value): value is Record<string, Value> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/** A type reference: the record introspection returns for `type` or `ofType`. */
function isTypeReference(value: Value): value is Record<string, Value> {
  return (
    isObject(value) &&
    !("fields" in value) &&
    !("types" in value) &&
    ("kind" in value || "ofType" in value)
  );
}

/** A type reference as its layers: NON_NULL → LIST → NON_NULL → OBJECT Office. */
export function layers(value: Record<string, Value>): string {
  const parts: string[] = [];
  let current: Value = value;
  while (isObject(current)) {
    const kind = typeof current.kind === "string" ? current.kind : "";
    const name = typeof current.name === "string" ? current.name : "";
    parts.push([kind, name].filter(Boolean).join(" ") || "no name");
    current = current.ofType;
  }
  return parts.join(" → ");
}

function scalarText(value: Value): ReactNode {
  if (value === null) return <em>null</em>;
  return String(value);
}

function Entry({ value }: { value: Record<string, Value> }): ReactNode {
  const name = typeof value.name === "string" ? value.name : null;
  const kind = typeof value.kind === "string" ? value.kind : null;
  const description =
    typeof value.description === "string" ? value.description : null;
  const rest = Object.entries(value).filter(
    ([key]) => key !== "name" && key !== "kind" && key !== "description",
  );
  const inline = rest.filter(([, child]) => !Array.isArray(child));
  const lists = rest.filter(([, child]) => Array.isArray(child));
  const titled = "name" in value || kind !== null;
  const nested = inline.filter(
    ([, child]) => isObject(child) && !isTypeReference(child),
  );
  const flat = inline.filter(([key]) => !nested.some(([k]) => k === key));
  return (
    <>
      {(titled || flat.length > 0) && (
        <p className="introspection__line">
          {titled && (name !== null ? <code>{name}</code> : <em>no name</em>)}
          {kind !== null && (
            <span className="introspection__kind"> {kind}</span>
          )}
          {flat.map(([key, child], index) => (
            <span key={key}>
              {titled || index > 0 ? " · " : ""}
              <code>{key}</code>:{" "}
              {isTypeReference(child) ? (
                <code>{layers(child)}</code>
              ) : (
                scalarText(child)
              )}
            </span>
          ))}
        </p>
      )}
      {nested.map(([key, child]) => (
        <div key={key} className="introspection__list">
          <p className="introspection__label">
            <code>{key}</code>
          </p>
          <Nested value={child as Record<string, Value>} />
        </div>
      ))}
      {description !== null && (
        <p className="introspection__description">{description}</p>
      )}
      {lists.map(([key, child]) => (
        <List key={key} label={key} items={child as Value[]} />
      ))}
    </>
  );
}

function Nested({ value }: { value: Record<string, Value> }) {
  return (
    <div className="introspection__nested">
      <Entry value={value} />
    </div>
  );
}

function summaryOf(item: Record<string, Value>): string {
  const parts = [typeof item.name === "string" ? item.name : "no name"];
  if (typeof item.kind === "string") parts.push(item.kind);
  if (Array.isArray(item.fields)) {
    parts.push(
      `${String(item.fields.length)} ${item.fields.length === 1 ? "field" : "fields"}`,
    );
  } else if ("fields" in item && item.fields === null) {
    parts.push("no fields: holds a single value");
  }
  return parts.join(" · ");
}

function List({ label, items }: { label: string; items: Value[] }) {
  // A long list of types reads best folded, one line to a type.
  const folded =
    items.length > 6 &&
    items.every((item) => isObject(item) && "fields" in item);
  return (
    <div className="introspection__list">
      <p className="introspection__label">
        <code>{label}</code>: {items.length}{" "}
        {items.length === 1 ? "entry" : "entries"}
      </p>
      <ul>
        {items.map((item, index) =>
          !isObject(item) ? (
            <li key={index}>{scalarText(item)}</li>
          ) : folded ? (
            <li key={index}>
              <details className="introspection__type">
                <summary>{summaryOf(item)}</summary>
                <Entry value={item} />
              </details>
            </li>
          ) : (
            <li key={index}>
              <Entry value={item} />
            </li>
          ),
        )}
      </ul>
    </div>
  );
}

/** One top-level introspection field of a response. */
export function IntrospectionResult({ value }: { value: Value }) {
  if (isObject(value)) {
    return (
      <div className="introspection">
        <Entry value={value} />
      </div>
    );
  }
  return (
    <div className="introspection">
      <p className="introspection__line">{scalarText(value)}</p>
    </div>
  );
}
