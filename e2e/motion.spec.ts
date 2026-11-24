import { expect, test, type Page } from "@playwright/test";
import {
  choose,
  clock,
  draft,
  expectClean,
  openCase,
  openTool,
  press,
  send,
  submit,
  watchPage,
  type PageWatch,
} from "./helpers.ts";

// The motion of SDD 8.1: the clock counts down, an accepted form slides in,
// a dossier is clipped into the file. None of it may delay a player who
// reads or types, and none of it plays when motion is reduced.

let watch: PageWatch;

test.beforeEach(async ({ page, baseURL }) => {
  watch = await watchPage(page, baseURL ?? "");
});

test.afterEach(() => {
  expectClean(watch);
});

const LEDGERS = `query {
  mombasa: city(name: "Mombasa") { ...crates }
  dar: city(name: "Dar es Salaam") { ...crates }
  maputo: city(name: "Maputo") { ...crates }
}
fragment crates on City {
  arrivingShipments {
    id
    manifest
    inspection { finding }
    consignee { name director { codename } }
  }
}`;

function running(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    document
      .getAnimations()
      .filter((a) => a.playState === "running")
      .map((a) => (a as CSSAnimation).animationName),
  );
}

/** Spends time on the clock: a transmission, then a field check. */
async function spendTime(page: Page): Promise<void> {
  await openCase(page, "bound-ledgers");
  await send(page, LEDGERS.replace(" director { codename }", ""));
  await choose(page, "Shipment", "MBA-0102");
  await submit(page);
  await press(draft(page).getByRole("button", { name: /Order a field check/ }));
}

test("the case moves on screen, and the player reads and types throughout", async ({
  page,
}) => {
  // Long animations, so that the checks below happen while they play.
  await page.addInitScript(() => {
    document.addEventListener("DOMContentLoaded", () => {
      const style = document.createElement("style");
      style.textContent = ":root { --motion: 4s !important; }";
      document.head.append(style);
    });
  });
  await spendTime(page);

  // The field check slides into the dispatches, and the clock counts down
  // from 16 hours to 14. The true figure is in the text from the start.
  await expect(clock(page)).toContainText("14 of 17 hours left");
  await expect(draft(page)).toContainText(
    "asks who directs the company collecting them",
  );
  const playing = await running(page);
  expect(playing).toContain("dispatch-in");
  expect(playing).toContain("clock-count");

  // The editor takes keys while the animations play.
  const editor = page.getByRole("textbox", { name: "GraphQL query" });
  await editor.click();
  await page.keyboard.press("ControlOrMeta+End");
  await page.keyboard.type("\n# typed during the count");
  await expect(editor).toContainText("# typed during the count");
  expect(await running(page)).toContain("clock-count");

  // A dossier is clipped into the file as the tab opens.
  await send(page, LEDGERS);
  await openTool(page, "Dossiers");
  await expect(page.locator("article.dossier").first()).toBeVisible();
  expect(await running(page)).toContain("dossier-clip");
});

test("no animation plays when the system asks for reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await spendTime(page);
  await expect(clock(page)).toContainText("14 of 17 hours left");
  expect(await running(page)).toEqual([]);
  await openTool(page, "Dossiers");
  expect(await running(page)).toEqual([]);
});

test("no animation plays when the player turns motion off", async ({
  page,
}) => {
  await page.goto("./#/settings");
  await page.getByLabel(/Reduce motion/).check();
  await spendTime(page);
  await expect(clock(page)).toContainText("14 of 17 hours left");
  expect(await running(page)).toEqual([]);
});
