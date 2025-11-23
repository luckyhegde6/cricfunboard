import { test, expect } from "@playwright/test";
import { execSync } from "child_process";

test.describe("scorer flow", () => {
  test.beforeAll(() => {
    // Run seed scripts to ensure data exists
    console.log("Seeding data...");
    try {
      execSync("npm run seed:users", { stdio: "inherit" });
      execSync("npm run seed:teams", { stdio: "inherit" });
      execSync("npm run seed:scorer", { stdio: "inherit" });
      execSync("npm run seed:match", { stdio: "inherit" });
    } catch (error) {
      console.error("Seeding failed:", error);
      throw error;
    }
  });

  test("sign in as scorer and score a run", async ({ page }) => {
    await page.goto("/auth/signin");
    // fill credentials - ensure test env has this user
    await page.fill('input[type="email"]', "scorer@test.com");
    await page.fill('input[type="password"]', "password123");
    await page.click("text=Sign in");

    // Debug: wait a bit and check URL
    await page.waitForTimeout(5000);
    console.log("Current URL after sign in:", page.url());

    // Check for error message
    const error = await page
      .locator('.error-message, [role="alert"]')
      .textContent()
      .catch(() => null);
    if (error) console.log("Error message on page:", error);

    // After sign in, we are redirected to Home (/) by default
    await page.waitForURL("http://localhost:3000/", { timeout: 60000 });

    // open a live match card
    await page.click("text=See Matches");

    // Now we should be on /matches
    await page.waitForURL("**/matches");

    // Click on the first match card's "Score" or "View" button if available, or the card itself.
    // Wait for match cards to load
    await page.waitForSelector('a[href^="/matches/"]');
    const matchLinks = await page.locator('a[href^="/matches/"]');
    if ((await matchLinks.count()) > 0) {
      await matchLinks.first().click();
    } else {
      throw new Error("No matches found");
    }

    // Now we should be on the match detail page, e.g. /matches/[id]
    // click scorer panel 1 (run)
    await page.click('button:has-text("1")');
    // assert timeline has new item within 3s
    await page.waitForSelector("text=1 •", { timeout: 3000 });
    expect(await page.locator("text=1 •").count()).toBeGreaterThan(0);
  });
});
