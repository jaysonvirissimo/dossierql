import { getIntrospectionQuery } from "graphql";
import { describe, expect, it } from "vitest";
import { transmit } from "./execute.ts";
import { fullSchema, schemaFor } from "./schema.ts";
import { Store, type RawRecord } from "./store.ts";

const records: RawRecord[] = [
  { type: "Country", id: "PT", code: "PT", name: "Portugal", borders: ["ES"] },
  { type: "Country", id: "ES", code: "ES", name: "Spain", borders: ["PT"] },
  { type: "City", id: "lisbon", name: "Lisbon", country: "PT" },
  { type: "City", id: "porto", name: "Porto", country: "PT" },
  {
    type: "Shipment",
    id: "S-1",
    manifest: "Tiles",
    origin: "lisbon",
    destination: "porto",
    transferOrders: [],
  },
  {
    type: "Operative",
    id: "FOX",
    codename: "FOX",
    coverNames: ["a-1"],
    handler: "OWL",
    classified: { handler: 4 },
    knownAssociates: [],
  },
  { type: "Operative", id: "OWL", codename: "OWL", coverNames: [] },
  { type: "CoverName", id: "a-1", name: "M. Renard" },
];
const store = new Store(records, fullSchema());

function run(operation: string, clearance = 1, variables?: object) {
  return transmit(store, {
    operation,
    clearance,
    variables: variables as Record<string, unknown>,
  });
}

describe("transmit", () => {
  it("records facts from the record resolved, not the fields selected", () => {
    const out = run(
      `{ city(name: "Lisbon") { departingShipments { manifest } } }`,
    );
    expect(out.transmitted).toBe(true);
    expect(out.result.errors).toBeUndefined();
    const keys = out.facts.map((f) => f.fact.key);
    expect(keys).toEqual([
      "City:lisbon.departingShipments",
      "Shipment:S-1.manifest",
    ]);
    expect(out.facts[0]?.fact.value).toEqual({
      kind: "list",
      refs: ["Shipment:S-1"],
      complete: true,
    });
    expect(out.facts[1]?.path).toEqual([
      "city",
      "departingShipments",
      0,
      "manifest",
    ]);
  });

  it("an alias changes the path and leaves the fact unchanged", () => {
    const out = run(`{ here: city(name: "Lisbon") { title: name } }`);
    expect(out.facts[0]?.fact.key).toBe("City:lisbon.name");
    expect(out.facts[0]?.path).toEqual(["here", "title"]);
  });

  it("returns invalid requests untransmitted", () => {
    const out = run(`{ city(name: "Lisbon") { population } }`);
    expect(out.transmitted).toBe(false);
    expect(out.result.errors?.[0]?.message).toMatch(/population/);
    expect(run(`{ city(name: "Lisbon") {`).transmitted).toBe(false);
    expect(run(`mutation { x }`).transmitted).toBe(false);
  });

  it("hides fields and types above the clearance, including in introspection", () => {
    expect(run(`{ operative(codename: "FOX") { codename } }`).transmitted).toBe(
      false,
    );
    expect(schemaFor(1).getType("CoverName")).toBeUndefined();
    expect(schemaFor(2).getType("CoverName")).toBeDefined();
    const intro = run(getIntrospectionQuery(), 1);
    const text = JSON.stringify(intro.result.data);
    expect(text).not.toContain("CoverName");
    expect(text).not.toContain("clearance");
    expect(text).not.toContain("inverse");
    expect(text).toContain("departingShipments");
  });

  it("returns a classified field as null with an error beside the rest", () => {
    const query = `{ operative(codename: "FOX") { codename handler { codename } } }`;
    const low = run(query, 3);
    expect(low.transmitted).toBe(true);
    expect(low.result.data).toEqual({
      operative: { codename: "FOX", handler: null },
    });
    expect(low.result.errors?.[0]?.message).toBe(
      "Operative.handler is classified above your clearance.",
    );
    expect(low.result.errors?.[0]?.path).toEqual(["operative", "handler"]);
    expect(low.facts.map((f) => f.fact.key)).toEqual([
      "Operative:FOX.codename",
    ]);
    const high = run(query, 4);
    expect(high.result.errors).toBeUndefined();
    expect(high.facts.map((f) => f.fact.key)).toContain(
      "Operative:FOX.handler",
    );
  });

  it("supports variables, fragments and derived inverse fields", () => {
    const out = run(
      `query Q($n: String!) { coverName(name: $n) { ...A } } fragment A on CoverName { operative { codename } }`,
      2,
      { n: "M. Renard" },
    );
    expect(out.result.data).toEqual({
      coverName: { operative: { codename: "FOX" } },
    });
    const missing = run(
      `query Q($n: String!) { coverName(name: $n) { name } }`,
      2,
    );
    expect(missing.transmitted).toBe(false);
  });

  it("refuses runaway requests", () => {
    const deep =
      "{ countries " + "{ borders ".repeat(13) + "{ name }" + " }".repeat(14);
    expect(run(deep).transmitted).toBe(false);
  });
});
