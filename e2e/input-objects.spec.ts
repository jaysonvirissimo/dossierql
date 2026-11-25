import { expect, test } from "@playwright/test";
import {
  choose,
  draft,
  expectClean,
  openCase,
  openTool,
  press,
  seedCompleted,
  send,
  setEditor,
  submit,
  TO_CLEARANCE_12,
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

const PREMISES = `query {
  operative(codename: "COPPER_STARLING") { coverNames { name } weakness }
  city(name: "Trieste") { premises { reference name witness statementRequired watched } }
}`;

const PENSIONE = `mutation {
  requestSearchWarrant(input: {
    premises: "PRM-1251"
    statement: """
    Signor Weiss said, "I have a letter to leave for a friend at the Albergo
    Duino." He left the letter at noon and did not come back for his bag.
    """
  }) {
    granted
    findings { reference leftBy { name } city { name country { name currency { name } } } }
  }
}`;

const STANDING = `mutation Search($premises: ID!, $urgency: Urgency = ROUTINE) {
  requestSearchWarrant(input: { premises: $premises, urgency: $urgency }) {
    granted
    remark
    findings { reference leftBy { name } city { name country { name currency { name } } } }
  }
}`;

const SIGHTINGS = `query {
  city(name: "Vienna") { sightings { operative { codename } nameGiven { name operative { codename } } } }
}`;

const warrant = (codename: string) =>
  `mutation { requestWarrant(input: { subject: { operative: "${codename}" } }) { approved reasons hours } }`;

test("clearance 12 searches with input objects and ends a pursuit in a warrant", async ({
  page,
}) => {
  await seedCompleted(page, [...TO_CLEARANCE_12]);
  await expect(page.locator(".shell-bar__rank")).toHaveText("Clearance 12");
  await expect(page.locator(".case--next")).toContainText("The Handler's Road");

  await openCase(page, "couriers-guidebook");

  // The documentation panel lists the forms, and marks the @oneOf one.
  await openTool(page, "Documentation");
  await expect(
    page.locator(".doc summary", { hasText: /^SearchApplication/ }),
  ).toContainText("An input object");
  await expect(
    page.locator(".doc summary", { hasText: /^WarrantSubject/ }),
  ).toContainText("fill exactly one of its boxes");

  // The quarry's dossier fills in from what the responses return.
  await send(page, PREMISES);
  await openTool(page, "Dossiers");
  await expect(page.getByTestId("quarry")).toContainText("COPPER_STARLING");
  await expect(page.getByTestId("quarry")).toContainText(
    "Cannot pass a bookshop",
  );

  // A quotation mark inside an ordinary string is returned, with a note.
  await send(
    page,
    `mutation { requestSearchWarrant(input: { premises: "PRM-1251", statement: "Signor Weiss said, "I have a letter"" }) { granted } }`,
  );
  await expect(page.locator(".errors")).toContainText("block string");

  // The block string quotes the witness, and the magistrate grants it.
  await send(page, PENSIONE);
  await expect(page.locator(".errors")).toHaveCount(0);
  await openTool(page, "Raw response");
  await expect(page.getByTestId("raw-response")).toContainText("FND-1251");

  // The standing search: the default value makes it routine, too late for
  // the watched bookshop; URGENT in the variables panel finds the receipt.
  await writeQuery(page, STANDING);
  await setEditor(page, "variables-editor", `{ "premises": "PRM-1252" }`);
  await transmit(page);
  await expect(page.getByTestId("raw-response")).toContainText("found nothing");
  await setEditor(
    page,
    "variables-editor",
    `{ "premises": "PRM-1252", "urgency": "URGENT" }`,
  );
  await transmit(page);
  await expect(page.getByTestId("raw-response")).toContainText("FND-1252");

  await openTool(page, "Findings");
  await choose(page, "Find", "FND-1252");
  await choose(page, "Destination country", "AT");
  await submit(page, /^Travel/);
  await expect(page.locator(".casebar")).toContainText("Austria");

  // Vienna: the warrant is filed from the terminal.
  await expect(draft(page).getByTestId("terminal-warrant")).toContainText(
    "costs 3 hours",
  );
  await send(page, SIGHTINGS);
  const hours = page.getByText(/of \d+ hours left/).first();
  const before = Number(
    /(\d+) of/.exec((await hours.textContent()) ?? "")?.[1],
  );
  await send(page, warrant("IRON_FINCH"));
  await openTool(page, "Raw response");
  await expect(page.getByTestId("raw-response")).toContainText(
    '"approved": false',
  );
  // One hour for the transmission, three for the rejected warrant.
  await expect(hours).toContainText(`${String(before - 4)} of`);

  await send(page, warrant("COPPER_STARLING"));
  // The arrest has a moment of its own before the debrief, and plays once:
  // the case reopened after a reload goes straight to the debrief.
  await expect(page.getByTestId("closing-stamp")).toHaveText("DETAINED");
  await expect(page.locator(".closing__scene")).toContainText(
    "COPPER_STARLING",
  );
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Case resolved" }),
  ).toBeVisible();
  await expect(page.getByTestId("stamp")).toHaveText("DETAINED");
});

test("a pursuit whose deadline passes first is stamped AT LARGE", async ({
  page,
}) => {
  await seedCompleted(page, [...TO_CLEARANCE_12]);
  await openCase(page, "handlers-road");
  await openTool(page, "Case");
  await press(page.getByRole("button", { name: "Let the deadline pass…" }));
  await press(
    page.getByRole("button", { name: "Let the deadline pass", exact: true }),
  );
  const alert = page.getByRole("alert");
  await expect(alert).toContainText("this attempt is closed");
  await expect(alert.getByTestId("stamp")).toHaveText("AT LARGE");
});
