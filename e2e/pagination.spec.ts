import { expect, test } from "@playwright/test";
import {
  draft,
  expectClean,
  openCase,
  openTool,
  press,
  seedCompleted,
  send,
  setEditor,
  TO_CLEARANCE_9,
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

const BOOK = `watchBook(reference: "WB-0112")`;

test("clearance 9 reads a watch book too long to read whole, a page at a time", async ({
  page,
}) => {
  await seedCompleted(page, [...TO_CLEARANCE_9]);
  await expect(page.locator(".shell-bar__rank")).toHaveText("Clearance 9");
  await expect(page.locator(".case--next")).toContainText("The Corridor Book");

  await openCase(page, "corridor-book");

  // The panel lists the book, its page, and where a page ends.
  await openTool(page, "Documentation");
  for (const type of ["WatchBook", "WatchPage", "PageInfo"]) {
    await expect(
      page.locator(".doc summary", { hasText: new RegExp(`^${type} · `) }),
    ).toBeVisible();
  }

  // The whole book is over the weight limit: returned unsent, at no cost.
  await send(page, `{ ${BOOK} { entries { nodes { note } } } }`);
  await expect(page.locator(".errors")).toContainText(
    "The limit at your clearance is 200",
  );
  await expect(page.locator(".errors")).toContainText("page size you give");
  await expect(page.getByText("35 of 35 hours left")).toBeVisible();

  // Stage 1: a page size brings the request under the limit.
  await send(
    page,
    `{ ${BOOK} { entries(first: 10) { nodes { reference hour note officer { name } } } } }`,
  );
  await expect(page.locator(".errors")).toHaveCount(0);
  await expect(page.getByTestId("weight")).toContainText(
    "weighed this request at 21",
  );
  const leads = draft(page).getByRole("combobox");
  await leads.selectOption({ label: "Henrique Lobo" });
  await press(page.getByRole("button", { name: /^Cite note/ }).first());
  await press(page.getByRole("button", { name: /^Cite officer/ }).first());
  await expect(
    draft(page).locator(".claim[data-status=supported]"),
  ).toHaveCount(1);
  await press(draft(page).getByRole("button", { name: "Submit deduction" }));
  await expect(
    page.getByText(/Henrique Lobo kept the corridor as duty officer/).first(),
  ).toBeVisible();

  // Stage 2 opens; a cursor starts the next page.
  await expect(
    page
      .getByText("Identify the officer who let the holder", { exact: false })
      .first(),
  ).toBeVisible();
  await send(
    page,
    `{ ${BOOK} { entries(first: 5, after: "COR-0150") { nodes { reference } pageInfo { hasNextPage endCursor } } } }`,
  );
  await openTool(page, "Raw response");
  await expect(page.getByTestId("raw-response")).toContainText("COR-0151");
  await expect(page.getByTestId("raw-response")).toContainText(
    '"endCursor": "COR-0155"',
  );

  // One operation with a variable that may be left out.
  await writeQuery(
    page,
    `query Page($after: String) { ${BOOK} { entries(first: 2, after: $after) { nodes { reference } } } }`,
  );
  await transmit(page);
  await expect(page.getByTestId("raw-response")).toContainText("COR-0001");
  await setEditor(page, "variables-editor", `{ "after": "COR-0100" }`);
  await transmit(page);
  await expect(page.getByTestId("raw-response")).toContainText("COR-0101");

  // A classified entry blanks the page's list, and pageInfo still comes back.
  await send(
    page,
    `{ ${BOOK} { entries(first: 5, after: "COR-0200") { nodes { reference } pageInfo { endCursor } } } }`,
  );
  await expect(page.locator(".errors")).toContainText(
    "WatchEntry COR-0202 is classified above your clearance.",
  );
  await expect(page.locator(".errors")).toContainText(
    "gives null for the whole list",
  );
  await expect(page.getByTestId("raw-response")).toContainText('"nodes": null');
  await expect(page.getByTestId("raw-response")).toContainText(
    '"endCursor": "COR-0205"',
  );
});
