import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { CreateProjectModal } from "@/components/project/create-project-modal";

const { createProjectActionMock } = vi.hoisted(() => ({
	createProjectActionMock: vi.fn(),
}));

vi.mock("@/app/(dashboard)/projects/actions", () => ({
	createProjectAction: createProjectActionMock,
}));

const TEAM_ID = "ae95cc4c-1212-4c0f-b320-61386256ad81";
const teams = [{ id: TEAM_ID, name: "Product Team" }];

function renderModal() {
	return render(<CreateProjectModal teams={teams} defaultTeamId={TEAM_ID} />);
}

async function openModal() {
	const user = userEvent.setup();
	await user.click(screen.getByRole("button", { name: "New Project" }));
	return user;
}

describe("CreateProjectModal", () => {
	beforeEach(() => {
		createProjectActionMock.mockReset();
	});

	test("renders project creation fields", async () => {
		renderModal();
		await openModal();

		expect(screen.getByRole("dialog")).toBeInTheDocument();
		expect(screen.getByLabelText("Name")).toBeInTheDocument();
		expect(screen.getByLabelText("Description")).toBeInTheDocument();
		expect(screen.getByLabelText("Due date")).toBeInTheDocument();
		expect(screen.getByLabelText("Team")).toBeInTheDocument();
	});

	test("blocks submission when the required name is empty", async () => {
		renderModal();
		const user = await openModal();

		await user.click(screen.getByRole("button", { name: "Create project" }));

		expect(createProjectActionMock).not.toHaveBeenCalled();
		expect(screen.getByLabelText("Name")).toBeInvalid();
	});

	test("submits valid project data including the selected team", async () => {
		let submittedData: Record<string, FormDataEntryValue> = {};
		createProjectActionMock.mockImplementation(
			async (_previousState: unknown, formData: FormData) => {
				submittedData = Object.fromEntries(formData.entries());
				return { message: "Project created", success: true };
			},
		);
		renderModal();
		const user = await openModal();

		await user.type(screen.getByLabelText("Name"), "Test Project");
		await user.type(screen.getByLabelText("Description"), "Test description");
		await user.click(screen.getByRole("button", { name: "Create project" }));

		await waitFor(() => expect(createProjectActionMock).toHaveBeenCalledOnce());
		expect(submittedData).toMatchObject({
			name: "Test Project",
			description: "Test description",
			teamId: TEAM_ID,
			dueDate: "",
		});
		await waitFor(() =>
			expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
		);
	});

	test("pending submission prevents duplicate requests", async () => {
		let resolveAction: ((state: { message: string }) => void) | undefined;
		createProjectActionMock.mockImplementation(
			() =>
				new Promise((resolve) => {
					resolveAction = resolve;
				}),
		);
		renderModal();
		const user = await openModal();
		await user.type(screen.getByLabelText("Name"), "Test Project");

		const submitButton = screen.getByRole("button", {
			name: "Create project",
		});
		await user.click(submitButton);

		await waitFor(() =>
			expect(
				screen.getByRole("button", { name: "Creating..." }),
			).toBeDisabled(),
		);
		await user.click(screen.getByRole("button", { name: "Creating..." }));
		expect(createProjectActionMock).toHaveBeenCalledOnce();

		resolveAction?.({ message: "Unable to create the project" });
		await screen.findByRole("alert");
	});

	test("shows a server failure and keeps the form open", async () => {
		createProjectActionMock.mockResolvedValue({
			message: "Unable to create the project",
		});
		renderModal();
		const user = await openModal();
		await user.type(screen.getByLabelText("Name"), "Test Project");

		await user.click(screen.getByRole("button", { name: "Create project" }));

		expect(await screen.findByRole("alert")).toHaveTextContent(
			"Unable to create the project",
		);
		expect(screen.getByRole("dialog")).toBeInTheDocument();
	});
});
