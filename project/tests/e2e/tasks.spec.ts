import { clerk } from "@clerk/testing/playwright";
import { expect, type Page, test } from "@playwright/test";

const TEST_USER_EMAIL = process.env.E2E_CLERK_USER_EMAIL;
const SERVER_ACTION_TIMEOUT = 30_000;

test.describe.configure({ mode: "serial" });
test.setTimeout(90_000);

async function signIn(page: Page) {
	test.skip(
		!TEST_USER_EMAIL,
		"Set E2E_CLERK_USER_EMAIL to an existing dedicated Clerk test user",
	);

	await page.goto("/");
	await clerk.signIn({ page, emailAddress: TEST_USER_EMAIL as string });
}

async function createDisposableProject(page: Page) {
	const projectName = `E2E Tasks ${crypto.randomUUID().slice(0, 8)}`;

	await signIn(page);
	await page.goto("/projects");
	await page.getByRole("button", { name: "New Project" }).click();
	await page.getByLabel("Name").fill(projectName);

	const teamSelect = page.getByLabel("Team");
	await expect(
		teamSelect,
		"The E2E user must own or administer at least one team",
	).toBeEnabled();
	await teamSelect.click();
	await page.getByRole("option").first().click();
	await page.getByRole("button", { name: "Create project" }).click();

	await expect(page).toHaveURL(/\/projects\/[0-9a-f-]+$/, {
		timeout: SERVER_ACTION_TIMEOUT,
	});
	await page.reload();
	await expect(page.getByRole("heading", { name: projectName })).toBeVisible();
	await expect(page.getByLabel("Loading project board")).toBeHidden();
}

async function openCreateTaskDialog(page: Page) {
	await page
		.getByRole("button", { name: /^Add task to column:/ })
		.first()
		.click();
	await expect(page.getByRole("dialog", { name: "Create Task" })).toBeVisible();
}

async function createTask(page: Page, title: string) {
	await openCreateTaskDialog(page);
	await page.getByLabel("Title").fill(title);
	await page.getByRole("button", { name: "Create task" }).click();

	await expect(page.getByRole("dialog", { name: "Create Task" })).toBeHidden({
		timeout: SERVER_ACTION_TIMEOUT,
	});
	await expect(page.getByText(title, { exact: true })).toBeVisible();
}

test("creates a task on a project board", async ({ page }) => {
	const taskTitle = `E2E Task ${crypto.randomUUID().slice(0, 8)}`;

	await createDisposableProject(page);
	await createTask(page, taskTitle);
});

test("edits a task title and priority", async ({ page }) => {
	const originalTitle = `E2E Task ${crypto.randomUUID().slice(0, 8)}`;
	const updatedTitle = `${originalTitle} Updated`;

	await createDisposableProject(page);
	await createTask(page, originalTitle);

	await page
		.getByRole("button", {
			name: new RegExp(`^${originalTitle}\\. Drag`),
		})
		.click();
	await expect(
		page.getByRole("dialog", { name: "Task Details" }),
	).toBeVisible();

	await page.getByLabel("Title").fill(updatedTitle);
	await page.getByLabel("Priority").click();
	await page.getByRole("option", { name: "High" }).click();
	await page.getByRole("button", { name: "Save task" }).click();

	await expect(page.getByRole("dialog", { name: "Task Details" })).toBeHidden({
		timeout: SERVER_ACTION_TIMEOUT,
	});
	const updatedTask = page.getByRole("button", {
		name: new RegExp(`^${updatedTitle}\\. Drag`),
	});
	await expect(updatedTask).toBeVisible();
	await expect(updatedTask.getByText("high", { exact: true })).toBeVisible();
});

test("blocks task creation when the required title is empty", async ({
	page,
}) => {
	await createDisposableProject(page);
	await openCreateTaskDialog(page);
	await page.getByRole("button", { name: "Create task" }).click();

	const titleIsValid = await page
		.getByLabel("Title")
		.evaluate((input: HTMLInputElement) => input.validity.valid);
	expect(titleIsValid).toBe(false);
	await expect(page.getByRole("dialog", { name: "Create Task" })).toBeVisible();
});
