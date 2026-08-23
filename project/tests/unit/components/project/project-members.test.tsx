import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { ProjectMembersManager } from "@/components/project/members";
import type { ManagedProjectMember } from "@/components/project/members/types";

const {
	addProjectMemberActionMock,
	removeProjectMemberActionMock,
	updateProjectMemberRoleActionMock,
	refreshMock,
} = vi.hoisted(() => ({
	addProjectMemberActionMock: vi.fn(),
	removeProjectMemberActionMock: vi.fn(),
	updateProjectMemberRoleActionMock: vi.fn(),
	refreshMock: vi.fn(),
}));

vi.mock("@/app/(dashboard)/projects/[id]/member-actions", () => ({
	addProjectMemberAction: addProjectMemberActionMock,
	removeProjectMemberAction: removeProjectMemberActionMock,
	updateProjectMemberRoleAction: updateProjectMemberRoleActionMock,
}));

vi.mock("next/navigation", () => ({
	useRouter: () => ({ refresh: refreshMock }),
}));

vi.mock("sonner", () => ({
	toast: { success: vi.fn() },
}));

vi.mock("@/components/ui/form-select", () => ({
	FormSelect: ({
		name,
		value,
		onValueChange,
		options,
		disabled,
		ariaLabel,
	}: {
		name?: string;
		value?: string;
		onValueChange?: (value: string) => void;
		options: Array<{ value: string; label: string }>;
		disabled?: boolean;
		ariaLabel?: string;
	}) => (
		<select
			name={name}
			value={value}
			onChange={(event) => onValueChange?.(event.target.value)}
			disabled={disabled}
			aria-label={ariaLabel}
		>
			{options.map((option) => (
				<option key={option.value} value={option.value}>
					{option.label}
				</option>
			))}
		</select>
	),
}));

// The shared dialog is tested separately; expose its confirmation form here.
vi.mock("@/components/ui/destructive-action-dialog", () => ({
	DestructiveActionDialog: ({
		trigger,
		action,
		fields,
		confirmLabel,
	}: {
		trigger: ReactNode;
		action: (formData: FormData) => void;
		fields: Array<{ name: string; value: string }>;
		confirmLabel: string;
	}) => (
		<div>
			{trigger}
			<form action={action}>
				{fields.map((field) => (
					<input
						key={field.name}
						type="hidden"
						name={field.name}
						value={field.value}
					/>
				))}
				<button type="submit">{confirmLabel}</button>
			</form>
		</div>
	),
}));

const PROJECT_ID = "f3f86f44-9551-4522-a03d-63744d83862f";
const OWNER_ID = "ef04987c-3d1f-40e8-a7db-d220786fa974";
const ADMIN_ID = "72a7dd47-ea15-450c-b89d-332efb2d2c73";
const MEMBER_ID = "30315c4b-256c-4be7-bbdb-0c60fb0dc9cc";

const members: ManagedProjectMember[] = [
	{
		id: OWNER_ID,
		name: "Olivia Owner",
		email: "owner@example.com",
		role: "owner",
		isCurrentUser: true,
	},
	{
		id: ADMIN_ID,
		name: "Alex Admin",
		email: "admin@example.com",
		role: "admin",
		isCurrentUser: false,
	},
	{
		id: MEMBER_ID,
		name: "Morgan Member",
		email: "member@example.com",
		role: "member",
		isCurrentUser: false,
	},
];

function renderManager(actorRole: "owner" | "admin") {
	return render(
		<ProjectMembersManager
			projectId={PROJECT_ID}
			members={members}
			actorRole={actorRole}
			eligibleMembers={[]}
		/>,
	);
}

function memberRow(name: string) {
	return screen.getByText(name, { exact: false }).closest("li");
}

