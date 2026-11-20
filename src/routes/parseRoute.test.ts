import { describe, expect, it } from "vitest";
import { href, parseRoute, type Route } from "./parseRoute.ts";

describe("parseRoute", () => {
  it("reads every screen from its hash", () => {
    expect(parseRoute("")).toEqual({ name: "home" });
    expect(parseRoute("#/")).toEqual({ name: "home" });
    expect(parseRoute("#/mission/vanishing-azulejos")).toEqual({
      name: "mission",
      missionId: "vanishing-azulejos",
    });
    expect(parseRoute("#/mission/x/debrief")).toEqual({
      name: "debrief",
      missionId: "x",
    });
    expect(parseRoute("#/manual/alias")).toEqual({
      name: "manual",
      entryId: "alias",
    });
    expect(parseRoute("#/nowhere")).toEqual({
      name: "not-found",
      path: "nowhere",
    });
  });

  it("round-trips through href", () => {
    const routes: Route[] = [
      { name: "home" },
      { name: "mission", missionId: "a" },
      { name: "debrief", missionId: "a" },
      { name: "manual" },
      { name: "manual", entryId: "query" },
      { name: "orientation" },
      { name: "training" },
      { name: "settings" },
    ];
    for (const route of routes) expect(parseRoute(href(route))).toEqual(route);
  });
});
