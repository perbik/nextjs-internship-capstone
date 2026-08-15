"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/lib/auth/current-user";
import {
	addTeamMember,
	createTeam,
	removeTeamMember,
	updateTeamMemberRole,
} from "@/lib/db/mutations";
import {
	teamCreateSchema,
	teamMemberCreateSchema,
	teamMemberRemoveSchema,
	teamMemberUpdateSchema,
} from "@/lib/validations";

export interface TeamActionState {
	message: string;
	success?: boolean;
	errors?: Record<string, string[]>;
}

const value = (data: FormData, key: string) => {
	const entry = data.get(key);
	return typeof entry === "string" ? entry : undefined;
};

export async function createTeamAction(
	_previous: TeamActionState,
	formData: FormData,
): Promise<TeamActionState> {
	const parsed = teamCreateSchema.safeParse({
		name: value(formData, "name"),
		description: value(formData, "description"),
	});
	if (!parsed.success) {
		return {
			message: "Please correct the team details",
			errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
		};
	}
	try {
		const user = await requireCurrentUser();
		await createTeam(user.id, parsed.data);
		revalidatePath("/team");
		revalidatePath("/projects");
		return { message: "Team created", success: true };
	} catch (error) {
		return {
			message: error instanceof Error ? error.message : "Unable to create team",
		};
	}
}

export async function addTeamMemberAction(
	_previous: TeamActionState,
	formData: FormData,
): Promise<TeamActionState> {
	const parsed = teamMemberCreateSchema.safeParse({
		teamId: value(formData, "teamId"),
		email: value(formData, "email"),
		role: value(formData, "role"),
	});
	if (!parsed.success) return { message: "Enter valid member details" };
	try {
		const user = await requireCurrentUser();
		await addTeamMember(
			parsed.data.teamId,
			user.id,
			parsed.data.email,
			parsed.data.role,
		);
		revalidatePath("/team");
		return { message: "Member invited to team", success: true };
	} catch (error) {
		return {
			message: error instanceof Error ? error.message : "Unable to add member",
		};
	}
}

export async function updateTeamMemberRoleAction(
	_previous: TeamActionState,
	formData: FormData,
): Promise<TeamActionState> {
	const parsed = teamMemberUpdateSchema.safeParse({
		teamId: value(formData, "teamId"),
		userId: value(formData, "userId"),
		role: value(formData, "role"),
	});
	if (!parsed.success) return { message: "Invalid team member role" };
	try {
		const user = await requireCurrentUser();
		await updateTeamMemberRole(
			parsed.data.teamId,
			user.id,
			parsed.data.userId,
			parsed.data.role,
		);
		revalidatePath("/team");
		return { message: "Role updated", success: true };
	} catch (error) {
		return {
			message: error instanceof Error ? error.message : "Unable to update role",
		};
	}
}

export async function removeTeamMemberAction(
	_previous: TeamActionState,
	formData: FormData,
): Promise<TeamActionState> {
	const parsed = teamMemberRemoveSchema.safeParse({
		teamId: value(formData, "teamId"),
		userId: value(formData, "userId"),
	});
	if (!parsed.success) return { message: "Invalid team member" };
	try {
		const user = await requireCurrentUser();
		await removeTeamMember(parsed.data.teamId, user.id, parsed.data.userId);
		revalidatePath("/team");
		revalidatePath("/projects", "layout");
		revalidatePath("/dashboard");
		return { message: "Member removed", success: true };
	} catch (error) {
		return {
			message:
				error instanceof Error ? error.message : "Unable to remove member",
		};
	}
}
