import { expect, test } from "@playwright/test";
import {
  choose,
  expectClean,
  openCase,
  press,
  send,
  submit,
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

// One port at a time: the request has no alias.
const DAR = `query {
  city(name: "Dar es Salaam") {
    arrivingShipments {
      id
      inspection { finding }
      consignee { name director { codename organization { name } } }
    }
  }
}`;

// An alias in a comment, and a transmission with aliases that no form rests
// on, do not count as the technique.
const ALIASED_UNUSED = `query {
  # a: city(name: "Mombasa")
  a: country(name: "Kenya") { name }
  b: country(name: "Mozambique") { name }
}`;

test("a placement passed without its level's technique says so, and keeps the promotion", async ({
  page,
}) => {
  await openCase(page, "bound-ledgers");
  await send(page, ALIASED_UNUSED);
  await send(page, DAR);

  await choose(page, "Shipment", "DAR-0158");
  await submit(page);

  await expect(
    page.getByText(/Placement passed. You now hold clearance 4/),
  ).toBeVisible();
  await expect(page.getByTestId("technique-note")).toHaveText(
    "The promotion stands. You passed this placement without an alias: each transmission that supplied the evidence for your forms started from one record, such as one city or one operative. This level teaches aliases, which let one transmission start from several records.",
  );
  await expect(page.locator(".shell-bar__rank")).toHaveText("Clearance 4");

  const link = page.getByTestId("kata-link");
  await expect(link).toContainText("To practise aliases");
  await press(
    link.getByRole("link", { name: "Two lookups in one transmission" }),
  );
  await expect(
    page
      .getByRole("heading", { name: "Two lookups in one transmission" })
      .first(),
  ).toBeVisible();
  await expect(page.getByTestId("query-editor")).toBeVisible();
});