describe("ProjectMembersManager permissions", () => {
	beforeEach(() => {
		addProjectMemberActionMock.mockReset();
		removeProjectMemberActionMock.mockReset();
		updateProjectMemberRoleActionMock.mockReset();
		refreshMock.mockReset();
	});

	test("owner sees role and removal controls for non-owner collaborators", () => {
		renderManager("owner");

		const owner = memberRow("Olivia Owner");
		const admin = memberRow("Alex Admin");
		const member = memberRow("Morgan Member");

		expect(owner).not.toBeNull();
		expect(admin).not.toBeNull();
		expect(member).not.toBeNull();
		expect(within(owner as HTMLElement).queryByRole("combobox")).toBeNull();
		expect(
			within(owner as HTMLElement).queryByRole("button", { name: /remove/i }),
		).toBeNull();
		expect(within(admin as HTMLElement).getByRole("combobox")).toHaveValue(
			"admin",
		);
		expect(
			within(admin as HTMLElement).getByRole("button", {
				name: "Remove Alex Admin from project",
			}),
		).toBeInTheDocument();
		expect(within(member as HTMLElement).getByRole("combobox")).toHaveValue(
			"member",
		);
	});

	test("admin receives controls only for regular members", () => {
		renderManager("admin");

		expect(screen.queryByRole("combobox", { name: /role for/i })).toBeNull();
		expect(
			screen.queryByRole("button", { name: /remove olivia owner/i }),
		).toBeNull();
		expect(
			screen.queryByRole("button", { name: /remove alex admin/i }),
		).toBeNull();
		expect(
			screen.getByRole("button", { name: /remove morgan member/i }),
		).toBeInTheDocument();
	});

	test("regular member row does not receive restricted owner-level controls", () => {
		renderManager("admin");
		const member = memberRow("Morgan Member");

		expect(member).not.toBeNull();
		expect(within(member as HTMLElement).queryByRole("combobox")).toBeNull();
		expect(
			within(member as HTMLElement).getByRole("button", {
				name: "Remove Morgan Member from project",
			}),
		).toBeInTheDocument();
	});

	test("removal confirmation submits the project and member IDs", async () => {
		let submittedData: Record<string, FormDataEntryValue> = {};
		removeProjectMemberActionMock.mockImplementation(
			async (_previousState: unknown, formData: FormData) => {
				submittedData = Object.fromEntries(formData.entries());
				return { message: "Member removed", success: true };
			},
		);
		renderManager("admin");

		await userEvent
			.setup()
			.click(screen.getByRole("button", { name: "Remove collaborator" }));

		await waitFor(() =>
			expect(removeProjectMemberActionMock).toHaveBeenCalledOnce(),
		);
		expect(submittedData).toEqual({
			projectId: PROJECT_ID,
			userId: MEMBER_ID,
		});
	});

	test("owner can submit a supported member role change", async () => {
		let submittedData: Record<string, FormDataEntryValue> = {};
		updateProjectMemberRoleActionMock.mockImplementation(
			async (_previousState: unknown, formData: FormData) => {
				submittedData = Object.fromEntries(formData.entries());
				return { message: "Member role updated", success: true };
			},
		);
		renderManager("owner");
		const user = userEvent.setup();

		await user.selectOptions(
			screen.getByRole("combobox", { name: "Role for Morgan Member" }),
			"admin",
		);
		await user.click(
			within(memberRow("Morgan Member") as HTMLElement).getByRole("button", {
				name: "Save",
			}),
		);

		await waitFor(() =>
			expect(updateProjectMemberRoleActionMock).toHaveBeenCalledOnce(),
		);
		expect(submittedData).toEqual({
			projectId: PROJECT_ID,
			userId: MEMBER_ID,
			role: "admin",
		});
	});

	test("restricted role changes are blocked by omitting role controls", () => {
		renderManager("admin");

		expect(screen.queryByRole("combobox", { name: /role for/i })).toBeNull();
		expect(screen.queryByRole("button", { name: "Save" })).toBeNull();
		expect(updateProjectMemberRoleActionMock).not.toHaveBeenCalled();
	});
});
