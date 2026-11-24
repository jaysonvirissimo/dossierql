import { parse } from "graphql";
import { describe, expect, it } from "vitest";
import { loadContent } from "../../scripts/load-content.ts";
import { buildCatalog } from "../content/catalog.ts";
import { transmit } from "./execute.ts";
import { schemaFor } from "./schema.ts";
import { requestWeight } from "./weight.ts";

const { store } = buildCatalog(loadContent().raw);
const weigh = (query: string) =>
  requestWeight(schemaFor(6), store, parse(query));

describe("request weight", () => {
  it("counts a single record once and its values not at all", () => {
    expect(weigh(`{ shipment(id: "LIS-0417") { id manifest } }`)).toBe(1);
    expect(
      weigh(
        `{ shipment(id: "LIS-0417") { origin { name } destination { name } } }`,
      ),
    ).toBe(3);
  });

  it("counts a top-level list for every record of its type", () => {
    expect(weigh(`{ cabinet { label } }`)).toBe(store.all("Drawer").length);
  });

  it("counts a nested list for the longest that list is in the archive", () => {
    const most = Math.max(
      ...store.all("Drawer").map((d) => (d.dockets as string[]).length),
    );
    const drawers = store.all("Drawer").length;
    expect(weigh(`{ cabinet { dockets { reference } } }`)).toBe(
      drawers * (1 + most),
    );
  });

  it("counts fragments where they are spread", () => {
    expect(
      weigh(`
        { shipment(id: "LIS-0417") { ...Ends } }
        fragment Ends on Shipment { origin { name } destination { name } }
      `),
    ).toBe(3);
  });

  it("weighs introspection and __typename at nothing", () => {
    expect(weigh(`{ __schema { types { name fields { name } } } }`)).toBe(0);
    expect(weigh(`{ shipment(id: "LIS-0417") { __typename } }`)).toBe(1);
  });

  it("is reported from clearance 6 and not before", () => {
    const operation = `{ shipment(id: "LIS-0417") { origin { name } } }`;
    const before = transmit(store, { operation, clearance: 5 });
    expect(before.result.extensions).toBeUndefined();
    const after = transmit(store, { operation, clearance: 6 });
    expect(after.result.extensions).toEqual({ weight: 2 });
  });

  it("counts a list of an interface, and the records inside its inline fragments", () => {
    const most = Math.max(
      ...store.all("CaseFile").map((c) => (c.documents as string[]).length),
    );
    const at7 = (query: string) =>
      requestWeight(schemaFor(7), store, parse(query));
    expect(
      at7(`{ caseFile(reference: "CF-0417") { documents { reference } } }`),
    ).toBe(1 + most);
    expect(
      at7(
        `{ caseFile(reference: "CF-0417") { documents { ... on Telegram { origin { name } } } } }`,
      ),
    ).toBe(1 + most * 2);
  });
});

describe("request weight through a union", () => {
  it("counts a list of a union, and the records inside its inline fragments", () => {
    const most = Math.max(
      ...store.all("InterceptLog").map((l) => (l.entries as string[]).length),
    );
    const at8 = (query: string) =>
      requestWeight(schemaFor(8), store, parse(query));
    expect(
      at8(`{ interceptLog(reference: "IL-0112") { entries { __typename } } }`),
    ).toBe(1 + most);
    expect(
      at8(
        `{ interceptLog(reference: "IL-0112") { entries { ... on Vessel { owner { name } } } } }`,
      ),
    ).toBe(1 + most * 2);
  });
});

describe("request weight with pages", () => {
  const at9 = (query: string, variables: Record<string, unknown> = {}) =>
    requestWeight(schemaFor(9), store, parse(query), variables);
  const book = (args: string, inner = "nodes { note }") =>
    `query B($n: Int, $after: String) { watchBook(reference: "WB-0112") { entries${args} { ${inner} pageInfo { hasNextPage endCursor } } } }`;
  const length = (store.get("WatchBook", "WB-0112")?.entries as string[])
    .length;

  it("counts a page for its page size, and the page itself for nothing", () => {
    expect(at9(book("(first: 10)"))).toBe(1 + 10);
    expect(at9(book("(first: 10)", "nodes { officer { name } }"))).toBe(
      1 + 10 * 2,
    );
  });

  it("counts a page with no page size for the whole list", () => {
    expect(at9(book(""))).toBe(1 + length);
  });

  it("reads a page size given as a variable", () => {
    expect(at9(book("(first: $n)"), { n: 5 })).toBe(1 + 5);
    expect(at9(book("(first: $n)"))).toBe(1 + length);
  });

  it("never counts more than the list can hold", () => {
    expect(at9(book("(first: 9999)"))).toBe(1 + length);
  });
});

describe("the weight limit", () => {
  const whole = `{ watchBook(reference: "WB-0112") { entries { nodes { note } } } }`;

  it("refuses a request over the limit from clearance 9, before transmission", () => {
    const sent = transmit(store, { operation: whole, clearance: 9 });
    expect(sent.transmitted).toBe(false);
    expect(sent.facts).toEqual([]);
    expect(sent.result.data).toBeUndefined();
    expect(sent.result.errors?.[0]?.message).toMatch(
      /weighed this request at \d+\. The limit at your clearance is 200\./,
    );
  });

  it("leaves a heavy request alone below clearance 9", () => {
    const query = `{ countries { borders { borders { name } } } }`;
    expect(
      transmit(store, { operation: query, clearance: 8 }).transmitted,
    ).toBe(true);
    expect(
      transmit(store, { operation: query, clearance: 9 }).transmitted,
    ).toBe(false);
  });
});
