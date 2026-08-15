"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/lib/auth/current-user";
import {
	addProjectMember,
	removeProjectMember,
	updateProjectMemberRole,
} from "@/lib/db/mutations";
import {
	projectMemberCreateSchema,
	projectMemberRemoveSchema,
	projectMemberUpdateSchema,
} from "@/lib/validations";

export interface MemberActionState {
	message: string;
	success?: boolean;
	errors?: Record<string, string[]>;
}

const MEMBER_ACTION_MESSAGES = new Set([
	"You must be signed in",
	"Your ProjectFlow account is not synchronized yet",
	"You do not have permission to manage project members",
	"Only the project owner can add administrators",
	"Assign this project to a team before adding collaborators",
	"Invite this user to the team before adding them to the project",
	"This user is already a project member",
	"Only the project owner can change member roles",
	"The project owner's role cannot be changed",
	"Project member not found",
	"The project owner cannot be removed",
	"Administrators can only remove regular members",
]);

// Shared helpers for project member actions
function formValue(formData: FormData, key: string) {
	const value = formData.get(key);
	return typeof value === "string" ? value : undefined;
}

function validationState(
	message: string,
	errors: Record<string, string[] | undefined>,
): MemberActionState {
	return {
		message,
		errors: Object.fromEntries(
			Object.entries(errors).filter((entry): entry is [string, string[]] =>
				Boolean(entry[1]),
			),
		),
	};
}

function actionError(error: unknown, fallback: string): MemberActionState {
	if (error instanceof Error && MEMBER_ACTION_MESSAGES.has(error.message)) {
		return { message: error.message };
	}

	console.error(fallback, error);
	return { message: fallback };
}

function revalidateMemberViews(projectId: string) {
	revalidatePath(`/projects/${projectId}`);
	revalidatePath("/projects");
	revalidatePath("/dashboard");
	revalidatePath("/team");
	revalidatePath("/calendar");
	revalidatePath("/analytics");
}

// Add an eligible team member to the project
export async function addProjectMemberAction(
	_previousState: MemberActionState,
	formData: FormData,
): Promise<MemberActionState> {
	let projectId: string;

	try {
		const user = await requireCurrentUser();
		const parsed = projectMemberCreateSchema.safeParse({
			projectId: formValue(formData, "projectId"),
			userId: formValue(formData, "userId"),
			role: formValue(formData, "role"),
		});

		if (!parsed.success) {
			return validationState(
				"Please correct the member details",
				parsed.error.flatten().fieldErrors,
			);
		}

		projectId = parsed.data.projectId;
		await addProjectMember(
			projectId,
			user.id,
			parsed.data.userId,
			parsed.data.role,
		);
	} catch (error) {
		return actionError(error, "Unable to add the member");
	}

	revalidateMemberViews(projectId);
	return { message: "Member added", success: true };
}

// Change a project member's role
export async function updateProjectMemberRoleAction(
	_previousState: MemberActionState,
	formData: FormData,
): Promise<MemberActionState> {
	let projectId: string;

	try {
		const user = await requireCurrentUser();
		const parsed = projectMemberUpdateSchema.safeParse({
			projectId: formValue(formData, "projectId"),
			userId: formValue(formData, "userId"),
			role: formValue(formData, "role"),
		});

		if (!parsed.success) {
			return validationState(
				"Please select a valid role",
				parsed.error.flatten().fieldErrors,
			);
		}

		projectId = parsed.data.projectId;
		await updateProjectMemberRole(
			projectId,
			user.id,
			parsed.data.userId,
			parsed.data.role,
		);
	} catch (error) {
		return actionError(error, "Unable to update the member role");
	}

	revalidateMemberViews(projectId);
	return { message: "Member role updated", success: true };
}

// Remove a collaborator and unassign their project tasks
export async function removeProjectMemberAction(
	_previousState: MemberActionState,
	formData: FormData,
): Promise<MemberActionState> {
	let projectId: string;

	try {
		const user = await requireCurrentUser();
		const parsed = projectMemberRemoveSchema.safeParse({
			projectId: formValue(formData, "projectId"),
			userId: formValue(formData, "userId"),
		});

		if (!parsed.success) {
			return { message: "Invalid project member" };
		}

		projectId = parsed.data.projectId;
		await removeProjectMember(projectId, user.id, parsed.data.userId);
	} catch (error) {
		return actionError(error, "Unable to remove the member");
	}

	revalidateMemberViews(projectId);
	return { message: "Member removed", success: true };
}
