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

function stringValue(formData: FormData, key: string) {
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

export async function addProjectMemberAction(
	_previousState: MemberActionState,
	formData: FormData,
): Promise<MemberActionState> {
	const parsed = projectMemberCreateSchema.safeParse({
		projectId: stringValue(formData, "projectId"),
		email: stringValue(formData, "email"),
		role: stringValue(formData, "role"),
	});

	if (!parsed.success) {
		return validationState(
			"Please correct the member details",
			parsed.error.flatten().fieldErrors,
		);
	}

	try {
		const user = await requireCurrentUser();
		await addProjectMember(
			parsed.data.projectId,
			user.id,
			parsed.data.email,
			parsed.data.role,
		);
	} catch (error) {
		return {
			message:
				error instanceof Error ? error.message : "Unable to add the member",
		};
	}

	revalidatePath(`/projects/${parsed.data.projectId}`);
	revalidatePath("/projects");
	revalidatePath("/team");
	return { message: "Member added", success: true };
}

export async function updateProjectMemberRoleAction(
	_previousState: MemberActionState,
	formData: FormData,
): Promise<MemberActionState> {
	const parsed = projectMemberUpdateSchema.safeParse({
		projectId: stringValue(formData, "projectId"),
		userId: stringValue(formData, "userId"),
		role: stringValue(formData, "role"),
	});

	if (!parsed.success) {
		return validationState(
			"Please select a valid role",
			parsed.error.flatten().fieldErrors,
		);
	}

	try {
		const user = await requireCurrentUser();
		await updateProjectMemberRole(
			parsed.data.projectId,
			user.id,
			parsed.data.userId,
			parsed.data.role,
		);
	} catch (error) {
		return {
			message:
				error instanceof Error
					? error.message
					: "Unable to update the member role",
		};
	}

	revalidatePath(`/projects/${parsed.data.projectId}`);
	revalidatePath("/projects");
	revalidatePath("/team");
	return { message: "Member role updated", success: true };
}

export async function removeProjectMemberAction(
	_previousState: MemberActionState,
	formData: FormData,
): Promise<MemberActionState> {
	const parsed = projectMemberRemoveSchema.safeParse({
		projectId: stringValue(formData, "projectId"),
		userId: stringValue(formData, "userId"),
	});

	if (!parsed.success) {
		return { message: "Invalid project member" };
	}

	try {
		const user = await requireCurrentUser();
		await removeProjectMember(
			parsed.data.projectId,
			user.id,
			parsed.data.userId,
		);
	} catch (error) {
		return {
			message:
				error instanceof Error ? error.message : "Unable to remove the member",
		};
	}

	revalidatePath(`/projects/${parsed.data.projectId}`);
	revalidatePath("/projects");
	revalidatePath("/dashboard");
	revalidatePath("/team");
	return { message: "Member removed", success: true };
}
