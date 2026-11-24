import { expect, test, type Page } from "@playwright/test";
import {
  choose,
  draft,
  expectClean,
  openCase,
  openTool,
  press,
  seedCompleted,
  send,
  submit,
  TO_CLEARANCE_13,
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

const QUAY = `subscription {
  harbourWatch(port: "Lisbon") {
    hour
    note
    letter { paper carriedBy { name } }
  }
}`;

const PORTS = `subscription Tangier {
  harbourWatch(port: "Tangier") { note letter { addressedTo carriedBy { name } } }
}

subscription Casablanca {
  harbourWatch(port: "Casablanca") { note letter { addressedTo carriedBy { name } } }
}`;

const PORTO = `query Log {
  harbourLog(port: "Porto") { note officer { name } vessel { name passengers { name } boundFor { name country { name } } } }
}

subscription Quay {
  harbourWatch(port: "Porto") { note officer { name } vessel { name passengers { name } boundFor { name country { name } } } }
}`;

const PRAIA = `subscription {
  harbourWatch(port: "Praia") { port { name } note officer { name } hand { description } letter { signature sender { name } hand { description } } }
}`;

/** The hours left on the mission clock. */
async function hoursLeft(page: Page): Promise<number> {
  const text = await page
    .getByText(/of \d+ hours left/)
    .first()
    .textContent();
  return Number(/(\d+) of/.exec(text ?? "")?.[1]);
}

async function keepWatch(page: Page, price: string): Promise<void> {
  const button = page.getByTestId("keep-watch");
  await expect(button).toContainText(`(${price})`);
  await press(button);
}

async function chooseOperation(page: Page, name: string): Promise<void> {
  await page.getByTestId("operation").selectOption(name);
}

test("clearance 13 keeps standing watches and chooses among operations", async ({
  page,
}) => {
  await seedCompleted(page, [...TO_CLEARANCE_13]);
  await expect(page.locator(".shell-bar__rank")).toHaveText("Clearance 13");
  await expect(page.locator(".case--next")).toContainText("The River Quay");
  await openCase(page, "river-quay");

  // The documentation lists the subscription root and leaves out the
  // deprecated log.
  await openTool(page, "Documentation");
  await expect(page.getByTestId("subscriptions")).toBeVisible();
  await expect(page.getByTestId("deprecated")).toBeVisible();
  await expect(
    page.locator(".doc", {
      has: page.locator("summary", { hasText: /^Query/ }),
    }),
  ).not.toContainText("harbourLog");

  // A subscription asks for one field at its top level.
  await send(
    page,
    `subscription { a: harbourWatch(port: "Lisbon") { note } b: harbourWatch(port: "Porto") { note } }`,
  );
  await expect(page.locator(".errors")).toContainText(
    "exactly one field at its top level",
  );

  // Opening the watch is one transmission, and delivers nothing yet.
  const start = await hoursLeft(page);
  await send(page, QUAY);
  await expect(page.getByTestId("watch-label")).toContainText(
    "opened standing watch 1",
  );
  expect(await hoursLeft(page)).toBe(start - 1);
  await expect(page.getByTestId("watches")).toContainText(
    'harbourWatch(port: "Lisbon")',
  );

  // Keep watch lets the hours pass, and each event costs nothing more.
  await keepWatch(page, "1 hour");
  await expect(page.getByTestId("watch-label")).toContainText(
    "delivered this event",
  );
  expect(await hoursLeft(page)).toBe(start - 2);
  await keepWatch(page, "2 hours");
  await openTool(page, "Raw response");
  await expect(page.getByTestId("raw-response")).toContainText("São Brás");
  expect(await hoursLeft(page)).toBe(start - 4);
  await expect(page.getByTestId("watches")).toContainText(
    "No standing watch that you keep open has another event coming",
  );

  await openTool(page, "Findings");
  await choose(page, "Vessel", "sao-bras");
  await submit(page);
  await expect(page.locator(".casebar")).toContainText(
    "a letter addressed to M",
  );

  // Two operations in the editor: with none chosen, the clerk returns the
  // request at no cost; each one chosen is transmitted alone.
  await writeQuery(page, PORTS);
  const before = await hoursLeft(page);
  await transmit(page);
  await expect(page.locator(".errors")).toContainText(
    "list beside the Transmit button",
  );
  expect(await hoursLeft(page)).toBe(before);
  await chooseOperation(page, "Tangier");
  await expect(page.getByTestId("transmit")).toContainText("Transmit Tangier");
  await transmit(page);
  await expect(page.getByTestId("operation-sent")).toContainText("Tangier");
  await chooseOperation(page, "Casablanca");
  await transmit(page);
  await keepWatch(page, "1 hour");
  // Two events arrive in the hour, and the first says that another follows.
  await expect(page.getByTestId("events-after")).toContainText("1 event");
  await expect(page.getByTestId("watches")).toContainText(
    'harbourWatch(port: "Casablanca")',
  );

  // The watches survive a reload.
  await page.reload();
  await expect(page.getByTestId("watches")).toContainText(
    'harbourWatch(port: "Tangier")',
  );

  // Closing a watch takes it off the list.
  await press(page.getByRole("button", { name: "Close watch 1" }));
  await expect(page.getByTestId("watches")).not.toContainText(
    'harbourWatch(port: "Lisbon")',
  );

  // Introspection lists the deprecated field when asked.
  await send(
    page,
    `{ __type(name: "Query") { fields(includeDeprecated: true) { name isDeprecated deprecationReason } } }`,
  );
  await openTool(page, "Raw response");
  await expect(page.getByTestId("raw-response")).toContainText("harbourLog");
});

test("the last assessment arrests an officer and completes the course", async ({
  page,
}) => {
  await seedCompleted(page, [...TO_CLEARANCE_13, "river-quay"]);
  await openCase(page, "last-sailing");
  await openTool(page, "Dossiers");
  await expect(page.getByTestId("quarry")).toContainText("Afonso Mascarenhas");

  await writeQuery(page, PORTO);
  await chooseOperation(page, "Log");
  await transmit(page);
  await chooseOperation(page, "Quay");
  await transmit(page);
  await keepWatch(page, "1 hour");
  await keepWatch(page, "1 hour");
  await choose(page, "Vessel", "atlantida");
  await choose(page, "Destination country", "CV");
  await submit(page, /^Travel/);
  await expect(page.locator(".casebar")).toContainText("Cabo Verde");

  await expect(draft(page).getByTestId("terminal-warrant")).toContainText(
    "fill the box officer",
  );
  await send(page, PRAIA);
  await keepWatch(page, "1 hour");
  await keepWatch(page, "1 hour");
  await send(
    page,
    `mutation { requestWarrant(input: { subject: { officer: "Afonso Mascarenhas" } }) { approved reasons } }`,
  );
  await expect(
    page.getByRole("heading", { name: "Case resolved" }),
  ).toBeVisible();
  await expect(page.getByTestId("stamp")).toHaveText("DETAINED");
  await expect(page.getByTestId("course-complete")).toContainText(
    "The course ends here",
  );
  await expect(page.getByTestId("rank-stamp")).toHaveCount(0);
});
