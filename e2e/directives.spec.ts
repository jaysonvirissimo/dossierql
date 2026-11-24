import { expect, test } from "@playwright/test";
import {
  draft,
  expectClean,
  openCase,
  openTool,
  press,
  seedCompleted,
  setEditor,
  TO_CLEARANCE_10,
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

const STANDING = (directive: string, declared = "$detail: Boolean!") =>
  `query DayFile($first: Int, $after: String, ${declared}) {
  paperFile(reference: "DAY-0112") {
    papers(first: $first, after: $after) {
      nodes { reference subject minuteSheet ${directive} { remark officer { name } } }
    }
  }
}`;

test("clearance 10 leaves heavy detail out of a standing query with a directive", async ({
  page,
}) => {
  await seedCompleted(page, [...TO_CLEARANCE_10]);
  await expect(page.locator(".shell-bar__rank")).toHaveText("Clearance 10");
  await expect(page.locator(".case--next")).toContainText("The Inner Room");

  await openCase(page, "inner-room");

  // The panel lists the file of papers, and the two directives.
  await openTool(page, "Documentation");
  for (const type of ["PaperFile", "PaperPage", "Paper", "Endorsement"]) {
    await expect(
      page.locator(".doc summary", { hasText: new RegExp(`^${type} · `) }),
    ).toBeVisible();
  }
  await expect(page.getByTestId("directives")).toContainText(
    "@include(if: Boolean!)",
  );
  await expect(page.getByTestId("directives")).toContainText(
    "@skip(if: Boolean!)",
  );

  // The standing query as filed is over the weight limit: returned unsent.
  await transmit(page);
  await expect(page.locator(".errors")).toContainText(
    "The limit at your clearance is 200",
  );
  await expect(page.locator(".errors")).toContainText(
    "a field that the request leaves out makes the request lighter",
  );
  const hours = page.getByText(/of \d+ hours left/).first();
  const before = await hours.textContent();

  // A variable that may be left out cannot stand where if needs a value.
  await writeQuery(page, STANDING("@include(if: $detail)", "$detail: Boolean"));
  await transmit(page);
  await expect(page.locator(".errors")).toContainText(
    'declares "$detail" as Boolean, without the !',
  );
  await expect(hours).toHaveText(before ?? "");

  // With the detail left out, every paper comes back in one request.
  await writeQuery(page, STANDING("@include(if: $detail)"));
  await setEditor(page, "variables-editor", `{ "detail": false }`);
  await transmit(page);
  await expect(page.locator(".errors")).toHaveCount(0);
  await expect(page.getByTestId("weight")).toContainText(
    "weighed this request at 121",
  );
  await openTool(page, "Raw response");
  await expect(page.getByTestId("raw-response")).toContainText("DFP-0120");
  await expect(page.getByTestId("raw-response")).not.toContainText(
    "minuteSheet",
  );

  // The same operation, with the detail, for the paper about the key.
  await setEditor(
    page,
    "variables-editor",
    `{ "first": 1, "after": "DFP-0105", "detail": true }`,
  );
  await transmit(page);
  await expect(page.getByTestId("weight")).toContainText(
    "weighed this request at 22",
  );
  await expect(page.getByTestId("raw-response")).toContainText(
    "Key of the inner room drawn from the private office's safe",
  );

  await openTool(page, "Findings");
  const leads = draft(page).getByRole("combobox");
  await leads.selectOption({ label: "Duarte Sequeira" });
  await press(page.getByRole("button", { name: /^Cite remark/ }).first());
  await press(page.getByRole("button", { name: /^Cite officer/ }).first());
  await expect(
    draft(page).locator(".claim[data-status=supported]"),
  ).toHaveCount(1);
  await press(draft(page).getByRole("button", { name: "Submit deduction" }));
  await expect(
    page.getByText(/Duarte Sequeira lent the inner room/).first(),
  ).toBeVisible();

  // Stage 2 opens on the file of standing instructions.
  await expect(
    page
      .getByText("Identify the officer who brought the standing instruction", {
        exact: false,
      })
      .first(),
  ).toBeVisible();
});
