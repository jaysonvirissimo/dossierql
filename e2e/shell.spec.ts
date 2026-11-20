import { expect, test } from "@playwright/test";
import {
  expectClean,
  LISBON,
  openCase,
  openTool,
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

test("every screen has its own route and survives a reload", async ({
  page,
}) => {
  await page.goto("./");
  await expect(
    page.getByRole("heading", { name: "The Shadow Network" }),
  ).toBeVisible();
  await expect(page.locator(".case")).toHaveCount(10);

  await page.goto("./#/orientation");
  await expect(
    page.getByRole("heading", { name: "Orientation" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Orientation" }),
  ).toBeVisible();

  await page.goto("./#/manual/alias");
  await expect(page.locator("#entry-alias")).toHaveAttribute(
    "data-current",
    "true",
  );

  await page.goto("./#/mission/no-such-case");
  await expect(
    page.getByText('No case is filed as "no-such-case".'),
  ).toBeVisible();

  await page.goto("./#/nowhere/at/all");
  await expect(
    page.getByRole("heading", { name: "Nothing filed here" }),
  ).toBeVisible();
});

test("the tools beside the terminal are free and say what help costs", async ({
  page,
}) => {
  await openCase(page, "vanishing-azulejos");
  const before = await page
    .getByRole("status", { name: "Mission clock" })
    .innerText();

  await openTool(page, "Documentation");
  await expect(page.locator(".tools__panel")).toContainText(
    "departingShipments",
  );
  // Clearance 1 does not see what later levels add.
  await expect(page.locator(".tools__panel")).not.toContainText("coverNames");
  await expect(page.locator(".tools__panel")).not.toContainText("Organization");

  await openTool(page, "Glossary");
  await expect(page.locator(".tools__panel")).toContainText("nested selection");
  await expect(page.locator(".tools__panel")).not.toContainText("fragment");

  await openTool(page, "Hints");
  await expect(page.locator(".tools__panel")).toContainText(
    "1, 2, 4, 8 hours in turn, 15 in all",
  );
  await expect(page.locator(".tools__panel")).toContainText(
    "Hint 2 of 4: says which GraphQL idea is involved",
  );
  expect(
    await page.getByRole("status", { name: "Mission clock" }).innerText(),
  ).toBe(before);

  await press(page.getByRole("button", { name: "Take hint 1 of 4 (1 hour)" }));
  await expect(page.locator(".tools__panel")).toContainText(
    "Some manifests fit the registrar's description",
  );
  await expect(
    page.getByRole("status", { name: "Mission clock" }),
  ).toContainText("26 of 27 hours left");

  await send(page, LISBON);
  await openTool(page, "Map");
  await expect(page.getByRole("img", { name: /World map/ })).toBeVisible();
  await expect(page.locator(".journeys")).toContainText("Angola: 4 hours");
  await openTool(page, "Dossiers");
  await expect(page.locator(".tools__panel")).toContainText(
    "No operative has appeared",
  );
});

test("progress can be reset, and preferences are kept", async ({ page }) => {
  await page.goto("./#/settings");
  await page.getByLabel(/Reduce motion/).check();
  await openCase(page, "vanishing-azulejos");
  await page.goto("./#/");
  await expect(
    page.locator(".case", { hasText: "The Vanishing Azulejos" }),
  ).toContainText("In progress");

  await page.goto("./#/settings");
  await press(page.getByRole("button", { name: "Reset progress…" }));
  await press(page.getByTestId("reset-confirm"));
  await expect(
    page.getByText("Progress cleared. Preferences were kept."),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByLabel(/Reduce motion/)).toBeChecked();
  await page.goto("./#/");
  await expect(
    page.locator(".case", { hasText: "The Vanishing Azulejos" }),
  ).not.toContainText("In progress");
});

test("the game is playable when the browser refuses storage", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("storage is disabled");
      },
    });
  });
  await page.goto("./");
  await expect(page.getByText(/not storing progress/)).toBeVisible();
  await openCase(page, "vanishing-azulejos");
  await send(page, LISBON);
  await expect(
    page.getByRole("status", { name: "Mission clock" }),
  ).toContainText("26 of 27 hours left");
});
