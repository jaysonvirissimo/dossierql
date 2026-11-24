import { expect, test, type Page } from "@playwright/test";
import {
  expectClean,
  openCase,
  press,
  seedCompleted,
  setEditor,
  TO_CLEARANCE_5,
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

const DEPARTURES = `query Departures($city: String!) {
  city(name: $city) {
    departingShipments { id manifest }
  }
}`;

test("each response is labelled with the variables it was sent with", async ({
  page,
}) => {
  await seedCompleted(page, TO_CLEARANCE_5);
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

function soundRequests(page: Page): string[] {
  const urls: string[] = [];
  page.on("request", (request) => {
    if (request.url().endsWith(".mp3")) urls.push(request.url());
  });
  return urls;
}

test("buttons sound from the game's own files, and the switch silences them (SDD 8.1)", async ({
  page,
  baseURL,
}) => {
  const sounds = soundRequests(page);
  await openCase(page, "vanishing-azulejos");
  // Sound is on at first. A press by mouse and a press by keyboard each load
  // the transmit switch from the game's own sounds folder.
  const toggle = page.getByTestId("sound-toggle");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await page.getByTestId("transmit").click();
  await expect
    .poll(() => sounds.some((url) => url.endsWith("/sounds/kvm-switch.mp3")))
    .toBe(true);
  for (const url of sounds) {
    expect(url.startsWith(new URL("sounds/", baseURL).href)).toBe(true);
  }

  // The switch at the top of the page turns sound off, and it stays off.
  await press(toggle);
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await page.reload();
  await expect(page.getByTestId("sound-toggle")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await page.goto("./#/settings");
  await expect(page.getByTestId("sound-switch")).not.toBeChecked();
});

test("with sound off, no sound is loaded", async ({ page }) => {
  await page.goto("./#/settings");
  // The switch clicks as it goes off. Only what follows is counted.
  await page.getByTestId("sound-switch").uncheck();
  await page.reload();
  await expect(page.getByTestId("sound-switch")).not.toBeChecked();
  const sounds = soundRequests(page);
  await openCase(page, "vanishing-azulejos");
  await page.getByTestId("transmit").click();
  await press(page.getByTestId("transmit"));
  // A sound would have been asked for at the press, so a short wait shows
  // that none was.
  await page.waitForTimeout(300);
  expect(sounds).toEqual([]);
});
