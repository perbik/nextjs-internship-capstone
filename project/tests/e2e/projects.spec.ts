import { clerk } from "@clerk/testing/playwright";
import { expect, type Page, test } from "@playwright/test";

const TEST_USER_EMAIL = process.env.E2E_CLERK_USER_EMAIL;
const SERVER_ACTION_TIMEOUT = 30_000;

test.describe.configure({ mode: "serial" });
test.setTimeout(60_000);

async function signIn(page: Page) {
	test.skip(
		!TEST_USER_EMAIL,
		"Set E2E_CLERK_USER_EMAIL to an existing dedicated Clerk test user",
	);

	await page.goto("/");
	await clerk.signIn({ page, emailAddress: TEST_USER_EMAIL as string });
}

async function selectFirstManagedTeam(page: Page) {
	const teamSelect = page.getByLabel("Team");
	await expect(
		teamSelect,
		"The E2E user must own or administer at least one team",
	).toBeEnabled();
	await teamSelect.click();
	await page.getByRole("option").first().click();
}

test("creates a project and opens it from the project list", async ({
	page,
}) => {
	const projectName = `E2E Project ${Date.now()}`;
	await signIn(page);
	await page.goto("/projects");

	await page.getByRole("button", { name: "New Project" }).click();
	await page.getByLabel("Name").fill(projectName);
	await page
		.getByLabel("Description")
		.fill("Disposable project created by the Playwright workflow test.");
	await selectFirstManagedTeam(page);
	await page.getByRole("button", { name: "Create project" }).click();

	await expect(page).toHaveURL(/\/projects\/[0-9a-f-]+$/, {
		timeout: SERVER_ACTION_TIMEOUT,
	});
	await expect(page.getByRole("heading", { name: projectName })).toBeVisible();

	await page.goto("/projects");
	const projectLink = page.getByRole("link", { name: `Open ${projectName}` });
	await expect(projectLink).toBeVisible();
	await projectLink.click();

	await expect(page).toHaveURL(/\/projects\/[0-9a-f-]+$/, {
		timeout: SERVER_ACTION_TIMEOUT,
	});
	await expect(page.getByRole("heading", { name: projectName })).toBeVisible();
});

test("blocks project creation when the required name is empty", async ({
	page,
}) => {
	await signIn(page);
	await page.goto("/projects");

	await page.getByRole("button", { name: "New Project" }).click();
	await selectFirstManagedTeam(page);
	await page.getByRole("button", { name: "Create project" }).click();

	const nameIsValid = await page
		.getByLabel("Name")
		.evaluate((input: HTMLInputElement) => input.validity.valid);
	expect(nameIsValid).toBe(false);
	await expect(page).toHaveURL(/\/projects(?:\?|$)/);
	await expect(
		page.getByRole("dialog", { name: "Create Project" }),
	).toBeVisible();
});
