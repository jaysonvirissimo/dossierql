import { expect, test, type Page } from "@playwright/test";
import {
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

async function cite(page: Page, shipment: string, row: string): Promise<void> {
  await press(
    record(page, shipment).getByRole("button", {
      name: new RegExp(`^Cite (.* → )?${row},`),
    }),
  );
}

async function solveLuanda(page: Page): Promise<void> {
  await send(page, LUANDA);
  const order = record(page, "LUA-012");
  await press(order.getByRole("button", { name: /^Cite (.* → )?consignee,/ }));
  await press(
    order.getByRole("button", { name: /^Cite (.* → )?authorized by,/ }),
  );
  // The label the depot logged, cited into the order's open draft.
  const intake = record(page, "LIS-0417")
    .locator(":scope > .finding__fields > .finding")
    .filter({ has: page.locator(".finding__name", { hasText: /^intake$/ }) });
  await press(
    intake.locator(".finding__nested").getByRole("button", {
      name: /^Cite (.* → )?consignee,/,
    }),
  );
  await draft(page)
    .getByRole("combobox", { name: "For shipment" })
    .selectOption("LIS-0417");
  await draft(page)
    .getByRole("combobox", { name: "Authorized by" })
    .selectOption("NIGHTJAR");
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

  // Stage 1: one finding, cited for the single claim on the form.
  await send(page, MANIFESTS);
  await cite(page, "LIS-0486", "manifest");
  await expect(
    draft(page).getByRole("tab", { name: "LIS-0486" }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(draft(page).locator(".claim")).toHaveCount(1);
  await expect(
    draft(page).locator(".claim[data-status=supported]"),
  ).toHaveCount(1);
  await press(draft(page).getByRole("button", { name: "Submit deduction" }));
  await expect(draft(page)).toContainText("offers to send a");
  await expect(draft(page)).not.toContainText("no time spent");
  await expect(page.locator(".casebar")).toContainText(
    "cannot reach Namibia by road",
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

  // Stage 2: a nested row carries every fact on the way down to it.
  await send(page, LISBON);
  await cite(page, "LIS-0522", "borders");
  await expect(
    draft(page).getByRole("tab", { name: "LIS-0522" }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(
    draft(page).locator(".claim[data-status=supported]"),
  ).toHaveCount(1);
  await expect(
    draft(page).locator(".claim[data-status=supported] .claim__facts li"),
  ).toHaveCount(3);
  await draft(page).locator(".citation summary").first().click();
  await expect(
    draft(page).getByRole("button", { name: "Source: transmission 2" }).first(),
  ).toBeVisible();
  await press(draft(page).getByRole("button", { name: "Submit deduction" }));
  await expect(draft(page)).toContainText("drive from an island");

  // Stage 3: the travel order, from evidence already on the desk.
  await expect(
    page.getByRole("heading", { name: "Travel order" }),
  ).toBeVisible();
  await cite(page, "LIS-0417", "manifest");
  await cite(page, "LIS-0417", "borders");
  // The route is cited and the country box is blank: the claim waits on a
  // choice, and the draft offers the country the cited facts show.
  await expect(
    draft(page).locator(".claim[data-status=open] .chip"),
  ).toHaveText("Needs a choice");
  await expect(draft(page).locator(".draft__status")).toContainText(
    "Make the choice above",
  );
  await press(draft(page).getByRole("button", { name: "Choose Angola" }));
  await expect(
    draft(page).getByLabel("Country receiving the shipment"),
  ).toHaveValue("AO");
  await expect(
    draft(page).locator(".claim[data-status=supported]"),
  ).toHaveCount(2);
  // Each claim lists the cited facts that support it: one manifest, and the
  // three facts of the route that a single citation carried.
  await expect(
    draft(page).locator(".claim[data-status=supported] .claim__facts li"),
  ).toHaveCount(4);
  await expect(draft(page).locator(".claim__facts").last()).toContainText(
    "country Angola · borders",
  );
  // Each Cite control shows the lead whose draft its citation enters.
  await expect(
    record(page, "LIS-0522").getByRole("button", { name: /^Cite id,/ }),
  ).toHaveText("Cite for LIS-0522");

  await press(draft(page).getByRole("button", { name: "Travel", exact: true }));
  await expect(page.locator(".casebar")).toContainText("Angola");
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
  await openTool(page, "Evidence");
  await expect(page.locator(".tools__panel")).toContainText(
    "Every fact your queries have returned",
  );

  // Luanda: the replacement label identifies the order, and so the signer.
  await solveLuanda(page);
  await expect(
    draft(page).locator(".claim[data-status=supported]"),
  ).toHaveCount(2);
  await press(draft(page).getByRole("button", { name: "Submit deduction" }));

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

test("a mid-case reload keeps the drafts of a stage that shares the desk", async ({
  page,
}) => {
  await openCase(page, "vanishing-azulejos");
  await send(page, MANIFESTS);
  await cite(page, "LIS-0486", "manifest");
  await press(draft(page).getByRole("button", { name: "Submit deduction" }));
  await send(page, LISBON);
  await cite(page, "LIS-0522", "borders");

  await page.reload();
  await expect(page.locator(".casebar")).toContainText(
    "cannot reach Namibia by road",
  );
  await expect(record(page, "LIS-0522")).toBeVisible();
  await expect(
    draft(page).locator(".claim[data-status=supported]"),
  ).toHaveCount(1);
  await expect(draft(page).locator(".citation")).toHaveCount(1);
});
