import { expect, test, type Page } from "@playwright/test";
import {
  choose,
  clock,
  draft,
  expectClean,
  LISBON,
  LUANDA,
  MANIFESTS,
  openCase,
  openTool,
  press,
  record,
  send,
  submit,
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

async function solveLuanda(page: Page): Promise<void> {
  await send(page, LUANDA);
  await choose(page, "Transfer order", "LUA-012");
  await choose(page, "For shipment", "LIS-0417");
  await choose(page, "Authorized by", "NIGHTJAR");
}

test("the Azulejos case, by keyboard at 1024 pixels, with no clock", async ({
  page,
}) => {
  await openCase(page, "vanishing-azulejos");

  // The editor, results and draft are all on screen with no sideways scroll.
  await expect(page.getByRole("heading", { name: "Results" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Deduction" })).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
  // The first case has no clock and quotes no price.
  await expect(clock(page)).toHaveCount(0);
  await expect(page.getByTestId("transmit")).toHaveText("Transmit");

  // A request the archive cannot read comes back with the clerk's note.
  await send(page, MANIFESTS.replace("manifest", "manifest { text }"));
  await expect(
    page.getByText(/returned your request without processing it/),
  ).toBeVisible();
  await expect(
    page.getByText(/single value with nothing inside/),
  ).toBeVisible();
  await expect(page.getByText("No time was spent.")).toHaveCount(0);

  // Stage 1: the right crate, guessed before any response proves it,
  // comes back to the player.
  await send(page, MANIFESTS.replace("manifest", ""));
  await choose(page, "Shipment to set aside", "LIS-0486");
  await submit(page);
  await expect(page.getByTestId("returned")).toContainText(
    "Not yet established",
  );
  await expect(page.getByTestId("returned")).toContainText(
    "Your responses hold no fact that proves this claim about LIS-0486.",
  );
  await expect(page.locator(".casebar")).toContainText("cannot be the tiles");

  // Once the manifests come back, the same choice is accepted with no
  // citation, and the form shows the evidence it rested on.
  await send(page, MANIFESTS);
  await expect(page.getByRole("button", { name: /^Cite/ })).toHaveCount(0);
  await submit(page);
  await expect(draft(page)).toContainText("offers to send a");
  await expect(draft(page)).not.toContainText("no time spent");
  const chain = draft(page).getByTestId("evidence-chain");
  await expect(chain).toContainText(
    "The contents of this shipment are not ceramic.",
  );
  await expect(chain).toContainText("Blue slate squares");
  await press(chain.getByRole("button", { name: "Source: transmission 2" }));
  await expect(page.getByText("Transmission 2 of 2")).toBeVisible();
  await expect(page.locator(".casebar")).toContainText(
    "going to a country that does not border Namibia",
  );
  // Nobody has travelled, so the response stays on the desk.
  await expect(record(page, "LIS-0486")).toBeVisible();

  // A hint costs nothing here.
  await openTool(page, "Hints");
  await expect(page.locator(".tools__panel")).toContainText(
    "This case has no clock, so help costs nothing.",
  );
  await press(
    page.getByRole("button", { name: "Take hint 1 of 4", exact: true }),
  );
  await expect(page.locator(".tools__panel")).toContainText(
    "For each of the two ceramic shipments",
  );
  await expect(
    page.getByRole("button", { name: "View the solution", exact: true }),
  ).toBeVisible();

  // Stage 2: the wrong ceramic crate comes back with how far the responses
  // reach. The island crate is accepted on a chain of three facts.
  await send(page, LISBON);
  await choose(page, "Shipment to set aside", "LIS-0417");
  await submit(page);
  await expect(page.getByTestId("returned")).toContainText(
    "Your responses connect LIS-0417 to Luanda and Angola.",
  );
  await choose(page, "Shipment to set aside", "LIS-0522");
  await submit(page);
  await expect(draft(page)).toContainText("drive from an island");
  await expect(
    draft(page).locator(
      "[data-testid=evidence-chain] .evidence-chain__facts li",
    ),
  ).toHaveCount(3);

  // Stage 3: the travel order, from evidence already on the desk.
  await expect(
    page.getByRole("heading", { name: "Travel order" }),
  ).toBeVisible();
  await choose(page, "Shipment to hold", "LIS-0417");
  await choose(page, "Country receiving the shipment", "CV");
  await submit(page, "Travel");
  // The wrong country comes back, and the form offers the one the
  // responses show.
  await expect(page.getByTestId("returned")).toContainText(
    "Your responses show Angola for “Country receiving the shipment”, and the form gives Cabo Verde.",
  );
  await press(draft(page).getByRole("button", { name: "Choose Angola" }));
  await expect(
    draft(page).getByLabel("Country receiving the shipment"),
  ).toHaveValue("AO");
  await submit(page, "Travel");
  await expect(page.locator(".casebar")).toContainText("Angola");
  // The chain for each claim: one manifest, and the three facts of the route.
  await expect(
    draft(page).locator(
      "[data-testid=evidence-chain] .evidence-chain__facts li",
    ),
  ).toHaveCount(4);
  await expect(draft(page).getByTestId("evidence-chain")).toContainText(
    "country Angola · borders",
  );
  // A new country opens on a clean results panel, with Lisbon's kept.
  await expect(
    page.getByText("Nothing has been transmitted from here yet."),
  ).toBeVisible();
  await expect(page.locator(".finding__record")).toHaveCount(0);

  // A reload keeps the stage, the evidence and the history of the case.
  await page.reload();
  await expect(page.locator(".casebar")).toContainText("Angola");
  await expect(clock(page)).toHaveCount(0);
  await openTool(page, "Case");
  await expect(page.locator(".dispatches")).toContainText(
    /accepted · LIS-0486/i,
  );
  await expect(page.locator(".dispatches")).toContainText(/travel · LIS-0417/i);
  await expect(
    page.locator(".dispatches").getByTestId("evidence-chain"),
  ).toHaveCount(3);
  await openTool(page, "Evidence");
  await expect(page.locator(".tools__panel")).toContainText(
    "Every fact your queries have returned",
  );

  // Luanda: the replacement label identifies the order, and so the signer.
  await solveLuanda(page);
  await submit(page);

  await expect(
    page.getByRole("heading", { name: "Case resolved" }),
  ).toBeVisible();
  await expect(page.getByTestId("stamp")).toHaveText("HOLD ISSUED");
  await expect(page.getByText("NIGHTJAR's name circled")).toBeVisible();
  await expect(page.getByText("Fields and nested selections")).toBeVisible();
  await expect(page.getByText(/to spare/)).toHaveCount(0);

  // The completion is on the record, with the help used.
  await page.goto("./#/");
  const file = page.locator(".case", {
    has: page.locator(".case__title", { hasText: "The Vanishing Azulejos" }),
  });
  await expect(file).toContainText("Completed with hints");
});

test("a mid-case reload keeps the choices of a stage that shares the desk", async ({
  page,
}) => {
  await openCase(page, "vanishing-azulejos");
  await send(page, MANIFESTS);
  await choose(page, "Shipment to set aside", "LIS-0486");
  await submit(page);
  await send(page, LISBON);
  await choose(page, "Shipment to set aside", "LIS-0522");

  await page.reload();
  await expect(page.locator(".casebar")).toContainText(
    "going to a country that does not border Namibia",
  );
  await expect(record(page, "LIS-0522")).toBeVisible();
  await expect(draft(page).getByLabel("Shipment to set aside")).toHaveValue(
    "LIS-0522",
  );
  await submit(page);
  await expect(draft(page)).toContainText("drive from an island");
});
