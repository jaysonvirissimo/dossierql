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
  watchPage,
  writeQuery,
  type PageWatch,
  readDebrief,
} from "./helpers.ts";

let watch: PageWatch;

test.beforeEach(async ({ page, baseURL }) => {
  watch = await watchPage(page, baseURL ?? "");
});

test.afterEach(() => {
  expectClean(watch);
});

const NIGHTJAR = `query {
  operative(codename: "NIGHTJAR") {
    coverNames { name }
    sightings {
      id
      nameGiven { name }
      city { name country { name languages { name } } }
    }
  }
}`;

const D_LUND = `query {
  coverName(name: "D. Lund") { name operative { codename } sightings { id } }
}`;

const DINNER = `query {
  city(name: "Zanzibar City") {
    sightings { id note nameGiven { name operative { codename } } }
  }
}`;

test("the leads are on the map before departure, and the debrief replays the deduction", async ({
  page,
}) => {
  await seedCompleted(page, ["vanishing-azulejos", "borrowed-chronometer"]);
  await openCase(page, "guest-register");

  // Before the first transmission, the board and the map list all three.
  const board = page.getByTestId("case-board");
  await expect(board.locator(".board__lead")).toHaveCount(3);
  await expect(page.getByTestId("lead-SGT-027")).toContainText(
    "Mombasa, Kenya · a journey of 3 hours",
  );
  await expect(page.getByTestId("lead-SGT-027")).toContainText(
    "Your responses hold no fact about this lead yet.",
  );
  await openTool(page, "Map");
  const leads = page.getByTestId("map-leads");
  await expect(leads.locator("li")).toHaveText([
    "The Mombasa sighting, in Mombasa, Kenya: 3 hours · In contention",
    "The Zanzibar City sighting, in Zanzibar City, Tanzania: 3 hours · In contention",
    "The Maputo sighting, in Maputo, Mozambique: 3 hours · In contention",
  ]);

  // An empty editor shows no mark, and a broken query still does.
  await writeQuery(page, "");
  await page.waitForTimeout(1000);
  await expect(page.locator(".cm-lintPoint, .cm-lintRange")).toHaveCount(0);
  await writeQuery(page, "query {");
  await expect(
    page.locator(".cm-lintPoint, .cm-lintRange").first(),
  ).toBeAttached();

  await send(page, NIGHTJAR);
  // The box offers each lead under the label the board gives it.
  await expect(
    draft(page)
      .getByRole("combobox", { name: "Sighting", exact: true })
      .locator('option[value="SGT-031"]'),
  ).toHaveText("The Zanzibar City sighting (SGT-031)");
  await expect(draft(page).getByTestId("destination-note")).toHaveText(
    "A travel order sends you to a country: the one you choose for “Country of the sighting”.",
  );
  await choose(page, "Sighting", "SGT-027");
  await submit(page, /^Rule out/);
  await expect(leads.locator("li").first()).toHaveClass(/journeys__struck/);
  await expect(leads.locator("li").first()).toContainText("Ruled out");
  await openTool(page, "Case");
  await expect(page.getByTestId("lead-SGT-027")).toHaveAttribute(
    "data-status",
    "ruled-out",
  );
  await expect(page.getByTestId("lead-SGT-027")).toContainText(
    "name given: H. Brandt",
  );

  // The order is held while a box is blank, and while Maputo is open.
  await choose(page, "Sighting", "SGT-031");
  const travel = draft(page).getByRole("button", { name: /^Travel/ });
  await expect(travel).toBeDisabled();
  await expect(draft(page).getByTestId("form-hold")).toContainText(
    "Choose a record for “Country of the sighting”",
  );
  await choose(page, "Country of the sighting", "TZ");
  await expect(travel).toBeDisabled();
  await expect(draft(page).getByTestId("form-hold")).toHaveText(
    "The Maputo sighting is still in contention. Rule it out on the case board before you send the travel order.",
  );
  await choose(page, "Sighting", "SGT-034");
  await submit(page, /^Rule out/);
  await choose(page, "Sighting", "SGT-031");
  await expect(draft(page).getByTestId("form-hold")).toHaveCount(0);
  await submit(page, /^Travel/);

  // In Zanzibar City, both cover names stay in contention.
  await expect(page.getByTestId("lead-dr-lund")).toContainText("Dr. Lund");
  await expect(page.getByTestId("lead-d-lund")).toContainText("D. Lund");
  await send(page, D_LUND);
  await expect(page.getByTestId("lead-d-lund")).toContainText(
    "operative: TIN_FALCON",
  );
  await choose(page, "Name in the register", "d-lund");
  await submit(page, /^Rule out/);
  await expect(page.getByTestId("lead-d-lund")).toHaveAttribute(
    "data-status",
    "ruled-out",
  );

  await send(page, DINNER);
  // A field that holds another record says what kind of record it is.
  await expect(
    page.getByRole("group", { name: "name given, a cover name" }).first(),
  ).toBeVisible();
  await choose(page, "Name in the register", "dr-lund");
  await choose(page, "Filed under", "MARBLE_HERON");
  await submit(page);
  await readDebrief(page);

  // The reference asks for two things at once, and the player never did.
  await expect(page.getByTestId("several-fields")).toContainText(
    "The reference solution asks for city and coverName in one transmission.",
  );
  const recap = page.getByTestId("deduction-recap");
  await expect(recap.getByRole("heading", { level: 2 })).toHaveText(
    "How you cracked it",
  );
  await expect(recap).toContainText("You ruled out The Mombasa sighting");
  await expect(recap).toContainText("You ruled out D. Lund");
  await expect(recap).toContainText(
    "The registry files this name under this operative.",
  );
  await expect(recap).toContainText("· transmission 3");
  await expect(recap.locator("pre").last()).toContainText(
    'city(name: "Zanzibar City")',
  );
});
