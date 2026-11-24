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

  // The case names its quarry, so the courier's dossier comes first.
  await openTool(page, "Dossiers");
  await expect(page.getByTestId("quarry")).toBeVisible();

  // Stage 1: three files under aliases identify the courier.
  await send(page, COURIERS);
  await expect(page.getByTestId("quarry")).toContainText("GREY_PETREL");
  await choose(page, "Courier", "SABLE_IBIS");
  await submit(page, /^Rule out/);
  await choose(page, "Courier", "TIN_FALCON");
  await submit(page, /^Rule out/);
  await choose(page, "Courier", "GREY_PETREL");
  await submit(page, "Submit deduction");
  await expect(
    page.getByText(/three\s+sightings filed under GREY_PETREL/).first(),
  ).toBeVisible();

  // Stage 2: the three sightings are on the board and the map before any
  // transmission at this stage.
  await openTool(page, "Case");
  await expect(
    page.getByTestId("case-board").locator(".board__lead"),
  ).toHaveCount(3);
  await openTool(page, "Map");
  const leads = page.getByTestId("map-leads");
  await expect(leads.locator("li")).toHaveCount(3);
  await expect(leads.locator("li").nth(1)).toContainText(
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
  await choose(page, "Sighting", "SGT-052");
  await submit(page, /^Rule out/);
  await expect(draft(page)).toContainText("code MWK");
  await choose(page, "Sighting", "SGT-051");
  // Until the form has a country, the journey has no price, because the
  // price of the next stage's journey would give the answer away.
  await expect(draft(page).getByRole("button", { name: /^Travel/ })).toHaveText(
    "Travel",
  );
  await choose(page, "Country of the sighting", "ZM");
  await expect(
    draft(page).getByRole("button", { name: /^Travel/ }),
  ).toContainText("hours");
  await submit(page, /^Travel/);

  // The player lands just after the courier has left.
  await expect(
    page.getByText(/left an hour before your\s+plane came in/).first(),
  ).toBeVisible();
  await expect(page.getByText(/lodged three payments/).first()).toBeVisible();
});
