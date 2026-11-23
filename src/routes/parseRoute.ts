export type Route =
  | { name: "home" }
  | { name: "mission"; missionId: string }
  | { name: "debrief"; missionId: string }
  | { name: "manual"; entryId?: string }
  | { name: "orientation" }
  | { name: "training" }
  | { name: "kata"; kataId: string }
  | { name: "settings" }
  | { name: "not-found"; path: string };

/** Every screen has a route of its own, so a reload returns to it. */
export function parseRoute(hash: string): Route {
  const path = hash.replace(/^#/, "").replace(/^\/+|\/+$/g, "");
  if (path === "") return { name: "home" };
  const [head, second, third, ...rest] = path
    .split("/")
    .map(decodeURIComponent);
  if (rest.length > 0) return { name: "not-found", path };
  if (head === "mission" && second && third === undefined) {
    return { name: "mission", missionId: second };
  }
  if (head === "mission" && second && third === "debrief") {
    return { name: "debrief", missionId: second };
  }
  if (head === "manual" && third === undefined) {
    return second ? { name: "manual", entryId: second } : { name: "manual" };
  }
  if (head === "orientation" && second === undefined) {
    return { name: "orientation" };
  }
  if (head === "training" && second === undefined) return { name: "training" };
  if (head === "training" && second === "kata" && third) {
    return { name: "kata", kataId: third };
  }
  if (head === "settings" && second === undefined) return { name: "settings" };
  return { name: "not-found", path };
}

export function href(route: Route): string {
  switch (route.name) {
    case "home":
      return "#/";
    case "mission":
      return `#/mission/${encodeURIComponent(route.missionId)}`;
    case "debrief":
      return `#/mission/${encodeURIComponent(route.missionId)}/debrief`;
    case "manual":
      return route.entryId
        ? `#/manual/${encodeURIComponent(route.entryId)}`
        : "#/manual";
    case "orientation":
      return "#/orientation";
    case "training":
      return "#/training";
    case "kata":
      return `#/training/kata/${encodeURIComponent(route.kataId)}`;
    case "settings":
      return "#/settings";
    case "not-found":
      return "#/";
  }
}
