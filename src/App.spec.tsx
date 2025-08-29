import { test, expect } from "@playwright/test";

test("App loads /", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("OFX App");
});

test("App loads /rates", async ({ page }) => {
  await page.goto("/rates");
  await expect(page.getByText("Currency Conversion")).toBeVisible();
});

test("/rates accesses live exchange rate", async ({ page }) => {
  await page.goto("/rates");
  const exchangeRate = Number(
    await page.getByTestId("exchange-rate").textContent()
  );
  await expect(exchangeRate).toBeGreaterThan(0);
});

test("currency converter is enabled and interactive", async ({ page }) => {
  await page.goto("/rates");

  // test To Dropdown
  await page.getByTestId("To-dropdown-button").click();
  await page.getByText("NZD").click();
  await expect(page.getByTestId("To-dropdown-button")).toHaveText("NZD");

  // test From Dropdown
  await page.getByTestId("From-dropdown-button").click();
  await page.getByText("CAD").click();
  await expect(page.getByTestId("From-dropdown-button")).toHaveText("CAD");

  // test Amount Input
  await page.getByTestId("amount-input").fill("100");
  await expect
    .poll(
      async () => {
        const exchangeRate = Number(
          await page.getByTestId("exchange-rate").textContent()
        );
        const convertedAmount = (100 * exchangeRate).toFixed(2);
        const trueRate = await page.getByTestId("true-rate").textContent();
        return trueRate?.includes(convertedAmount);
      },
      { timeout: 10_000 }
    )
    .toBeTruthy();
});
