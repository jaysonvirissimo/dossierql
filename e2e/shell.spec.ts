import { expect, test } from "@playwright/test";
import {
  expectClean,
  LISBON,
  openCase,
  draft,
  openTool,
  press,
  record,
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
  await expect(page.locator(".case")).toHaveCount(26);

  // One way forward: the first case is emphasized, and the assessments
  // a new player would attempt as placements wait under one entry.
  await expect(page.locator(".case--next")).toHaveCount(1);
  await expect(page.locator(".case--next")).toContainText(
    "The Vanishing Azulejos",
  );
  // On the first day the desk has one main button, and it starts training.
  await expect(page.locator(".button--primary")).toHaveCount(1);
  await expect(page.locator(".button--primary")).toHaveText("Start training");
  await expect(page.locator(".case .button--primary")).toHaveCount(0);
  await expect(page.locator(".placements .case")).toHaveCount(13);
  await expect(page.locator(".placements summary")).toContainText(
    "Placement: 13 assessments",
  );
  await expect(page.locator(".placements .case").first()).toBeHidden();

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

const GENOA = `query {
  city(name: "Genoa") {
    departingShipments {
      id
      manifest
      destination { name country { name currency { name } } }
    }
  }
}`;

test("the tools beside the terminal are free and say what help costs", async ({
  page,
}) => {
  // The second case is the first with a clock.
  await openCase(page, "borrowed-chronometer");
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
    "Two crates fit the observatory's description",
  );
  await expect(
    page.getByRole("status", { name: "Mission clock" }),
  ).toContainText("17 of 18 hours left");

  await send(page, GENOA);
  await openTool(page, "Map");
  await expect(page.getByRole("img", { name: /World map/ })).toBeVisible();
  await expect(page.locator(".journeys")).toContainText(/Senegal: \d hours/);
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
    page.locator(".case", {
      has: page.locator(".case__title", { hasText: "The Vanishing Azulejos" }),
    }),
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
    page.locator(".case", {
      has: page.locator(".case__title", { hasText: "The Vanishing Azulejos" }),
    }),
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
  await expect(record(page, "LIS-0417")).toBeVisible();
});

test("a glossary link opens the manual at its entry", async ({ page }) => {
  // A briefing's link is followed inside the game, not loaded afresh.
  await page.goto("./#/mission/vanishing-azulejos");
  await press(page.getByRole("link", { name: "evidence chain" }));
  const entry = page.locator("#entry-evidence-chain");
  await expect(entry).toHaveAttribute("data-current", "true");
  await expect(entry).toBeFocused();
  await expect(entry).toBeInViewport();
});

// The playtest agents' snapshot tool marks every control "disableable",
// which says only that it could be turned off. This pins down what the
// accessibility tree really says about a form's box.
test("a form's box is off until there is something to choose, and its options are not", async ({
  page,
}) => {
  await openCase(page, "vanishing-azulejos");
  const box = draft(page).getByRole("combobox", {
    name: "Shipment to set aside",
  });
  // Before any response, the box is off and says why in its only option.
  await expect(box).toBeDisabled();
  await expect(box).toMatchAriaSnapshot(`
    - combobox "Shipment to set aside" [disabled]:
      - option "No shipment retrieved yet" [selected]
  `);

  await send(page, LISBON);
  await expect(box).toBeEnabled();
  for (const id of ["LIS-0417", "LIS-0486", "LIS-0522"]) {
    await expect(box.getByRole("option", { name: id })).toBeEnabled();
  }
  await expect(box).toMatchAriaSnapshot(`
    - combobox "Shipment to set aside":
      - option "Not yet chosen" [selected]
      - option "LIS-0417"
      - option "LIS-0486"
      - option "LIS-0522"
  `);
});
