import { expect, test } from "@playwright/test";
import {
  draft,
  expectClean,
  openCase,
  openTool,
  press,
  seedCompleted,
  send,
  TO_CLEARANCE_7,
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

test("clearance 7 reads a file of mixed documents through an interface", async ({
  page,
}) => {
  await seedCompleted(page, [...TO_CLEARANCE_7]);
  await expect(page.locator(".shell-bar__rank")).toHaveText("Clearance 7");
  await expect(page.locator(".case--next")).toContainText(
    "The Valparaíso Draft",
  );

  await openCase(page, "valparaiso-draft");

  // The panel lists the interface, the kinds it stands for, and defaults.
  await openTool(page, "Documentation");
  await expect(
    page.locator(".doc summary", { hasText: /^Document · / }),
  ).toContainText("Telegram, Memorandum or Minute");
  await expect(
    page.locator(".doc summary", { hasText: /^Telegram · / }),
  ).toContainText("Has every field of Document");
  await expect(
    page.locator(".doc__field code", {
      hasText: "documents(city: String, sealed: Boolean = false)",
    }),
  ).toHaveCount(1);

  // A field of one kind, asked for on the interface, gets a clerk's note.
  await send(page, `{ caseFile(reference: "CF-0417") { documents { text } } }`);
  await expect(page.locator(".errors")).toContainText(
    'Not every kind of Document has "text"',
  );

  // Stage 1: the shared fields come back for every kind.
  await send(
    page,
    `{ caseFile(reference: "CF-0417") { documents { reference title stamp } } }`,
  );
  await expect(page.locator(".errors")).toHaveCount(0);
  const leads = draft(page).getByRole("combobox");
  await expect(leads.getByRole("option", { name: "MIN-0088" })).toBeEnabled();
  await leads.selectOption({ label: "MIN-0088" });
  await press(page.getByRole("button", { name: /^Cite stamp/ }).first());
  await expect(
    draft(page).locator(".claim[data-status=supported]"),
  ).toHaveCount(1);
  await press(draft(page).getByRole("button", { name: "Submit deduction" }));
  await expect(
    page.getByText(/The First Desk entered minute MIN-0088/).first(),
  ).toBeVisible();

  // Stage 2 opens; an inline fragment reads the telegrams.
  await expect(
    page
      .getByText("Identify the office that sent the First Desk the draft", {
        exact: false,
      })
      .first(),
  ).toBeVisible();
  await send(
    page,
    `{ caseFile(reference: "CF-0417") { documents { reference ... on Telegram { text origin { name } } } } }`,
  );
  await expect(page.locator(".errors")).toHaveCount(0);
  await expect(
    page
      .getByText(
        "The draft of the minute on docket DKT-0417 follows to the First Desk in the bag.",
      )
      .first(),
  ).toBeVisible();

  // A sealed document comes back only when the request asks for it.
  await send(
    page,
    `{ caseFile(reference: "CF-0417") { documents(city: "Valparaíso", sealed: true) { reference } } }`,
  );
  await expect(page.locator(".errors")).toHaveCount(0);
  await openTool(page, "Raw response");
  await expect(page.getByTestId("raw-response")).toContainText("MEM-0044");
  await expect(page.getByTestId("raw-response")).not.toContainText("MEM-0042");
});
