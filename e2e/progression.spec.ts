import { expect, test } from "@playwright/test";
import {
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

  // The level 2 assessment is open to anyone, and is marked as a placement.
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
  // No lead is open yet, and the game says what to do about it.
  await expect(page.getByText("Open a lead in the draft first")).toBeVisible();
  await page
    .getByLabel("Open a lead")
    .selectOption({ label: "Meridian Freight" });
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
  await expect(page.getByText(/name of its own in front of it/)).toBeVisible();
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
