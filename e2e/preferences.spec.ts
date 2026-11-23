import { expect, test, type Page } from "@playwright/test";
import {
  expectClean,
  openCase,
  press,
  transmit,
  watchPage,
  writeQuery,
  type PageWatch,
} from "./helpers.ts";

let watch: PageWatch;

test.beforeEach(async ({ page, baseURL }) => {
  watch = await watchPage(page, baseURL ?? "");
});

test.afterEach(() => {
  expectClean(watch);
});

async function editorText(page: Page, testId: string): Promise<string> {
  return page.getByTestId(testId).evaluate((element) =>
    (
      element as HTMLElement & {
        cmView: { state: { doc: { toString(): string } } };
      }
    ).cmView.state.doc.toString(),
  );
}

async function setEditor(page: Page, testId: string, text: string) {
  await page.getByTestId(testId).evaluate((element, value) => {
    const view = (
      element as HTMLElement & {
        cmView: {
          state: { doc: { length: number } };
          dispatch(spec: unknown): void;
        };
      }
    ).cmView;
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: value },
    });
  }, text);
}

const PASS = `query { country(name: "Portugal") { name capital } }`;
const MISS = `query { city(name: "Lisbon") { name } }`;

test("the Vim keybindings switch is kept and works in every mode", async ({
  page,
}) => {
  await page.goto("./#/training");
  const toggle = page.getByRole("switch", { name: "Vim keybindings" });
  const mode = page.getByTestId("vim-mode");
  const query = page.getByRole("textbox", { name: "GraphQL query" });
  await expect(toggle).not.toBeChecked();
  await expect(mode).toHaveCount(0);

  // Turning it on keeps the text and shows the mode.
  await writeQuery(page, PASS);
  await toggle.check();
  await expect(mode).toHaveText("Vim: normal mode");
  expect(await editorText(page, "query-editor")).toBe(PASS);

  // The transmit shortcut works in normal mode.
  await transmit(page);
  await expect(page.getByTestId("stamp")).toHaveText("Passed");

  // Vim keys move between modes.
  await query.focus();
  await query.press("i");
  await expect(mode).toHaveText("Vim: insert mode");
  await query.press("x");
  expect(await editorText(page, "query-editor")).toBe(`x${PASS}`);
  await query.press("Escape");
  await expect(mode).toHaveText("Vim: normal mode");

  // And in insert mode.
  await query.press("i");
  await expect(mode).toHaveText("Vim: insert mode");
  await writeQuery(page, MISS);
  await query.press("ControlOrMeta+Enter");
  await expect(page.getByText("Not yet.")).toBeVisible();

  // Tab leaves the editor.
  await query.press("Escape");
  await query.press("Tab");
  await expect(query).not.toBeFocused();

  // The choice holds after a reload and in a case.
  await page.reload();
  await expect(toggle).toBeChecked();
  await expect(mode).toHaveText("Vim: normal mode");
  await openCase(page, "vanishing-azulejos");
  await expect(toggle).toBeChecked();
  await expect(mode).toHaveText("Vim: normal mode");

  // It is kept when progress is reset.
  await page.goto("./#/settings");
  await press(page.getByRole("button", { name: "Reset progress…" }));
  await press(page.getByTestId("reset-confirm"));
  await expect(page.getByText("Progress cleared.")).toBeVisible();
  await expect(toggle).toBeChecked();

  // Off is kept too.
  await toggle.uncheck();
  await page.reload();
  await expect(toggle).not.toBeChecked();
  await openCase(page, "vanishing-azulejos");
  await expect(toggle).not.toBeChecked();
  await expect(mode).toHaveCount(0);
});

const BEFORE = [
  "vanishing-azulejos",
  "borrowed-chronometer",
  "guest-register",
  "quiet-consignee",
  "three-couriers",
  "bound-ledgers",
  "the-paymaster",
  "lantern-export",
];

const DEPARTURES = `query Departures($city: String!) {
  city(name: $city) {
    departingShipments { id manifest }
  }
}`;

test("each response is labelled with the variables it was sent with", async ({
  page,
}) => {
  await page.goto("./");
  await page.evaluate((missions) => {
    localStorage.setItem(
      "dossierql:save",
      JSON.stringify({
        format: 1,
        events: missions.map((missionId) => ({
          type: "completed",
          missionId,
          mode: "independent",
          late: false,
        })),
        investigations: {},
      }),
    );
  }, BEFORE);
  // The game reads the save once, as it starts.
  await page.reload();
  await openCase(page, "forwarding-address");
  const label = page.getByTestId("sent-with");

  await writeQuery(page, DEPARTURES);
  await transmit(page);
  await expect(page.getByText("Transmission 1 of 1")).toBeVisible();
  await expect(label).toHaveText(
    'You sent this request with the variables { "city": "Trieste" }.',
  );

  // A request sent with no variables has no label.
  await setEditor(page, "variables-editor", "");
  await writeQuery(page, `query { city(name: "Trieste") { name } }`);
  await transmit(page);
  await expect(page.getByText("Transmission 2 of 2")).toBeVisible();
  await expect(label).toHaveCount(0);

  // An earlier response keeps its own label.
  await press(page.getByRole("button", { name: "Earlier" }));
  await expect(label).toContainText('{ "city": "Trieste" }');

  // The variables panel is an editor too: it transmits and takes Vim keys.
  await setEditor(page, "variables-editor", '{ "city": "Istanbul" }');
  await writeQuery(page, DEPARTURES);
  const variables = page.getByRole("textbox", { name: "Variables (JSON)" });
  await variables.focus();
  await variables.press("ControlOrMeta+Enter");
  await expect(page.getByText("Transmission 3 of 3")).toBeVisible();
  await expect(label).toContainText('{ "city": "Istanbul" }');
  await page.getByRole("switch", { name: "Vim keybindings" }).check();
  await expect(page.getByTestId("vim-mode")).toHaveCount(2);
});
