import { clerk } from "@clerk/testing/playwright";
import { expect, test } from "@playwright/test";

const TEST_USER_EMAIL = process.env.E2E_CLERK_USER_EMAIL;

test("signed-out user cannot access the protected dashboard", async ({
	page,
}) => {
	await page.goto("/dashboard");

	await expect(page).toHaveURL(/\/sign-in(?:\?|$)/);
	await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
});

test("dedicated test user can access the dashboard", async ({ page }) => {
	test.skip(
		!TEST_USER_EMAIL,
		"Set E2E_CLERK_USER_EMAIL to a dedicated Clerk test user's email",
	);

	await page.goto("/");
	await clerk.signIn({ page, emailAddress: TEST_USER_EMAIL as string });
	await page.goto("/dashboard");

	await expect(page).toHaveURL(/\/dashboard(?:\?|$)/);
	await expect(
		page.getByText("Welcome back. Here is the latest overview of your work."),
	).toBeVisible();
});
