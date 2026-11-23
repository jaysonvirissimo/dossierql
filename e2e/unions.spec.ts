import { expect, test } from "@playwright/test";
import {
  draft,
  expectClean,
  openCase,
  openTool,
  press,
  seedCompleted,
  send,
  TO_CLEARANCE_8,
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

const LOG = `interceptLog(reference: "IL-0112")`;

test("clearance 8 reads a log of unrelated records through a union", async ({
  page,
}) => {
  await seedCompleted(page, [...TO_CLEARANCE_8]);
  await expect(page.locator(".shell-bar__rank")).toHaveText("Clearance 8");
  await expect(page.locator(".case--next")).toContainText("The Listening Post");

  await openCase(page, "listening-post");

  // The panel lists the union with its kinds, and the enum with its values.
  await openTool(page, "Documentation");
  await expect(
    page.locator(".doc summary", { hasText: /^Intercept · / }),
  ).toContainText("Vessel, Company, Sighting, Telegram or Pass");
  await expect(
    page.locator(".doc summary", { hasText: /^InterceptKind · / }),
  ).toContainText("kind: VESSEL");

  // A field asked for directly on the union gets a clerk's note.
  await send(page, `{ ${LOG} { entries { name } } }`);
  await expect(page.locator(".errors")).toContainText("Intercept is a union");

  // An enum value in quotation marks gets a clerk's note.
  await send(page, `{ ${LOG} { entries(kind: "VESSEL") { __typename } } }`);
  await expect(page.locator(".errors")).toContainText(
    "removing the quotation marks",
  );

  // Stage 1: every field of one kind goes inside an inline fragment.
  await send(
    page,
    `{ ${LOG} { entries { __typename ... on Telegram { reference text origin { name } } } } }`,
  );
  await expect(page.locator(".errors")).toHaveCount(0);
  const leads = draft(page).getByRole("combobox");
  await expect(leads.getByRole("option", { name: "TEL-0039" })).toBeEnabled();
  await leads.selectOption({ label: "TEL-0039" });
  await press(page.getByRole("button", { name: /^Cite text/ }).last());
  await expect(
    draft(page).locator(".claim[data-status=supported]"),
  ).toHaveCount(1);
  await press(draft(page).getByRole("button", { name: "Submit deduction" }));
  await expect(
    page.getByText(/The post copied telegram TEL-0039/).first(),
  ).toBeVisible();

  // Stage 2 opens; an enum value narrows the log to its vessels.
  await expect(
    page
      .getByText("Identify the vessel that brought the man", { exact: false })
      .first(),
  ).toBeVisible();
  await send(
    page,
    `{ ${LOG} { entries(kind: VESSEL) { __typename ... on Vessel { name } } } }`,
  );
  await expect(page.locator(".errors")).toHaveCount(0);
  await openTool(page, "Raw response");
  await expect(page.getByTestId("raw-response")).toContainText("Santa Luzia");
  await expect(page.getByTestId("raw-response")).not.toContainText(
    '"Telegram"',
  );

  // A list of kinds, and a single value where a list is expected.
  await send(
    page,
    `{ ${LOG} { entries(kinds: COMPANY) { __typename ... on Company { name } } } }`,
  );
  await expect(page.locator(".errors")).toHaveCount(0);
  await expect(page.getByTestId("raw-response")).toContainText(
    "Kwanza Passage Agency",
  );
  await expect(page.getByTestId("raw-response")).not.toContainText(
    "Santa Luzia",
  );
});
