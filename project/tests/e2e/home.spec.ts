import { expect, test } from "@playwright/test";

test("loads the landing page", async ({ page }) => {
	await page.goto("/");
	await expect(page).toHaveURL("/");
});
