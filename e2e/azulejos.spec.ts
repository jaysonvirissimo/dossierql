import { expect, test, type Page } from "@playwright/test";
import {
  clock,
  draft,
  expectClean,
  LISBON,
  LUANDA,
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

async function solveLisbon(page: Page): Promise<void> {
  await cite(page, "LIS-0417", "manifest");
  await cite(page, "LIS-0417", "borders");
  await draft(page)
    .getByLabel("Destination country")
    .selectOption({ label: "Angola" });
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

test("the Azulejos case, by keyboard at 1024 pixels, held on time", async ({
  page,
}) => {
  await openCase(page, "vanishing-azulejos");

  // The editor, results and draft are all on screen with no sideways scroll.
  await expect(page.getByRole("heading", { name: "Results" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Travel order" }),
  ).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
  await expect(clock(page)).toContainText(
    "Buyer collects the crate in 27 hours",
  );

  // The starter query has a gap, and the clerk returns it at no cost.
  await send(page, LISBON.replace("manifest", "manifest { text }"));
  await expect(page.getByText("No time was spent.")).toBeVisible();
  await expect(
    page.getByText(/single value with nothing inside/),
  ).toBeVisible();
  await expect(clock(page)).toContainText("27 of 27 hours left");

  await send(page, LISBON);
  await expect(clock(page)).toContainText("26 of 27 hours left");

  // Cite findings straight from the response. Each lands in its own lead.
  await cite(page, "LIS-0486", "manifest");
  await expect(
    draft(page).getByRole("tab", { name: "LIS-0486" }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(draft(page)).toContainText("Contradicted");

  // Rule out one wrong lead, free.
  await press(draft(page).getByRole("button", { name: /Rule out this lead/ }));
  await expect(draft(page)).toContainText(
    "offers to send a sample of the slate",
  );
  await expect(draft(page)).toContainText("no time spent");
  await expect(clock(page)).toContainText("26 of 27 hours left");

  // A different lead with one supported claim and one unverified: field check.
  await cite(page, "LIS-0522", "manifest");
  await expect(
    draft(page).getByRole("tab", { name: "LIS-0522" }),
  ).toHaveAttribute("aria-selected", "true");
  const check = draft(page).getByRole("button", {
    name: /Order a field check/,
  });
  await expect(check).toContainText("3 hours");
  await press(check);
  await expect(draft(page)).toContainText(
    "which land border the truck is meant to cross",
  );
  await expect(clock(page)).toContainText("23 of 27 hours left");
  await expect(
    page.getByRole("heading", { name: "Travel order" }),
  ).toBeVisible();

  // The right lead: a complete travel order.
  await solveLisbon(page);
  await expect(
    draft(page).getByRole("tab", { name: "LIS-0417" }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(
    draft(page).locator(".claim[data-status=supported]"),
  ).toHaveCount(2);

  // Drafts stay with their shipments, and a cited fact links to its source.
  await press(draft(page).getByRole("tab", { name: /LIS-0522/ }));
  await expect(draft(page).locator(".citation")).toHaveCount(1);
  await press(draft(page).getByRole("tab", { name: /LIS-0417/ }));
  await expect(draft(page).locator(".citation")).toHaveCount(2);
  await draft(page).locator(".citation summary").first().click();
  await expect(
    draft(page).getByRole("button", { name: "Source: transmission 1" }).first(),
  ).toBeVisible();

  const travel = draft(page).getByRole("button", { name: /^Travel/ });
  await expect(travel).toContainText("4 hours");
  await press(travel);
  await expect(page.locator(".casebar")).toContainText("Angola");
  await expect(clock(page)).toContainText("19 of 27 hours left");

  // A reload keeps the stage, the clock, the evidence and the lead history.
  await page.reload();
  await expect(page.locator(".casebar")).toContainText("Angola");
  await expect(clock(page)).toContainText("19 of 27 hours left");
  await openTool(page, "Case");
  await expect(page.locator(".dispatches")).toContainText(
    "ruled out · LIS-0486",
  );
  await expect(page.locator(".dispatches")).toContainText(
    "field check · LIS-0522",
  );
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

  // The completion is on the record, with the help used.
  await page.goto("./#/");
  const file = page.locator(".case", { hasText: "The Vanishing Azulejos" });
  await expect(file).toContainText("Completed independently");
});

test("the Azulejos case, finished after the buyer collects the crate", async ({
  page,
}) => {
  await openCase(page, "vanishing-azulejos");
  await send(page, LISBON);
  await solveLisbon(page);
  await cite(page, "LIS-0486", "manifest");
  await press(draft(page).getByRole("button", { name: /Rule out this lead/ }));

  await openTool(page, "Case");
  await press(page.getByRole("button", { name: "Let the deadline pass…" }));
  await press(
    page.getByRole("button", { name: "Let the deadline pass", exact: true }),
  );
  await expect(clock(page)).toContainText("Buyer has collected the crate");
  await expect(clock(page)).toContainText("Continuing untimed");

  // A reload keeps the late state with the evidence and both drafts.
  await page.reload();
  await expect(clock(page)).toContainText("Buyer has collected the crate");
  await press(draft(page).getByRole("tab", { name: /LIS-0417/ }));
  await expect(
    draft(page).locator(".claim[data-status=supported]"),
  ).toHaveCount(2);
  await expect(
    draft(page).getByRole("tab", { name: /LIS-0486/ }),
  ).toContainText("ruled out");

  // After the deadline the solution is free to view.
  await openTool(page, "Hints");
  await press(page.getByRole("button", { name: "View the solution (free)" }));
  await expect(page.getByTestId("reference-solution")).toContainText(
    "departingShipments",
  );

  await press(draft(page).getByRole("button", { name: "Travel (free)" }));
  await expect(page.locator(".casebar")).toContainText("Angola");
  await solveLuanda(page);
  await press(draft(page).getByRole("button", { name: "Submit deduction" }));

  await expect(
    page.getByRole("heading", { name: "Resolved after the deadline" }),
  ).toBeVisible();
  await expect(page.getByTestId("stamp")).toHaveText("COLLECTED");
  await expect(
    page.getByText("The buyer has collected the crate."),
  ).toBeVisible();

  await page.goto("./#/");
  const file = page.locator(".case", { hasText: "The Vanishing Azulejos" });
  await expect(file).toContainText("Completed with the solution revealed");
  await expect(file).toContainText("Resolved after the deadline");
});
