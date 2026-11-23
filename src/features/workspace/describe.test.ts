import { describe, expect, it } from "vitest";
import type { Fact } from "../../graphql/facts.ts";
import { describeFact, labelOf, rowWords, type Ledger } from "./describe.ts";

function ledgerOf(facts: Fact[]): Ledger {
  return Object.fromEntries(
    facts.map((fact) => [fact.key, { fact, sources: [] }]),
  );
}

const ref = (entity: string, field: string, to: string | null): Fact => ({
  key: `${entity}.${field}`,
  entity,
  field,
  value: { kind: "ref", ref: to },
});
const scalar = (entity: string, field: string, value: string): Fact => ({
  key: `${entity}.${field}`,
  entity,
  field,
  value: { kind: "scalar", value },
});

describe("labelOf", () => {
  it("uses what a query returned to identify the record", () => {
    const ledger = ledgerOf([
      scalar("Docket:DKT-0417", "reference", "DKT-0417"),
      scalar("Office:first-desk", "name", "First Desk"),
    ]);
    expect(labelOf("Docket:DKT-0417", ledger)).toBe("DKT-0417");
    expect(labelOf("Office:first-desk", ledger)).toBe("First Desk");
  });

  it("numbers records that no query has identified, and never shows the filing key", () => {
    const ledger = ledgerOf([
      ref("Docket:DKT-0417", "heldFor", "Operative:GILT_MAGPIE"),
      ref("Docket:DKT-0486", "heldFor", "Operative:OPAL_WREN"),
      scalar("Operative:NIGHTJAR", "codename", "NIGHTJAR"),
    ]);
    expect(labelOf("Operative:GILT_MAGPIE", ledger)).toBe(
      "operative 1, not yet identified",
    );
    expect(labelOf("Operative:OPAL_WREN", ledger)).toBe(
      "operative 2, not yet identified",
    );
    expect(labelOf("Operative:NIGHTJAR", ledger)).toBe("NIGHTJAR");
  });
});

describe("describeFact", () => {
  it("says a record's type once, whether or not a query has identified it", () => {
    const seen = ref("Sighting:SGT-108", "vessel", "Vessel:santa-luzia");
    const named = scalar("Vessel:santa-luzia", "name", "Santa Luzia");
    expect(describeFact(seen, ledgerOf([seen, named]))).toBe(
      "sighting 1, not yet identified · vessel: Santa Luzia",
    );
    expect(describeFact(named, ledgerOf([named]))).toBe(
      "vessel Santa Luzia · name: Santa Luzia",
    );
  });
});

describe("rowWords", () => {
  it("reads a row from the record it sits in", () => {
    expect(rowWords(["cabinet", 0, "dockets", 2, "shipment", "id"])).toBe(
      "shipment → id",
    );
    expect(
      rowWords(["receipt", "releaseOrder", "registerEntry", "serial"]),
    ).toBe("release order → register entry → serial");
  });
});
