import {
  isEnumType,
  isInterfaceType,
  isUnionType,
  getIntrospectionQuery,
  isInputObjectType,
  isObjectType,
  type IntrospectionQuery,
} from "graphql";
import { describe, expect, it } from "vitest";
import { loadContent } from "../../scripts/load-content.ts";
import { buildCatalog } from "../content/catalog.ts";
import { transmit } from "./execute.ts";
import { fieldClearance, isUndocumented, schemaFor } from "./schema.ts";
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
  5: [
    "Office",
    "PaymentOrder",
    "Receipt",
    "RegisterEntry",
    "TravelOrder",
    "Query.office",
    "Query.paymentOrders",
    "Query.receipt",
    "Query.travelOrders",
    "TransferOrder.clearedBy",
    "TransferOrder.registerEntry",
  ],
  6: ["Docket", "Drawer", "Slip", "Query.cabinet", "Query.exchangeBook"],
  7: [
    "CaseFile",
    "Memorandum",
    "Minute",
    "Officer",
    "Telegram",
    "Office.officers",
    "Query.caseFile",
  ],
  8: [
    "InterceptLog",
    "Pass",
    "Vessel",
    "Company.charters",
    "Sighting.pass",
    "Sighting.vessel",
    "Query.interceptLog",
  ],
  9: ["PageInfo", "WatchBook", "WatchEntry", "WatchPage", "Query.watchBook"],
  10: ["Endorsement", "Paper", "PaperFile", "PaperPage", "Query.paperFile"],
  11: [
    "Account",
    "ClaimReceipt",
    "Journey",
    "JourneyBook",
    "Mutation",
    "TravelReceipt",
    "Voucher",
    "Query.claim",
    "Query.journeyBook",
  ],
  12: [
    "Find",
    "Premises",
    "SearchApplication",
    "SearchReceipt",
    "WarrantApplication",
    "WarrantReceipt",
    "WarrantSubject",
    "City.premises",
    "Mutation.requestSearchWarrant",
    "Mutation.requestWarrant",
    "Operative.habit",
    "Operative.weakness",
    "Query.premises",
    "Query.search",
  ],
};

