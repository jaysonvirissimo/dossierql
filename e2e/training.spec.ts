import { expect, test } from "@playwright/test";
import {
  expectClean,
  press,
  send,
  watchPage,
  type PageWatch,
} from "./helpers.ts";

let watch: PageWatch;

test.beforeEach(async ({ page, baseURL }) => {
  watch = await watchPage(page, baseURL ?? "");
});

test.afterEach(() => {
  expectClean(watch);
});

const PASSES = [
  `query { country(name: "Portugal") { name capital } }`,
  `query { city(name: "Lisbon") { country { name } } }`,
  `query { country(name: "Kenya") { borders { name } } }`,
  `query { city(name: "Prague") { country { borders { capital } } } }`,
  `query { city(name: "Lisbon") { country { borders { borders { name } } } } }`,
  `query { city(name: "Luanda") { country { currency { name } } } }`,
];

test("a new player is offered training and can pass every drill", async ({
  page,
}) => {
  await page.goto("./#/mission/vanishing-azulejos");
  await expect(
    page.getByRole("link", { name: "training range" }),
  ).toBeVisible();
  await page.goto("./");
  await press(page.getByRole("link", { name: "Start training" }));
  await expect(
    page.getByRole("heading", { name: "Ask for a field" }),
  ).toBeVisible();
  const stamp = page.getByTestId("stamp");

  await send(page, PASSES[0]!);
  await expect(stamp).toHaveText("Passed");
  await expect(page.getByTestId("raw-response")).toContainText("Lisbon");
  await press(page.getByRole("button", { name: "Next drill" }));

  // A record asked for without braces is returned free, with the clerk's note.
  await expect(
    page.getByRole("heading", { name: "Open a record" }),
  ).toBeVisible();
  await send(page, `query { city(name: "Lisbon") { country } }`);
  await expect(page.getByText(/which of that record's fields/)).toBeVisible();
  await expect(page.getByText("Not yet.")).toBeVisible();
  await expect(stamp).toHaveCount(0);

  // A request that runs but misses the point shows its response and a nudge.
  await send(page, `query { city(name: "Lisbon") { name } }`);
  await expect(page.getByTestId("raw-response")).toContainText("Lisbon");
  await expect(page.getByText("Not yet.")).toBeVisible();

  for (const [index, query] of PASSES.entries()) {
    if (index === 0) continue;
    await send(page, query);
    await expect(stamp).toHaveText("Passed");
    if (index < PASSES.length - 1) {
      await press(page.getByRole("button", { name: "Next drill" }));
      await expect(stamp).toHaveCount(0);
    }
  }

  // Drills earn no rank, and the record survives a reload.
  await expect(page.locator(".shell-bar__rank")).toHaveText("Clearance 1");
  await page.reload();
  await expect(page.locator(".drill__pick .chip")).toHaveCount(6);

  await send(page, PASSES[0]!);
  await page.goto("./");
  const induction = page.locator(".induction");
  await expect(induction.getByText("Passed", { exact: true })).toBeVisible();
  await expect(
    induction.getByRole("link", { name: "Repeat training" }),
  ).toBeVisible();
  await expect(page.locator(".case")).toHaveCount(26);
});

test("result rows offer neither Cite nor Pin, and name the links not yet opened", async ({
  page,
}) => {
  await page.goto("./#/mission/vanishing-azulejos");
  await press(page.getByRole("button", { name: "Open the terminal" }));
  await send(
    page,
    `query { city(name: "Lisbon") { departingShipments { id manifest } } }`,
  );
  const results = page.locator(".results");
  // One note after the records, not one inside each record.
  const closed = results.getByTestId("unasked-links");
  await expect(closed).toHaveCount(1);
  await expect(closed).toContainText("Your query did not ask for these fields");
  await expect(closed).toContainText(/shipment:.*destination/);
  await expect(results.locator(".finding__record .findings__more")).toHaveCount(
    0,
  );
  await expect(results.getByRole("button", { name: /^Cite / })).toHaveCount(0);
  await expect(results.getByRole("button", { name: /^Pin / })).toHaveCount(0);
});
