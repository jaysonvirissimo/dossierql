import { describe, expect, it } from "vitest";
import type { FactPattern } from "../content/types.ts";
import { factKey, type Fact, type FactValue } from "../graphql/facts.ts";
import { fillSet, matchSet, meets, mostTogether } from "./match.ts";

function fact(entity: string, field: string, value: FactValue): Fact {
  return { key: factKey(entity, field), entity, field, value };
}
const ref = (r: string): FactValue => ({ kind: "ref", ref: r });
const list = (refs: string[], complete = true): FactValue => ({
  kind: "list",
  refs,
  complete,
});

const route: FactPattern[] = [
  { entity: "Shipment:$shipment", field: "destination", equals: "City:$city" },
  { entity: "City:$city", field: "country", equals: "Country:$country" },
  { entity: "Country:$country", field: "borders", includes: "Country:NA" },
];
const luanda = [
  fact("Shipment:LIS-0417", "destination", ref("City:luanda")),
  fact("City:luanda", "country", ref("Country:AO")),
  fact("Country:AO", "borders", list(["Country:NA", "Country:ZM"])),
];

describe("matchSet", () => {
  it("accepts a complete connected chain, with extra facts", () => {
    const extra = fact("Shipment:LIS-0417", "manifest", {
      kind: "scalar",
      value: "x",
    });
    expect(
      matchSet(route, [extra, ...luanda], { shipment: "LIS-0417" }),
    ).toEqual({ shipment: "LIS-0417", city: "luanda", country: "AO" });
  });

  it("rejects an incomplete set", () => {
    expect(
      matchSet(route, luanda.slice(0, 2), { shipment: "LIS-0417" }),
    ).toBeNull();
  });

  it("rejects facts that belong to another lead", () => {
    expect(matchSet(route, luanda, { shipment: "LIS-0522" })).toBeNull();
    const broken = [
      luanda[0] as Fact,
      fact("City:praia", "country", ref("Country:CV")),
      luanda[2] as Fact,
    ];
    expect(matchSet(route, broken, { shipment: "LIS-0417" })).toBeNull();
    expect(
      matchSet(route, luanda, { shipment: "LIS-0417", country: "ZA" }),
    ).toBeNull();
  });

  it("lets an absent entry refute only when the list is complete", () => {
    const excludes: FactPattern[] = [
      { entity: "Country:$c", field: "borders", excludes: "Country:NA" },
    ];
    const whole = [fact("Country:CV", "borders", list([]))];
    const part = [fact("Country:CV", "borders", list([], false))];
    expect(matchSet(excludes, whole)).toEqual({ c: "CV" });
    expect(matchSet(excludes, part)).toBeNull();
    expect(matchSet(excludes, [luanda[2] as Fact])).toBeNull();
  });

  it("compares scalars literally", () => {
    const p: FactPattern[] = [
      { entity: "Shipment:$s", field: "manifest", equals: "Tiles" },
    ];
    const f = (v: string) =>
      fact("Shipment:A", "manifest", { kind: "scalar", value: v });
    expect(matchSet(p, [f("Tiles")])).toEqual({ s: "A" });
    expect(matchSet(p, [f("Slate")])).toBeNull();
  });
});

describe("fillSet, meets and mostTogether", () => {
  const scattered = [
    luanda[0] as Fact,
    fact("City:praia", "country", ref("Country:CV")),
  ];

  it("reports the fact that met each pattern", () => {
    const extra = fact("City:praia", "country", ref("Country:CV"));
    const filled = fillSet(route, [extra, ...luanda], { shipment: "LIS-0417" });
    expect(filled?.facts.map((f) => f.key)).toEqual(luanda.map((f) => f.key));
  });

  it("judges one fact against one pattern", () => {
    const [, country] = route as [FactPattern, FactPattern];
    expect(meets(country, scattered[1] as Fact, {})).toBe(true);
    expect(meets(country, scattered[1] as Fact, { city: "luanda" })).toBe(
      false,
    );
  });

  it("counts the patterns that connected facts meet together", () => {
    const lead = { shipment: "LIS-0417" };
    expect(mostTogether(route, luanda.slice(0, 2), lead)).toBe(2);
    // Each fact meets a pattern, but Praia is not where the shipment went.
    expect(mostTogether(route, scattered, lead)).toBe(1);
    expect(mostTogether(route, [], lead)).toBe(0);
  });
});
