import { expect, test } from "@playwright/test";
import {
  choose,
  expectClean,
  openCase,
  press,
  seedCompleted,
  send,
  submit,
  TO_CAMPAIGN_END,
  TO_CLEARANCE_5,
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

const RECEIPT = `query {
  receipt(id: "RCT-0417") {
    releasedBy
    shipment { transferOrders { id consignee { name } clearedBy { name } } }
    releaseOrder { id registerEntry { serial note office { name } } }
    lossReport { serial note office { name } }
  }
  travelOrders { id from { name } to { name } issuedBy { name } }
}`;

test("the coda stays hidden until the campaign's last case is resolved", async ({
  page,
}) => {
  await seedCompleted(page, [...TO_CLEARANCE_5, "forwarding-address"]);
  await expect(page.getByText("9 of 26 cases resolved.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "The Receipt" })).toHaveCount(
    0,
  );

  await page.goto("./#/mission/the-receipt");
  await expect(
    page.getByRole("heading", { name: "Nothing filed here" }),
  ).toBeVisible();
});

test("the coda ends the campaign without a promotion", async ({ page }) => {
  await seedCompleted(page, TO_CAMPAIGN_END);
  await expect(page.getByText("10 of 26 cases resolved.")).toBeVisible();
  const card = page.locator(".case--next");
  await expect(card).toContainText("The Receipt");
  await expect(card).toContainText("Coda");

  await page.goto("./#/mission/the-receipt");
  await expect(
    page.getByRole("heading", { name: "The Receipt" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "The clock" })).toHaveCount(0);
  await openCase(page, "the-receipt");
  await send(page, RECEIPT);

  // The transfer, the travel order and the two serial numbers all came back
  // in one response. The archive finds the evidence for all three claims.
  await expect(page.getByRole("button", { name: /^Cite/ })).toHaveCount(0);
  await choose(page, "Office", "fourth-desk");
  await submit(page);

  await expect(
    page.getByRole("heading", { name: "File closed" }),
  ).toBeVisible();
  await expect(page.getByTestId("stamp")).toHaveText("UNSIGNED");
  await expect(page.getByTestId("campaign-end")).toContainText(
    "The Shadow Network ends here.",
  );
  await expect(page.getByText(/passed. You now hold clearance/)).toHaveCount(0);
  await expect(page.getByText("Added to your tradecraft manual")).toHaveCount(
    0,
  );
  // The next campaign opens with the next clearance.
  await expect(
    page.getByRole("link", { name: "Next case: The Sealed Cabinet" }),
  ).toBeVisible();
  await expect(page.locator(".shell-bar__rank")).toHaveText("Clearance 6");

  await press(page.getByRole("link", { name: "Back to assignments" }));
  await expect(page.getByText("10 of 26 cases resolved.")).toBeVisible();
});
