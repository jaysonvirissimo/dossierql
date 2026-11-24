import { expect, type Locator, type Page } from "@playwright/test";

export interface PageWatch {
  readonly consoleErrors: string[];
  readonly externalRequests: string[];
  /** Requests that could carry a body, such as a player's query. */
  readonly nonGetRequests: string[];
}

/**
 * Records console errors and blocks every request that leaves the site's
 * origin, so the page must work with no CDN, backend, or other host.
 */
export async function watchPage(
  page: Page,
  baseURL: string,
): Promise<PageWatch> {
  const origin = new URL(baseURL).origin;
  const watch: PageWatch = {
    consoleErrors: [],
    externalRequests: [],
    nonGetRequests: [],
  };
  page.on("console", (message) => {
    if (message.type() === "error") watch.consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => {
    watch.consoleErrors.push(error.message);
  });
  await page.route("**/*", async (route) => {
    const request = route.request();
    const url = request.url();
    if (request.method() !== "GET") {
      watch.nonGetRequests.push(`${request.method()} ${url}`);
    }
    if (new URL(url).origin === origin) {
      await route.continue();
      return;
    }
    watch.externalRequests.push(url);
    await route.abort("blockedbyclient");
  });
  return watch;
}

export function expectClean(watch: PageWatch): void {
  expect(watch.externalRequests).toEqual([]);
  expect(watch.nonGetRequests).toEqual([]);
  expect(watch.consoleErrors).toEqual([]);
}

/** Activates a control from the keyboard, as a keyboard player would. */
export async function press(control: Locator): Promise<void> {
  await control.focus();
  await expect(control).toBeFocused();
  await control.press("Enter");
}

/**
 * Replaces the editor's text through its view. Typing fights the editor's
 * bracket closing, so the text is set and the editor is then focused.
 */
export async function writeQuery(page: Page, text: string): Promise<void> {
  await setEditor(page, "query-editor", text);
}

/** Replaces the text of the editor with the test id, such as the variables. */
export async function setEditor(
  page: Page,
  testId: string,
  text: string,
): Promise<void> {
  const host = page.getByTestId(testId);
  await host.evaluate((element, value) => {
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

/**
 * Starts the game with the missions recorded as completed, then reloads,
 * because the game reads the save once, as it starts.
 */
export async function seedCompleted(
  page: Page,
  missions: readonly string[],
): Promise<void> {
  await page.goto("./");
  await page.evaluate((ids) => {
    localStorage.setItem(
      "dossierql:save",
      JSON.stringify({
        format: 1,
        events: ids.map((missionId) => ({
          type: "completed",
          missionId,
          mode: "independent",
          late: false,
        })),
        investigations: {},
      }),
    );
  }, missions);
  await page.reload();
}

/** The missions completed by a player who holds clearance 3, and 5. */
export const TO_CLEARANCE_3 = [
  "vanishing-azulejos",
  "borrowed-chronometer",
  "guest-register",
  "quiet-consignee",
] as const;
export const TO_CLEARANCE_5 = [
  ...TO_CLEARANCE_3,
  "three-couriers",
  "bound-ledgers",
  "the-paymaster",
  "lantern-export",
] as const;
/** Every case of the first campaign, so that its coda is open. */
export const TO_CAMPAIGN_END = [
  ...TO_CLEARANCE_5,
  "forwarding-address",
  "registrars-return",
] as const;
/** Every case through the clearance 6 assessment, and the first coda. */
export const TO_CLEARANCE_7 = [
  ...TO_CAMPAIGN_END,
  "the-receipt",
  "sealed-cabinet",
  "exchange-book",
] as const;

/** Every case through the clearance 7 assessment. */
export const TO_CLEARANCE_8 = [
  ...TO_CLEARANCE_7,
  "valparaiso-draft",
  "station-file",
] as const;

/** Sends the query from inside the editor with the keyboard shortcut. */
export async function transmit(page: Page): Promise<void> {
  const content = page.getByRole("textbox", { name: "GraphQL query" });
  await content.focus();
  await content.press("ControlOrMeta+Enter");
}

export async function send(page: Page, text: string): Promise<void> {
  await writeQuery(page, text);
  await transmit(page);
}

/** The card for one record in the findings, by the name in its heading. */
export function record(page: Page, name: string): Locator {
  return page
    .locator(".finding__record")
    .filter({
      has: page.locator(":scope > .finding__heading", { hasText: name }),
    })
    .first();
}

export function clock(page: Page): Locator {
  return page.getByRole("status", { name: "Mission clock" });
}

export function draft(page: Page): Locator {
  return page.locator("section.draft");
}

/** Chooses a record, by its archive reference, in one box of the form. */
export async function choose(
  page: Page,
  box: string,
  value: string,
): Promise<void> {
  await draft(page)
    .getByRole("combobox", { name: box, exact: true })
    .selectOption(value);
}

/** Presses the form's button: Submit deduction, Travel, or Rule out. */
export async function submit(
  page: Page,
  name: string | RegExp = "Submit deduction",
): Promise<void> {
  await press(
    draft(page).getByRole("button", {
      name,
      ...(typeof name === "string" ? { exact: true } : {}),
    }),
  );
}

export async function openCase(page: Page, missionId: string): Promise<void> {
  await page.goto(`./#/mission/${missionId}`);
  await press(page.getByRole("button", { name: "Open the terminal" }));
  await expect(
    page.getByRole("textbox", { name: "GraphQL query" }),
  ).toBeVisible();
}

export async function openTool(page: Page, name: string): Promise<void> {
  await press(page.getByRole("tab", { name, exact: true }));
}

export const MANIFESTS = `query {
  city(name: "Lisbon") {
    departingShipments {
      id
      manifest
    }
  }
}`;

export const LISBON = `query {
  city(name: "Lisbon") {
    departingShipments {
      id
      manifest
      destination { name country { name borders { name } } }
    }
  }
}`;

export const LUANDA = `query {
  city(name: "Luanda") {
    arrivingShipments {
      id
      intake { consignee { name } }
      transferOrders { id consignee { name } authorizedBy { codename } }
    }
  }
}`;

/** Every case through the clearance 8 assessment. */
export const TO_CLEARANCE_9 = [
  ...TO_CLEARANCE_8,
  "listening-post",
  "door-watch",
] as const;

/** Every case through the clearance 9 assessment. */
export const TO_CLEARANCE_10 = [
  ...TO_CLEARANCE_9,
  "corridor-book",
  "cipher-counter",
] as const;

/** Every case through the clearance 10 assessment. */
export const TO_CLEARANCE_11 = [
  ...TO_CLEARANCE_10,
  "inner-room",
  "envelope-book",
] as const;

/** Every case through the clearance 11 assessment. */
export const TO_CLEARANCE_12 = [
  ...TO_CLEARANCE_11,
  "messengers-fares",
  "chairs-account",
] as const;

/** Every case through the clearance 12 assessment. */
export const TO_CLEARANCE_13 = [
  ...TO_CLEARANCE_12,
  "handlers-road",
  "couriers-guidebook",
] as const;
