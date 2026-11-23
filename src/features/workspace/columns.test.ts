import { describe, expect, it } from "vitest";
import {
  cellAt,
  columnable,
  hasGroup,
  headingOf,
  isGroup,
  rowsOf,
  type Path,
} from "./columns.ts";

const courier = (codename: string, country: string) => ({
  codename,
  organization: { name: "Parallax Circle" },
  lastKnownLocation: {
    name: "Lusaka",
    country: { name: country, borders: [{ name: "Tanzania" }] },
  },
});

// The type of each record, by its path. A path not listed is a shipment.
const typeOf =
  (types: Record<string, string>) =>
  (path: Path): string =>
    types[path.join("/")] ?? "Shipment";

describe("records side by side", () => {
  it("sets the three couriers out as one group", () => {
    const data = {
      petrel: courier("GREY_PETREL", "Zambia"),
      ibis: courier("SABLE_IBIS", "Comoros"),
      falcon: courier("TIN_FALCON", "Kenya"),
    };
    const types = typeOf({
      petrel: "Operative",
      ibis: "Operative",
      falcon: "Operative",
    });
    expect(
      isGroup(Object.values(data), ["Operative", "Operative", "Operative"]),
    ).toBe(true);
    expect(hasGroup(data, types)).toBe(true);
    expect(rowsOf(Object.values(data)).map((r) => r.path.join("/"))).toEqual([
      "codename",
      "organization",
      "organization/name",
      "lastKnownLocation",
      "lastKnownLocation/name",
      "lastKnownLocation/country",
      "lastKnownLocation/country/name",
      "lastKnownLocation/country/borders",
    ]);
  });

  it("puts a field only a later record has after the field before it", () => {
    const rows = rowsOf([
      { codename: "GREY_PETREL", lastKnownLocation: { name: "Lusaka" } },
      { codename: "SABLE_IBIS", organization: { name: "Parallax Circle" } },
    ]);
    expect(rows.map((r) => r.path.join("/"))).toEqual([
      "codename",
      "organization",
      "organization/name",
      "lastKnownLocation",
      "lastKnownLocation/name",
    ]);
    expect(rows.find((r) => r.path.join("/") === "organization")?.kind).toBe(
      "object",
    );
  });

  it("tells a field not asked for from one under a record that came back empty", () => {
    const record = { codename: "SABLE_IBIS", inspection: null };
    expect(cellAt(record, ["lastKnownLocation", "name"])).toEqual({
      kind: "absent",
    });
    expect(cellAt(record, ["inspection", "finding"])).toEqual({
      kind: "under-nothing",
    });
    expect(cellAt(record, ["inspection"])).toEqual({
      kind: "value",
      value: null,
    });
  });

  it("keeps cities stacked and sets each city's arrivals in columns", () => {
    const arrivals = [
      { id: "MBA-1", manifest: "Bound ledgers", inspection: null },
      { id: "MBA-2", manifest: "Bound ledgers", inspection: { finding: "x" } },
    ];
    const city = { arrivingShipments: arrivals };
    expect(columnable(city)).toBe(false);
    expect(columnable(arrivals[0] ?? {})).toBe(true);
    const types = typeOf({ mombasa: "City", dar: "City" });
    expect(isGroup([city, city], ["City", "City"])).toBe(false);
    expect(hasGroup({ mombasa: city, dar: city }, types)).toBe(true);
  });

  it("gives a list of one record rows of its own in the column", () => {
    const city = (id: string) => ({
      arrivingShipments: [{ id, manifest: "Bound ledgers" }],
    });
    const cities = [city("MBA-0102"), { arrivingShipments: [] }];
    expect(isGroup(cities, ["City", "City"])).toBe(true);
    expect(rowsOf(cities).map((r) => r.path.join("/"))).toEqual([
      "arrivingShipments",
      "arrivingShipments/0/id",
      "arrivingShipments/0/manifest",
    ]);
    expect(cellAt(city("MBA-0102"), ["arrivingShipments", 0, "id"])).toEqual({
      kind: "value",
      value: "MBA-0102",
    });
    expect(
      cellAt({ arrivingShipments: [] }, ["arrivingShipments", 0, "id"]),
    ).toEqual({ kind: "under-nothing" });
  });

  it("does not make a group of one record or of two types", () => {
    expect(isGroup([courier("GREY_PETREL", "Zambia")], ["Operative"])).toBe(
      false,
    );
    expect(
      isGroup(
        [courier("GREY_PETREL", "Zambia"), { name: "Lusaka" }],
        ["Operative", "City"],
      ),
    ).toBe(false);
    expect(
      hasGroup(
        { operative: courier("GREY_PETREL", "Zambia") },
        typeOf({ operative: "Operative" }),
      ),
    ).toBe(false);
  });
});

describe("headingOf", () => {
  it("heads a record by its name or id, and a register entry by its serial", () => {
    expect(headingOf({ name: "Lisbon" }, 0)).toBe("Lisbon");
    expect(headingOf({ id: "LIS-0417", serial: 1 }, 0)).toBe("LIS-0417");
    expect(headingOf({ serial: 4126, note: "Order cleared." }, 0)).toBe(
      "Serial 4126",
    );
    expect(headingOf({ note: "Order cleared." }, 2)).toBe("Entry 3");
  });
});
