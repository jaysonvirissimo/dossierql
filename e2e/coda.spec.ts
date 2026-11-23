import { expect, test } from "@playwright/test";
import {
  draft,
  expectClean,
  openCase,
  press,
  record,
  seedCompleted,
  send,
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
  await expect(page.getByText("9 of 12 cases resolved.")).toBeVisible();
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
  await expect(page.getByText("10 of 12 cases resolved.")).toBeVisible();
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

  // The Parallax Circle's transfer of the crate.
  const transfer = record(page, "LUA-012");
  await press(
    transfer.getByRole("button", {
      name: "Cite cleared by → name, into the draft for Fourth Desk",
    }),
  );
  await expect(
    draft(page).getByRole("tab", { name: "Fourth Desk" }),
  ).toHaveAttribute("aria-selected", "true");
  await press(transfer.getByRole("button", { name: "Cite consignee → name" }));

  // The travel order to Luanda.
  const travel = record(page, "TRV-101");
  for (const name of [
    "Cite from → name",
    "Cite to → name",
    "Cite issued by → name, into the draft for Fourth Desk",
  ]) {
    await press(travel.getByRole("button", { name }));
  }

  // The two serial numbers, in one register.
  for (const path of [
    "release order → register entry → serial",
    "release order → register entry → office → name",
    "loss report → serial",
    "loss report → office → name",
  ]) {
    const name = new RegExp(`^Cite ${path}(,|$)`);
    await press(page.getByRole("button", { name }));
  }

  await expect(
    draft(page).locator(".claim[data-status=supported]"),
  ).toHaveCount(3);
  await press(draft(page).getByRole("button", { name: "Submit deduction" }));

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
  await expect(page.getByText("10 of 12 cases resolved.")).toBeVisible();
});
