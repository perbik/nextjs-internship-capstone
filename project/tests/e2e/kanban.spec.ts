import { clerk } from "@clerk/testing/playwright";
import { expect, type Locator, type Page, test } from "@playwright/test";

const TEST_USER_EMAIL = process.env.E2E_CLERK_USER_EMAIL;
const SERVER_ACTION_TIMEOUT = 30_000;

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
	const projectName = `E2E Kanban ${crypto.randomUUID().slice(0, 8)}`;

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

async function createTask(page: Page, title: string) {
	await page
		.getByRole("button", { name: /^Add task to column:/ })
		.first()
		.click();
	await page.getByLabel("Title").fill(title);
	await page.getByRole("button", { name: "Create task" }).click();

	await expect(page.getByRole("dialog", { name: "Create Task" })).toBeHidden({
		timeout: SERVER_ACTION_TIMEOUT,
	});
	await expect(taskCard(page, title)).toBeVisible();
}

function taskCard(page: Page, title: string) {
	return page.getByRole("button", {
		name: new RegExp(`^${title}\\. Drag`),
	});
}

// dnd-kit requires real pointer movement rather than HTML5 drag events
async function dragTaskToColumn(
	page: Page,
	task: Locator,
	destination: Locator,
) {
	await destination.scrollIntoViewIfNeeded();
	const sourceBox = await task.boundingBox();
	const destinationBox = await destination.boundingBox();

	expect(sourceBox).not.toBeNull();
	expect(destinationBox).not.toBeNull();
	if (!sourceBox || !destinationBox) return;

	await page.mouse.move(
		sourceBox.x + sourceBox.width / 2,
		sourceBox.y + sourceBox.height / 2,
	);
	await page.mouse.down();
	await page.mouse.move(sourceBox.x + sourceBox.width / 2 + 8, sourceBox.y, {
		steps: 3,
	});
	await page.mouse.move(
		destinationBox.x + destinationBox.width / 2,
		destinationBox.y + destinationBox.height / 2,
		{ steps: 15 },
	);
	await page.mouse.up();
}

test("persists a task moved between Kanban columns after reload", async ({
	page,
}) => {
	const taskTitle = `E2E Move ${crypto.randomUUID().slice(0, 8)}`;

	await createDisposableProject(page);
	await createTask(page, taskTitle);

	const columns = page.getByRole("region", { name: / column$/ });
	await expect.poll(() => columns.count()).toBeGreaterThanOrEqual(2);
	const sourceColumn = columns.nth(0);
	const destinationColumn = columns.nth(1);
	const task = taskCard(page, taskTitle);

	// Wait for the Server Action before reloading so persistence is tested, not only optimistic state
	const persistenceResponse = page.waitForResponse(
		(response) =>
			response.request().method() === "POST" &&
			Boolean(response.request().headers()["next-action"]),
		{ timeout: SERVER_ACTION_TIMEOUT },
	);
	await dragTaskToColumn(page, task, destinationColumn);

	await expect(
		destinationColumn.getByText(taskTitle, { exact: true }),
	).toBeVisible();
	await expect(sourceColumn.getByText(taskTitle, { exact: true })).toHaveCount(
		0,
	);
	await persistenceResponse;

	await page.reload();
	await expect(page.getByLabel("Loading project board")).toBeHidden();
	await expect(
		destinationColumn.getByText(taskTitle, { exact: true }),
	).toBeVisible();
	await expect(sourceColumn.getByText(taskTitle, { exact: true })).toHaveCount(
		0,
	);
});
