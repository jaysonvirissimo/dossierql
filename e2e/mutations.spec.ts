import { expect, test } from "@playwright/test";
import {
  draft,
  expectClean,
  openCase,
  openTool,
  press,
  seedCompleted,
  TO_CLEARANCE_11,
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

const CLAIM = (amount: string) => `mutation {
  fileExpenseClaim(journey: "JRN-0402", amount: ${amount}) {
    status
    remark
    voucher { reference journey { reference } paidTo { name } paidFrom { name } }
  }
}`;

test("clearance 11 files an expense claim with a mutation and rests a deduction on its receipt", async ({
  page,
}) => {
  await seedCompleted(page, [...TO_CLEARANCE_11]);
  await expect(page.locator(".shell-bar__rank")).toHaveText("Clearance 11");
  await expect(page.locator(".case--next")).toContainText(
    "The Messengers' Fares",
  );

  await openCase(page, "messengers-fares");

  // The panel lists Mutation straight after Query, and says how to write one.
  await openTool(page, "Documentation");
  await expect(page.locator(".doc summary").nth(1)).toHaveText(/^Mutation · /);
  await expect(page.getByTestId("mutations")).toContainText(
    "Write mutation instead of query",
  );

  // A mutation field inside a query is returned, at no cost.
  const hours = page.getByText(/of \d+ hours left/).first();
  const before = await hours.textContent();
  await writeQuery(
    page,
    `{ fileExpenseClaim(journey: "JRN-0402", amount: 24) { status } }`,
  );
  await transmit(page);
  await expect(page.locator(".errors")).toContainText(
    "starts with the word mutation instead of query",
  );
  await expect(hours).toHaveText(before ?? "");

  // A claim for the wrong amount is refused, and the receipt says why.
  await writeQuery(page, CLAIM("20"));
  await transmit(page);
  await openTool(page, "Raw response");
  await expect(page.getByTestId("raw-response")).toContainText("REFUSED");
  await expect(page.getByTestId("raw-response")).toContainText(
    "The fare for JRN-0402 is 24",
  );

  // The claim for the fare comes back with the voucher that paid it.
  await writeQuery(page, CLAIM("24"));
  await transmit(page);
  await expect(page.locator(".errors")).toHaveCount(0);
  await expect(page.getByTestId("raw-response")).toContainText("ALREADY_PAID");
  await expect(page.getByTestId("raw-response")).toContainText(
    "Standing Committee, general account",
  );

  await openTool(page, "Findings");
  const leads = draft(page).getByRole("combobox");
  await leads.selectOption({ label: "Standing Committee, general account" });
  // The receipt the mutation returned is the evidence.
  await press(draft(page).getByRole("button", { name: "Submit deduction" }));
  await expect(draft(page).getByTestId("evidence-chain")).toContainText(
    "paid from",
  );
  await expect(
    page.getByText(/paid Fontes's fare to the counter/).first(),
  ).toBeVisible();

  // Stage 2 opens on a mutation that files one claim, with room for another.
  await expect(
    page
      .getByText("Identify the officer who took the sealed envelope", {
        exact: false,
      })
      .first(),
  ).toBeVisible();
});
