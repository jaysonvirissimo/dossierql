/**
 * Records of one type, set side by side (SDD 8.2). These helpers read the
 * response data only. They arrange what the player retrieved and never say
 * which record fits a clue.
 */

export type Path = (string | number)[];

export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/** A list of single values, or of records with nothing nested, reads on one line. */
export function isPlainList(list: readonly unknown[]): boolean {
  return list.every(
    (item) =>
      !isRecord(item) ||
      (Object.keys(item).length <= 1 &&
        Object.values(item).every((v) => v === null || typeof v !== "object")),
  );
}

export function headingOf(
  value: Record<string, unknown>,
  index: number,
): string {
  for (const key of ["name", "codename", "id", "code"]) {
    if (typeof value[key] === "string") return value[key];
  }
  // An entry in a register is known by its serial number.
  if (typeof value.serial === "number") return `Serial ${String(value.serial)}`;
  return `Entry ${String(index + 1)}`;
}

/**
 * A list that holds one record with fields of its own. In a column, its
 * fields take rows of their own, as a nested record's do.
 */
export function loneRecord(value: unknown): Record<string, unknown> | null {
  if (!Array.isArray(value) || value.length !== 1 || isPlainList(value)) {
    return null;
  }
  const [item] = value as unknown[];
  return isRecord(item) ? item : null;
}

/** Whether every value in a record fits in one cell of a column. */
export function columnable(record: Record<string, unknown>): boolean {
  return Object.values(record).every((value) => {
    const lone = loneRecord(value);
    if (lone) return columnable(lone);
    if (Array.isArray(value)) return isPlainList(value);
    if (isRecord(value)) return columnable(value);
    return true;
  });
}

export interface Row {
  /**
   * The path below the record, such as lastKnownLocation/country/name. A
   * list that holds one record adds its index, 0.
   */
  path: (string | number)[];
  depth: number;
  kind: "object" | "list" | "scalar";
}

/**
 * One row for each field any of the records has, in the order the records
 * give them. A field only a later record has goes after the field before it.
 */
export function rowsOf(records: readonly Record<string, unknown>[]): Row[] {
  const rows: Row[] = [];
  const index = (path: (string | number)[]) =>
    rows.findIndex((row) => row.path.join("/") === path.join("/"));
  for (const record of records) {
    let after = -1;
    const walk = (
      value: Record<string, unknown>,
      prefix: (string | number)[],
      depth: number,
    ) => {
      for (const [key, child] of Object.entries(value)) {
        const path = [...prefix, key];
        const found = index(path);
        if (found >= 0) {
          after = found;
        } else {
          rows.splice(after + 1, 0, {
            path,
            depth,
            kind: isRecord(child)
              ? "object"
              : Array.isArray(child)
                ? "list"
                : "scalar",
          });
          after += 1;
        }
        if (isRecord(child)) walk(child, path, depth + 1);
        const lone = loneRecord(child);
        if (lone) walk(lone, [...path, 0], depth + 1);
      }
    };
    walk(record, [], 0);
  }
  return rows;
}

/**
 * What one record holds at a row. `absent` means the record's response has
 * no such field. `under-nothing` means a record above it came back empty.
 */
export type Cell =
  | { kind: "value"; value: unknown }
  | { kind: "absent" }
  | { kind: "under-nothing" };

export function cellAt(
  record: Record<string, unknown>,
  path: readonly (string | number)[],
): Cell {
  let current: unknown = record;
  for (const key of path) {
    if (current === null) return { kind: "under-nothing" };
    if (typeof key === "number") {
      // A list with no record at this place leaves nothing below it.
      if (!Array.isArray(current) || current.length <= key) {
        return { kind: "under-nothing" };
      }
      current = current[key] as unknown;
      continue;
    }
    if (!isRecord(current) || !(key in current)) return { kind: "absent" };
    current = current[key];
  }
  return { kind: "value", value: current };
}

/**
 * Whether sibling values are a group: two or more records of one type that
 * each fit in a column. `types` gives each value's type, in the same order.
 */
export function isGroup(
  values: readonly unknown[],
  types: readonly string[],
): values is Record<string, unknown>[] {
  return (
    values.length >= 2 &&
    values.every((value) => isRecord(value) && columnable(value)) &&
    types.every((type) => type !== "" && type === types[0])
  );
}

/** Whether a response holds any group the findings can set in columns. */
export function hasGroup(
  data: Record<string, unknown>,
  typeOf: (path: Path) => string,
): boolean {
  const entries = Object.entries(data);
  if (
    isGroup(
      entries.map(([, value]) => value),
      entries.map(([key]) => typeOf([key])),
    )
  ) {
    return true;
  }
  const inList = (list: unknown[], path: Path): boolean =>
    (!isPlainList(list) &&
      isGroup(
        list,
        list.map((_, index) => typeOf([...path, index])),
      )) ||
    list.some((item, index) => inValue(item, [...path, index]));
  const inValue = (value: unknown, path: Path): boolean => {
    if (Array.isArray(value)) return inList(value, path);
    if (isRecord(value)) {
      return Object.entries(value).some(([key, child]) =>
        inValue(child, [...path, key]),
      );
    }
    return false;
  };
  return entries.some(([key, value]) => inValue(value, [key]));
}
