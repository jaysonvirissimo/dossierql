import { expect, test } from "@playwright/test";
import {
  draft,
  expectClean,
  openCase,
  openTool,
  press,
  seedCompleted,
  send,
  TO_CAMPAIGN_END,
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

const SCHEMA = `query {
  __schema {
    types { name fields { name } }
  }
}`;

const CABINET = `query {
  cabinet {
    label
    dockets { reference title shipment { id } }
  }
}`;

test("the second campaign opens at clearance 6 with an undocumented cabinet", async ({
  page,
}) => {
  await seedCompleted(page, [...TO_CAMPAIGN_END, "the-receipt"]);
  await expect(page.locator(".shell-bar__rank")).toHaveText("Clearance 6");
  await expect(
    page.getByRole("heading", { level: 1, name: "The Fourth Desk" }),
  ).toBeVisible();
  await expect(page.getByTestId("campaign-opens")).toHaveText(
    "The Fourth Desk",
  );
  await expect(page.locator(".case--next")).toContainText("The Sealed Cabinet");

  await openCase(page, "sealed-cabinet");

  // The documentation panel leaves the cabinet out, and says so.
  await openTool(page, "Documentation");
  await expect(page.getByTestId("undocumented")).toBeVisible();
  await expect(
    page.locator(".doc summary code", { hasText: /^Office$/ }),
  ).toHaveCount(1);
  await expect(
    page.locator(".doc summary code", { hasText: /^Docket$/ }),
  ).toHaveCount(0);
  await expect(
    page.locator(".doc__field code", { hasText: /^cabinet/ }),
  ).toHaveCount(0);

  // Introspection describes it, records no facts, and weighs nothing.
  await send(page, SCHEMA);
  await expect(page.locator(".errors")).toHaveCount(0);
  await expect(page.getByTestId("weight")).toContainText(
    "weighed this request at 0",
  );
  // Introspection has a compact view: one folded entry to a type.
  await expect(page.getByTestId("introspection-legend")).toBeVisible();
  await expect(
    page.locator(".introspection__type summary", {
      hasText: /^Query · \d+ fields$/,
    }),
  ).toBeVisible();
  await expect(
    page.locator(".introspection__type summary", {
      hasText: /^String · no fields/,
    }),
  ).toBeVisible();

  // A type reference reads layer by layer.
  await send(
    page,
    `{ __type(name: "Docket") { fields { name type { kind name ofType { kind name ofType { kind name ofType { kind name } } } } } } }`,
  );
  await expect(
    page.getByText("NON_NULL → LIST → NON_NULL → OBJECT Office"),
  ).toBeVisible();

  // The same mistake in two places is reported once, with both places.
  await send(page, `{ cabinet { dockets { mark { zz } minute { zz } } } }`);
  await expect(page.locator(".error__where").first()).toContainText(
    "In 2 places",
  );
  await expect(page.getByTestId("earlier-findings")).toContainText(
    "The findings below are not for this request.",
  );

  // Clues say which record they describe.
  await openTool(page, "Case");
  await expect(page.getByTestId("clues-lede")).toContainText(
    "a fact about the docket you are to identify",
  );

  await send(page, CABINET);
  await expect(page.locator(".errors")).toHaveCount(0);
  await expect(page.getByTestId("weight")).toContainText(
    /weighed this request at \d+/,
  );
  await openTool(page, "Raw response");
  await expect(page.getByTestId("raw-response")).toContainText('"extensions"');
  await openTool(page, "Findings");

  // The lead menu offers the dockets retrieved.
  const leads = draft(page).getByRole("combobox");
  await expect(leads).toBeEnabled();
  await expect(leads.getByRole("option", { name: "DKT-0417" })).toBeEnabled();
  await leads.selectOption({ label: "DKT-0417" });

  await press(draft(page).getByRole("button", { name: "Submit deduction" }));
  await expect(
    page.getByText(/Docket DKT-0417 is open on your desk/).first(),
  ).toBeVisible();
  // The next stage opens on the cover of the docket.
  await expect(
    page
      .getByText("Identify the office that wrote the minute", { exact: false })
      .first(),
  ).toBeVisible();
});

test("typing a closing brace on its own line steps over the one the editor added", async ({
  page,
}) => {
  await page.goto("./#/training");
  const editor = page.getByRole("textbox", { name: "GraphQL query" }).first();
  await editor.click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.press("Delete");
  await page.keyboard.type("{");
  await page.keyboard.press("Enter");
  await page.keyboard.type("}");
  await expect(editor).toHaveText("{}");
});
