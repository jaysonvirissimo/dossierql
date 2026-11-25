import { expect, test } from "@playwright/test";
import {
  choose,
  draft,
  expectClean,
  openCase,
  openTool,
  seedCompleted,
  send,
  submit,
  TO_CLEARANCE_3,
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

const COURIERS = `query {
  petrel: operative(codename: "GREY_PETREL") { codename organization { name } knownAssociates { codename } }
  ibis: operative(codename: "SABLE_IBIS") { codename organization { name } knownAssociates { codename } }
  falcon: operative(codename: "TIN_FALCON") { codename organization { name } knownAssociates { codename } }
}`;

const PHIRI = `query {
  coverName(name: "T. Phiri") {
    name
    operative { codename coverNames { name } }
    sightings { id city { name country { name borders { name } currency { code name } } } }
  }
}`;

const TRAIL = `query {
  operative(codename: "GREY_PETREL") {
    codename
    sightings { id city { name country { name borders { name } currency { code name } } } }
  }
}`;

test("the early pursuit identifies the courier, then catches up with him (SDD 3.4)", async ({
  page,
}) => {
  await seedCompleted(page, [...TO_CLEARANCE_3]);
  await openCase(page, "three-couriers");

  // Stage 1 asks which courier is the quarry, so the Dossiers tab does not
  // say, before or after the three files come back.
  await openTool(page, "Dossiers");
  await expect(page.getByTestId("quarry")).toHaveCount(0);

  // Stage 1: three files under aliases identify the courier.
  await send(page, COURIERS);
  await expect(
    page.locator(".dossier h3", { hasText: "GREY_PETREL" }),
  ).toBeVisible();
  await expect(page.getByTestId("quarry")).toHaveCount(0);
  await choose(page, "Courier", "SABLE_IBIS");
  await submit(page, /^Rule out/);
  await choose(page, "Courier", "TIN_FALCON");
  await submit(page, /^Rule out/);
  await choose(page, "Courier", "GREY_PETREL");
  await submit(page, "Submit deduction");
  await expect(
    page.getByText(/three\s+sightings filed under GREY_PETREL/).first(),
  ).toBeVisible();

  // Once the deduction has identified the courier, his dossier comes first.
  await openTool(page, "Dossiers");
  await expect(page.getByTestId("quarry")).toContainText("GREY_PETREL");
  await expect(page.locator(".dossier").first()).toHaveAttribute(
    "data-testid",
    "quarry",
  );

  // Stage 2: the three sightings are on the board and the map before any
  // transmission at this stage.
  await openTool(page, "Case");
  await expect(
    page.getByTestId("case-board").locator(".board__lead"),
  ).toHaveCount(3);
  await openTool(page, "Map");
  const leads = page.getByTestId("map-leads");
  await expect(leads.locator("li")).toHaveCount(3);
  await expect(leads.locator("li").nth(0)).toContainText(
    "The Lilongwe sighting, in Lilongwe, Malawi",
  );
  // In the narrow tools panel the map still frames every lead by name, in
  // type that can be read, and is tall enough to see the region.
  const map = page.locator("svg.map");
  await expect(map.locator("text")).toHaveCount(3);
  const layout = await map.evaluate((svg) => {
    const frame = svg.getBoundingClientRect();
    return {
      height: frame.height,
      labels: [...svg.querySelectorAll("text")].map((text) => {
        const box = text.getBoundingClientRect();
        return {
          name: text.textContent,
          inside:
            box.left >= frame.left &&
            box.right <= frame.right &&
            box.top >= frame.top &&
            box.bottom <= frame.bottom,
          height: box.height,
        };
      }),
    };
  });
  expect(layout.height).toBeGreaterThanOrEqual(240);
  for (const label of layout.labels) {
    expect(label.inside, `${label.name ?? ""} is inside the map`).toBe(true);
    expect(label.height, `${label.name ?? ""} can be read`).toBeGreaterThan(11);
  }

  await send(page, TRAIL);
  await choose(page, "Sighting", "SGT-053");
  await submit(page, /^Rule out/);
  await expect(draft(page)).toContainText("nobody crosses into them by land");
  // A lead can also be struck off from its card on the case board. The true
  // lead's card offers the button too, and the archive refuses it at no cost.
  await openTool(page, "Case");
  const board = page.getByTestId("case-board");
  await board
    .getByTestId("lead-SGT-052")
    .getByRole("button", { name: /^Rule out/ })
    .click();
  await expect(board.getByTestId("lead-SGT-052")).toContainText(
    "cannot be ruled out",
  );
  await board
    .getByTestId("lead-SGT-054")
    .getByRole("button", { name: /^Rule out/ })
    .click();
  await expect(board.getByTestId("lead-SGT-054")).toHaveAttribute(
    "data-status",
    "ruled-out",
  );
  await expect(draft(page)).toContainText("code KES");
  // Until the form has a country, the journey has no price, because the
  // price of the next stage's journey would give the answer away.
  await choose(page, "Sighting", "SGT-052");
  await expect(draft(page).getByRole("button", { name: /^Travel/ })).toHaveText(
    "Travel",
  );
  // The map chooses a lead on the form, with the country it points to. A
  // struck lead offers no choice.
  await openTool(page, "Map");
  await expect(
    page.getByTestId("map-leads").locator("li").nth(1).getByRole("button"),
  ).toHaveCount(0);
  await page
    .getByTestId("map-leads")
    .locator("li")
    .first()
    .getByRole("button", { name: "Choose on the form" })
    .click();
  await expect(draft(page).getByLabel("Country of the sighting")).toHaveValue(
    "MW",
  );
  await expect(
    draft(page).getByRole("button", { name: /^Travel/ }),
  ).toContainText("hours");
  await submit(page, /^Travel/);

  // Lilongwe: the courier has gone on, under a new name, which the dossier
  // now holds once a response returns it.
  await expect(
    page.getByText(/signed the\s+bureau's book as T\. Phiri/).first(),
  ).toBeVisible();
  await send(page, PHIRI);
  await openTool(page, "Dossiers");
  await expect(page.getByTestId("quarry")).toContainText("T. Phiri");
  await openTool(page, "Case");
  const next = page.getByTestId("case-board");
  await expect(next.locator(".board__lead")).toHaveCount(2);
  await next
    .getByTestId("lead-SGT-055")
    .getByRole("button", { name: /^Rule out/ })
    .click();
  await expect(next.getByTestId("lead-SGT-055")).toHaveAttribute(
    "data-status",
    "ruled-out",
  );
  await choose(page, "Sighting", "SGT-051");
  await choose(page, "Country of the sighting", "ZM");
  await submit(page, /^Travel/);

  // Lusaka: the player lands just after the courier has left, and the map
  // shows both journeys.
  await expect(
    page.getByText(/left an hour before your\s+plane came in/).first(),
  ).toBeVisible();
  await expect(page.getByText(/lodged three payments/).first()).toBeVisible();
  await openTool(page, "Map");
  await expect(page.getByTestId("route")).toContainText("Tanzania to Malawi");
  await expect(page.getByTestId("route")).toContainText("Malawi to Zambia");
});

const BORDERS_ONLY = `query {
  operative(codename: "GREY_PETREL") {
    sightings { id city { name country { name borders { name } } } }
  }
}`;

test("a field check on a wrong turn is drawn as a visit, and the player stays put (SDD 3.5)", async ({
  page,
}) => {
  await seedCompleted(page, [...TO_CLEARANCE_3]);
  await openCase(page, "three-couriers");
  await send(page, COURIERS);
  await choose(page, "Courier", "SABLE_IBIS");
  await submit(page, /^Rule out/);
  await choose(page, "Courier", "TIN_FALCON");
  await submit(page, /^Rule out/);
  await choose(page, "Courier", "GREY_PETREL");
  await submit(page, "Submit deduction");

  // The borders alone leave Nairobi half proved: Kenya borders Tanzania,
  // and nothing yet says which currency the receipt was for.
  // The travel order waits until the other sightings are ruled out, so the
  // card on the case board offers the check, at the price it shows.
  await send(page, BORDERS_ONLY);
  await openTool(page, "Case");
  const nairobi = page.getByTestId("lead-SGT-054");
  await expect(nairobi.getByTestId("lead-prices")).toContainText(
    "A field check sends someone to the place",
  );
  await nairobi.getByRole("button", { name: /Order a field check/ }).click();
  await expect(nairobi).toHaveAttribute("data-status", "field-checked");
  await expect(draft(page)).toContainText("Kenyan shilling");

  // The map draws the visit out and back, and the player is still in
  // Tanzania.
  await openTool(page, "Map");
  await expect(page.locator(".tools__panel")).toContainText(
    "You are in Tanzania.",
  );
  await expect(page.getByTestId("map-visit")).toHaveCount(1);
  await expect(page.getByTestId("route")).toContainText(
    "A field check from Tanzania to Nairobi, Kenya, and back",
  );
});
