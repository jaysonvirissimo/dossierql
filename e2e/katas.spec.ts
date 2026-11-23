import { expect, test, type Page } from "@playwright/test";
import {
  expectClean,
  press,
  seedCompleted,
  send,
  setEditor,
  TO_CLEARANCE_3,
  TO_CLEARANCE_5,
  transmit,
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

function katas(page: Page) {
  return page.getByRole("list", { name: "Katas" });
}

async function openKata(page: Page, title: string) {
  await page.goto("./#/training");
  await press(katas(page).getByRole("link", { name: title }));
  await expect(
    page.getByRole("heading", { name: title }).first(),
  ).toBeVisible();
}

test("a new analyst sees the katas locked, without their titles", async ({
  page,
}) => {
  await page.goto("./#/training");
  await expect(katas(page).getByText(/^Opens at clearance/)).toHaveCount(3);
  await expect(katas(page).getByRole("link")).toHaveCount(0);
  await expect(katas(page)).not.toContainText("variables");

  await page.goto("./#/training/kata/variables");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Kata");
  await expect(
    page.getByText("This kata opens at clearance 5. You hold clearance 1."),
  ).toBeVisible();
  await expect(page.getByTestId("query-editor")).toHaveCount(0);
});

const ALIASED = `query {
  chile: country(name: "Chile") { capital }
  peru: country(name: "Peru") { capital }
}`;

test("the aliases kata passes only a request that uses aliases", async ({
  page,
}) => {
  await seedCompleted(page, TO_CLEARANCE_3);
  await page.goto("./#/training");
  await expect(katas(page).getByRole("link")).toHaveCount(1);
  await openKata(page, "Two lookups in one transmission");
  const stamp = page.getByTestId("stamp");
  const notYet = page.getByTestId("not-yet");

  // Every country returns both capitals, but that is not two lookups.
  await send(page, `query { countries { name capital } }`);
  await expect(notYet).toContainText("The response holds both capitals");
  await expect(stamp).toHaveCount(0);

  // One lookup misses a capital.
  await send(page, `query { country(name: "Peru") { capital } }`);
  await expect(notYet).toContainText("The response needs the capital");

  await send(page, ALIASED);
  await expect(stamp).toHaveText("Passed");
  await expect(page.getByTestId("raw-response")).toContainText('"peru"');
  // A request with no variables has no variables label.
  await expect(page.getByTestId("sent-with")).toHaveCount(0);
  // Only the variables kata has a variables panel.
  await expect(page.getByTestId("variables-editor")).toHaveCount(0);

  // A kata earns no rank, and the pass survives a reload.
  await expect(page.locator(".shell-bar__rank")).toHaveText("Clearance 3");
  await page.reload();
  await expect(katas(page).locator(".chip")).toHaveText("Passed");
  await page.goto("./");
  await expect(page.getByTestId("katas-chip")).toHaveText("1 of 1 kata passed");
});

const FRAGMENT_BESIDE = `query {
  argentina: country(name: "Argentina") { ...Profile currency { name } }
  uruguay: country(name: "Uruguay") { ...Profile currency { name } }
}
fragment Profile on Country { name capital }`;

const FRAGMENT_SHARED = `query {
  argentina: country(name: "Argentina") { ...Profile }
  uruguay: country(name: "Uruguay") { ...Profile }
}
fragment Profile on Country { name capital currency { name } }`;

test("the fragments kata asks for the field inside the fragment", async ({
  page,
}) => {
  await seedCompleted(page, TO_CLEARANCE_5);
  await openKata(page, "Add a field in one place");
  await send(page, FRAGMENT_BESIDE);
  await expect(page.getByTestId("not-yet")).toContainText(
    "The response holds both currencies",
  );
  await send(page, FRAGMENT_SHARED);
  await expect(page.getByTestId("stamp")).toHaveText("Passed");
});

test("the variables kata passes when only the variables change", async ({
  page,
}) => {
  await seedCompleted(page, TO_CLEARANCE_5);
  await openKata(page, "Change only the variables");
  const notYet = page.getByTestId("not-yet");
  const label = page.getByTestId("sent-with");

  // The starter returns Valparaíso.
  await transmit(page);
  await expect(page.getByTestId("raw-response")).toContainText("Chile");
  await expect(label).toHaveText(
    'You sent this request with the variables { "city": "Valparaíso" }.',
  );
  await expect(notYet).toContainText("The response needs the city of Busan");

  // Busan typed into the query has the facts and not the technique.
  const starter = await page.getByTestId("query-editor").evaluate((element) =>
    (
      element as HTMLElement & {
        cmView: { state: { doc: { toString(): string } } };
      }
    ).cmView.state.doc.toString(),
  );
  await send(
    page,
    `query { city(name: "Busan") { name country { name capital } } }`,
  );
  await expect(notYet).toContainText("you typed the city into the query");
  // That request declared no variable, so it carries no variables label.
  await expect(label).toHaveCount(0);

  // Text that is not a JSON object is returned unsent.
  await setEditor(page, "variables-editor", "Busan");
  await send(page, starter);
  await expect(
    page.getByText("The variables panel does not hold a JSON object"),
  ).toBeVisible();

  await setEditor(page, "variables-editor", '{ "city": "Busan" }');
  const variables = page.getByRole("textbox", { name: "Variables (JSON)" });
  await variables.focus();
  await variables.press("ControlOrMeta+Enter");
  await expect(page.getByTestId("stamp")).toHaveText("Passed");
  await expect(page.getByTestId("raw-response")).toContainText("South Korea");
  await expect(label).toContainText('{ "city": "Busan" }');
});
