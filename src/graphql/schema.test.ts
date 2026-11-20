import {
  getIntrospectionQuery,
  isObjectType,
  type IntrospectionQuery,
} from "graphql";
import { describe, expect, it } from "vitest";
import { loadContent } from "../../scripts/load-content.ts";
import { buildCatalog } from "../content/catalog.ts";
import { transmit } from "./execute.ts";
import { fieldClearance, schemaFor } from "./schema.ts";
import { MAX_CLEARANCE } from "./sdl.ts";

const catalog = buildCatalog(loadContent().raw);

/** What each promotion adds, as `Type` or `Type.field`. */
const ADDED: Record<number, string[]> = {
  1: [
    "AuthorizationLog",
    "City",
    "Company",
    "Continent",
    "Country",
    "Currency",
    "Inspection",
    "IntakeRecord",
    "Language",
    "Operative",
    "Query",
    "Shipment",
    "TransferOrder",
    "UnloadingReceipt",
  ],
  2: [
    "CoverName",
    "Sighting",
    "City.sightings",
    "Company.director",
    "Company.shipments",
    "Operative.coverNames",
    "Operative.directorships",
    "Operative.sightings",
    "Query.company",
    "Query.coverName",
    "Query.operative",
    "Query.operatives",
  ],
  3: [
    "Organization",
    "Operative.handler",
    "Operative.knownAssociates",
    "Operative.lastKnownLocation",
    "Operative.organization",
    "Query.organization",
  ],
  4: ["Company.auditor", "Operative.audits"],
  5: [],
};

function surface(level: number): { types: string[]; fields: string[] } {
  const schema = schemaFor(level);
  const types = Object.values(schema.getTypeMap())
    .filter((t) => isObjectType(t) && !t.name.startsWith("__"))
    .map((t) => t.name)
    .sort();
  const fields = types.flatMap((name) => {
    const type = schema.getType(name);
    return isObjectType(type)
      ? Object.keys(type.getFields()).map((field) => `${name}.${field}`)
      : [];
  });
  return { types, fields };
}

describe("the schema at each clearance", () => {
  it("adds exactly the intended types and fields at each promotion", () => {
    let known = surface(1);
    expect(known.types).toEqual(ADDED[1]);
    for (let level = 2; level <= MAX_CLEARANCE; level++) {
      const next = surface(level);
      const newTypes = next.types.filter((t) => !known.types.includes(t));
      const newFields = next.fields
        .filter((f) => !known.fields.includes(f))
        .filter((f) => !newTypes.includes(f.split(".")[0] ?? ""));
      expect([...newTypes, ...newFields].sort()).toEqual(
        [...(ADDED[level] ?? [])].sort(),
      );
      // Nothing is ever taken away by a promotion.
      expect(next.fields).toEqual(expect.arrayContaining(known.fields));
      known = next;
    }
  });

  it("shows introspection the same surface as validation", () => {
    for (let level = 1; level <= MAX_CLEARANCE; level++) {
      const sent = transmit(catalog.store, {
        operation: getIntrospectionQuery(),
        clearance: level,
      });
      expect(sent.result.errors).toBeUndefined();
      const data = sent.result.data as unknown as IntrospectionQuery;
      const seen = data.__schema.types
        .filter((t) => t.kind === "OBJECT" && !t.name.startsWith("__"))
        .flatMap((t) =>
          t.kind === "OBJECT" ? t.fields.map((f) => `${t.name}.${f.name}`) : [],
        )
        .sort();
      expect(seen).toEqual(surface(level).fields.sort());
      expect(data.__schema.directives.map((d) => d.name)).not.toContain(
        "clearance",
      );
    }
  });

  it("refuses a query for a field above the clearance, and runs it at the level", () => {
    const query = `{ operative(codename: "NIGHTJAR") { coverNames { name } } }`;
    expect(
      transmit(catalog.store, { operation: query, clearance: 1 }).transmitted,
    ).toBe(false);
    const sent = transmit(catalog.store, { operation: query, clearance: 2 });
    expect(sent.result.data).toEqual({
      operative: {
        coverNames: [{ name: "M. Calloway" }, { name: "E. Vasco" }],
      },
    });
    expect(fieldClearance("Operative", "coverNames")).toBe(2);
    expect(fieldClearance("Operative", "nope")).toBeNull();
  });

  it("returns a classified record's field as null with an error, until promoted", () => {
    const query = `{ operative(codename: "GREY_PETREL") { codename handler { codename } } }`;
    const low = transmit(catalog.store, { operation: query, clearance: 3 });
    expect(low.result.data).toEqual({
      operative: { codename: "GREY_PETREL", handler: null },
    });
    expect(low.result.errors).toHaveLength(1);
    const high = transmit(catalog.store, { operation: query, clearance: 5 });
    expect(high.result.data).toEqual({
      operative: {
        codename: "GREY_PETREL",
        handler: { codename: "GILT_MAGPIE" },
      },
    });
  });

  it("returns a request that passes an argument the schema does not define", () => {
    const sent = transmit(catalog.store, {
      operation: `{ company(name: "Lantern Export") { shipments(manifest: "Lamp glass, 20 cases") { id } } }`,
      clearance: 2,
    });
    expect(sent.transmitted).toBe(false);
  });
});