function surface(level: number): { types: string[]; fields: string[] } {
  const schema = schemaFor(level);
  const types = Object.values(schema.getTypeMap())
    .filter(
      (t) =>
        (isObjectType(t) || isInputObjectType(t)) && !t.name.startsWith("__"),
    )
    .map((t) => t.name)
    .sort();
  const fields = types.flatMap((name) => {
    const type = schema.getType(name);
    return isObjectType(type) || isInputObjectType(type)
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
        .filter((t) => !t.name.startsWith("__"))
        .flatMap((t) =>
          t.kind === "OBJECT"
            ? t.fields.map((f) => `${t.name}.${f.name}`)
            : t.kind === "INPUT_OBJECT"
              ? t.inputFields.map((f) => `${t.name}.${f.name}`)
              : [],
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

  it("files the receipt for the tiles at clearance 5, with nobody to release it", () => {
    const query = `{
      receipt(id: "RCT-0417") {
        releasedBy
        releaseOrder { registerEntry { serial office { name } } }
        lossReport { serial office { name register { serial } } }
      }
    }`;
    expect(
      transmit(catalog.store, { operation: query, clearance: 4 }).transmitted,
    ).toBe(false);
    const sent = transmit(catalog.store, { operation: query, clearance: 5 });
    const receipt = (sent.result.data as { receipt: Record<string, unknown> })
      .receipt;
    expect(receipt).toMatchObject({
      releasedBy: null,
      releaseOrder: {
        registerEntry: { serial: 4126, office: { name: "Fourth Desk" } },
      },
      lossReport: { serial: 4128, office: { name: "Fourth Desk" } },
    });
    // The register lists its entries in serial order.
    const serials = (
      receipt.lossReport as { office: { register: { serial: number }[] } }
    ).office.register.map((e) => e.serial);
    expect(serials).toEqual([...serials].sort((a, b) => a - b));
    expect(serials.slice(0, 3)).toEqual([4126, 4127, 4128]);
  });

  it("returns a request that passes an argument the schema does not define", () => {
    const sent = transmit(catalog.store, {
      operation: `{ company(name: "Lantern Export") { shipments(manifest: "Lamp glass, 20 cases") { id } } }`,
      clearance: 2,
    });
    expect(sent.transmitted).toBe(false);
  });
});

describe("the Fourth Desk's cabinet at clearance 6", () => {
  it("is absent below clearance 6, scalar included", () => {
    const schema = schemaFor(5);
    expect(schema.getType("Docket")).toBeUndefined();
    expect(schema.getType("DeskSerial")).toBeUndefined();
    expect(schemaFor(6).getType("DeskSerial")).toBeDefined();
  });

  it("describes itself through introspection, though the panel leaves it out", () => {
    const sent = transmit(catalog.store, {
      operation: `{
        __type(name: "Docket") {
          kind
          fields { name description type { kind name ofType { kind name } } }
        }
      }`,
      clearance: 6,
    });
    expect(sent.result.errors).toBeUndefined();
    const type = (
      sent.result.data as {
        __type: {
          kind: string;
          fields: {
            name: string;
            description: string;
            type: { kind: string; name: string | null; ofType: unknown };
          }[];
        };
      }
    ).__type;
    expect(type.kind).toBe("OBJECT");
    const minute = type.fields.find((f) => f.name === "minute");
    expect(minute?.description).toMatch(/wrote the minute/);
    const opened = type.fields.find((f) => f.name === "opened");
    expect(opened?.type).toEqual({
      kind: "NON_NULL",
      name: null,
      ofType: { kind: "SCALAR", name: "DeskSerial" },
    });
    expect(sent.facts).toEqual([]);
    expect(isUndocumented("Docket")).toBe(true);
    expect(isUndocumented("DeskSerial")).toBe(true);
    expect(isUndocumented("Query", "cabinet")).toBe(true);
    expect(isUndocumented("Query", "city")).toBe(false);
    expect(isUndocumented("Office")).toBe(false);
  });

  it("hands over the tiles docket with a custom scalar and a record with no label", () => {
    const sent = transmit(catalog.store, {
      operation: `{
        cabinet {
          label
          dockets { reference opened heldFor { __typename codename } }
        }
      }`,
      clearance: 6,
    });
    expect(sent.result.errors).toBeUndefined();
    const drawers = (
      sent.result.data as {
        cabinet: { label: string; dockets: Record<string, unknown>[] }[];
      }
    ).cabinet;
    expect(drawers.map((d) => d.label)).toEqual([
      "Ceramics",
      "Freight",
      "Payments",
    ]);
    expect(drawers[0]?.dockets[0]).toEqual({
      reference: "DKT-0417",
      opened: "FS-0088",
      heldFor: { __typename: "Operative", codename: "GILT_MAGPIE" },
    });
  });

  it("has no interface below clearance 7, and Document with three kinds at 7", () => {
    expect(schemaFor(6).getType("Document")).toBeUndefined();
    const document = schemaFor(7).getType("Document");
    expect(isInterfaceType(document)).toBe(true);
    if (!isInterfaceType(document)) return;
    expect(
      schemaFor(7)
        .getPossibleTypes(document)
        .map((t) => t.name)
        .sort(),
    ).toEqual(["Memorandum", "Minute", "Telegram"]);
  });

  it("answers each document as its own kind, and records facts by that kind", () => {
    const sent = transmit(catalog.store, {
      operation: `{
        caseFile(reference: "CF-0417") {
          documents { __typename reference ... on Telegram { text } }
        }
      }`,
      clearance: 7,
    });
    expect(sent.result.errors).toBeUndefined();
    const documents = (
      sent.result.data as {
        caseFile: { documents: Record<string, string>[] };
      }
    ).caseFile.documents;
    expect(documents[0]).toEqual({
      __typename: "Minute",
      reference: "MIN-0088",
    });
    expect(documents[1]?.__typename).toBe("Telegram");
    expect(documents[1]?.text).toMatch(/draft of the minute/);
    expect(documents.some((d) => d.reference === "MEM-0044")).toBe(false);
    const keys = sent.facts.map((f) => f.fact.key);
    expect(keys).toContain("Telegram:TEL-0089.text");
    expect(keys).toContain("Minute:MIN-0088.reference");
  });

  it("filters a list inside a query by a city's name and by a seal", () => {
    const references = (args: string) => {
      const sent = transmit(catalog.store, {
        operation: `{ caseFile(reference: "CF-0417") { documents${args} { reference } } }`,
        clearance: 7,
      });
      expect(sent.result.errors).toBeUndefined();
      return (
        sent.result.data as { caseFile: { documents: { reference: string }[] } }
      ).caseFile.documents.map((d) => d.reference);
    };
    expect(references(`(city: "Valparaíso")`)).toEqual([
      "MEM-0040",
      "MEM-0042",
      "MEM-0043",
    ]);
    expect(references(`(city: "valparaiso")`)).toHaveLength(3);
    expect(references(`(city: "Valparaíso", sealed: true)`)).toEqual([
      "MEM-0044",
    ]);
    expect(references(`(sealed: false)`)).toEqual(references(""));
  });
});

describe("the intercept logs at clearance 8", () => {
  const entries = (args: string, selection = "__typename") => {
    const sent = transmit(catalog.store, {
      operation: `{ interceptLog(reference: "IL-0112") { entries${args} { ${selection} } } }`,
      clearance: 8,
    });
    expect(sent.result.errors).toBeUndefined();
    return {
      sent,
      list: (
        sent.result.data as {
          interceptLog: { entries: Record<string, string>[] };
        }
      ).interceptLog.entries,
    };
  };

  it("has no union or enum below clearance 8, and Intercept with five kinds at 8", () => {
    expect(schemaFor(7).getType("Intercept")).toBeUndefined();
    expect(schemaFor(7).getType("InterceptKind")).toBeUndefined();
    const intercept = schemaFor(8).getType("Intercept");
    expect(isUnionType(intercept)).toBe(true);
    if (!isUnionType(intercept)) return;
    expect(
      intercept
        .getTypes()
        .map((t) => t.name)
        .sort(),
    ).toEqual(["Company", "Pass", "Sighting", "Telegram", "Vessel"]);
    expect(isEnumType(schemaFor(8).getType("InterceptKind"))).toBe(true);
  });

  it("answers each entry as its own kind, and records facts by that kind", () => {
    const { sent, list } = entries(
      "",
      "__typename ... on Vessel { name } ... on Sighting { note }",
    );
    expect(list.map((e) => e.__typename)).toContain("Company");
    expect(list[0]).toEqual({ __typename: "Vessel", name: "Cabo Ledo" });
    const keys = sent.facts.map((f) => f.fact.key);
    expect(keys).toContain("Vessel:santa-luzia.name");
    expect(keys).toContain("Sighting:SGT-112.note");
  });

  it("filters entries by one kind, by a list of kinds, and by a single value given for a list", () => {
    const kinds = (args: string) =>
      new Set(entries(args).list.map((e) => e.__typename));
    expect(kinds("(kind: VESSEL)")).toEqual(new Set(["Vessel"]));
    expect(kinds("(kinds: [VESSEL, COMPANY])")).toEqual(
      new Set(["Vessel", "Company"]),
    );
    expect(kinds("(kinds: SIGHTING)")).toEqual(new Set(["Sighting"]));
    expect(entries("(kind: VESSEL)").list).toHaveLength(3);
  });
});
