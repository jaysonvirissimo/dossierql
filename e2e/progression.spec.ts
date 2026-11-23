import { expect, test } from "@playwright/test";
import {
  clock,
  draft,
  expectClean,
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

const CONSIGNEE = `query {
  shipment(id: "VAL-0733") {
    shipper { name director { codename } }
    consignee { name director { codename } }
  }
}`;

test("a player who knows GraphQL is promoted by placement", async ({
  page,
}) => {
  await page.goto("./#/");
  await expect(page.locator(".shell-bar__rank")).toHaveText("Clearance 1");
  const locked = page.locator(".case", { hasText: "Three Couriers" });
  await expect(locked).toContainText("Locked: needs clearance 3");

  // The level 2 assessment is open to anyone. It waits in the placement
  // group, and is marked as a placement.
  await press(page.locator(".placements summary"));
  const assessment = page.locator(".case", { hasText: "The Quiet Consignee" });
  await expect(assessment).toContainText("Placement");
  await page.goto("./#/mission/quiet-consignee");
  await expect(
    page.getByText(/attempting this assessment as a placement/),
  ).toBeVisible();
  await expect(page.getByText(/archive as seen at clearance 2/)).toBeVisible();
  await press(page.getByRole("button", { name: "Open the terminal" }));

  // An assessment opens with a blank editor.
  await expect(page.getByRole("textbox", { name: "GraphQL query" })).toHaveText(
    "",
  );

  // The terminal runs against clearance 2: Company.director exists here.
  await send(page, CONSIGNEE);
  await expect(page.locator(".errors")).toHaveCount(0);
  const consignee = page.locator(".finding").filter({
    has: page.locator(":scope > .finding__row .finding__name", {
      hasText: /^consignee$/,
    }),
  });
  await press(
    consignee
      .locator(":scope > .finding__row")
      .getByRole("button", { name: /^Cite (.* → )?consignee(,|$)/ }),
  );
  // A row that names a company opens the draft for that company.
  await expect(
    draft(page).getByRole("tab", { name: "Meridian Freight" }),
  ).toHaveAttribute("aria-selected", "true");
  await press(
    consignee
      .locator(".finding__nested")
      .getByRole("button", { name: /^Cite (.* → )?director(,|$)/ }),
  );
  await draft(page)
    .getByRole("combobox", { name: "Director" })
    .selectOption("PEWTER_SWIFT");
  await expect(
    draft(page).locator(".claim[data-status=supported]"),
  ).toHaveCount(2);
  await press(draft(page).getByRole("button", { name: "Submit deduction" }));

  await expect(page.getByTestId("stamp")).toHaveText("HELD");
  await expect(
    page.getByText(/Placement passed. You now hold clearance 3/),
  ).toBeVisible();
  await expect(page.locator(".shell-bar__rank")).toHaveText("Clearance 3");

  // Placement grants the cards for the levels skipped, and opens their cases.
  await page.goto("./#/manual");
  const cards = page.locator(".cards");
  await expect(cards.locator(".card--sealed")).toHaveCount(3);
  await expect(cards.locator(".card:not(.card--sealed)")).toHaveCount(2);
  await page.goto("./#/");
  await expect(
    page.locator(".case", { hasText: "Three Couriers" }),
  ).not.toContainText("Locked");
  // The desk points a promoted player at the new level.
  await expect(page.locator(".case--next")).toHaveCount(1);
  await expect(page.locator(".case--next")).toContainText("Three Couriers");
  await expect(
    page.locator(".case", { hasText: "The Paymaster" }),
  ).toContainText("Locked: needs clearance 4");
});

test("a placement finished with the solution revealed does not promote", async ({
  page,
}) => {
  await openCase(page, "quiet-consignee");
  await openTool(page, "Hints");
  await press(page.getByRole("button", { name: /^View the solution/ }));
  await expect(page.getByTestId("reference-solution")).toBeVisible();
  await send(page, CONSIGNEE);
  await page
    .getByLabel("Open a lead")
    .selectOption({ label: "Meridian Freight" });
  const consignee = page.locator(".finding").filter({
    has: page.locator(":scope > .finding__row .finding__name", {
      hasText: /^consignee$/,
    }),
  });
  await press(
    consignee
      .locator(":scope > .finding__row")
      .getByRole("button", { name: /^Cite (.* → )?consignee(,|$)/ }),
  );
  await press(
    consignee
      .locator(".finding__nested")
      .getByRole("button", { name: /^Cite (.* → )?director(,|$)/ }),
  );
  await draft(page)
    .getByRole("combobox", { name: "Director" })
    .selectOption("PEWTER_SWIFT");
  await press(draft(page).getByRole("button", { name: "Submit deduction" }));

  await expect(page.getByText(/does not promote you/)).toBeVisible();
  await expect(page.locator(".shell-bar__rank")).toHaveText("Clearance 1");
});

test("a later case ends at its deadline and can be restarted", async ({
  page,
}) => {
  await openCase(page, "borrowed-chronometer");
  await openTool(page, "Case");
  await press(page.getByRole("button", { name: "Let the deadline pass…" }));
  await press(
    page.getByRole("button", { name: "Let the deadline pass", exact: true }),
  );
  await expect(page.getByRole("alert")).toContainText("this attempt is closed");
  await expect(page.getByTestId("transmit")).toBeDisabled();
  await openTool(page, "Hints");
  await expect(
    page.getByRole("button", { name: "View the solution (free)" }),
  ).toBeVisible();
  await press(
    page
      .getByRole("alert")
      .getByRole("button", { name: "Restart the investigation" }),
  );
  await expect(
    page.getByRole("button", { name: "Open the terminal" }),
  ).toBeVisible();
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
    consignee { name director { codename organization { name } } }
  }
}`;

test("a case with a clock: rule out a lead, check another, and run out of time", async ({
  page,
}) => {
  await openCase(page, "bound-ledgers");
  await expect(clock(page)).toContainText("17 of 17 hours left");
  await send(page, LEDGERS);
  await expect(clock(page)).toContainText("16 of 17 hours left");

  // Rule out one wrong lead, free.
  await press(
    record(page, "MPM-0144").getByRole("button", {
      name: /^Cite (.* → )?finding,/,
    }),
  );
  await expect(
    draft(page).getByRole("tab", { name: "MPM-0144" }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(draft(page)).toContainText("Contradicted");
  await press(draft(page).getByRole("button", { name: /Rule out this lead/ }));
  await expect(draft(page)).toContainText("the inspector has borrowed one");
  await expect(draft(page)).toContainText("no time spent");
  await expect(clock(page)).toContainText("16 of 17 hours left");

  // A different lead with one supported claim and one unverified: field check.
  await press(
    record(page, "MBA-0102").getByRole("button", {
      name: /^Cite (.* → )?finding,/,
    }),
  );
  await expect(
    draft(page).getByRole("tab", { name: "MBA-0102" }),
  ).toHaveAttribute("aria-selected", "true");
  const check = draft(page).getByRole("button", {
    name: /Order a field check/,
  });
  await expect(check).toContainText("2 hours");
  await press(check);
  await expect(draft(page)).toContainText(
    "asks who directs the company collecting them",
  );
  await expect(clock(page)).toContainText("14 of 17 hours left");
  await expect(page.getByRole("heading", { name: "Deduction" })).toBeVisible();

  // A reload keeps the clock and the history of both leads.
  await page.reload();
  await expect(clock(page)).toContainText("14 of 17 hours left");
  await openTool(page, "Case");
  await expect(page.locator(".dispatches")).toContainText(
    "ruled out · MPM-0144",
  );
  await expect(page.locator(".dispatches")).toContainText(
    "field check · MBA-0102",
  );

  // The deadline ends the attempt.
  await press(page.getByRole("button", { name: "Let the deadline pass…" }));
  await press(
    page.getByRole("button", { name: "Let the deadline pass", exact: true }),
  );
  await expect(page.getByRole("alert")).toContainText("this attempt is closed");
  await expect(page.getByTestId("transmit")).toBeDisabled();
});

test("aliases bring three files back in one transmission", async ({ page }) => {
  // Reach clearance 3 the quick way, then open the aliases case.
  await openCase(page, "bound-ledgers");
  await page.goto("./#/mission/three-couriers");
  await expect(page.getByText(/needs clearance 3/)).toBeVisible();

  await openCase(page, "quiet-consignee");
  await send(page, CONSIGNEE);
  await page
    .getByLabel("Open a lead")
    .selectOption({ label: "Meridian Freight" });
  const consignee = page.locator(".finding").filter({
    has: page.locator(":scope > .finding__row .finding__name", {
      hasText: /^consignee$/,
    }),
  });
  await press(
    consignee
      .locator(":scope > .finding__row")
      .getByRole("button", { name: /^Cite (.* → )?consignee(,|$)/ }),
  );
  await press(
    consignee
      .locator(".finding__nested")
      .getByRole("button", { name: /^Cite (.* → )?director(,|$)/ }),
  );
  await draft(page)
    .getByRole("combobox", { name: "Director" })
    .selectOption("PEWTER_SWIFT");
  await press(draft(page).getByRole("button", { name: "Submit deduction" }));
  await expect(page.locator(".shell-bar__rank")).toHaveText("Clearance 3");

  await openCase(page, "three-couriers");
  // Asking the same field twice is returned by the clerk with a note.
  await send(
    page,
    `query {
  operative(codename: "SABLE_IBIS") { codename }
  operative(codename: "GREY_PETREL") { codename }
}`,
  );
  await expect(page.getByText(/an alias in front of each one/)).toBeVisible();
  await expect(page.getByText("No time was spent.")).toBeVisible();

  await send(
    page,
    `query {
  petrel: operative(codename: "GREY_PETREL") {
    codename organization { name } handler { codename }
    lastKnownLocation { name country { name borders { name } } }
  }
  ibis: operative(codename: "SABLE_IBIS") { codename organization { name } }
}`,
  );
  // A classified entry comes back empty beside the rest of the data.
  await expect(
    page.getByText("Operative.handler is classified above your clearance."),
  ).toBeVisible();
  await expect(
    page.getByText(/Everything else in the response is good/),
  ).toBeVisible();
  await expect(
    record(page, "GREY_PETREL").or(page.locator(".findings__root").first()),
  ).toBeVisible();
  await press(page.getByRole("tab", { name: "Raw response" }));
  await expect(page.getByTestId("raw-response")).toContainText(
    '"handler": null',
  );
  await expect(page.getByTestId("raw-response")).toContainText('"petrel"');
});
