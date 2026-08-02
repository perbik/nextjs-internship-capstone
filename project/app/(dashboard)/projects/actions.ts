"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCurrentUser } from "@/lib/auth/current-user";
import {
	assignProjectToTeam,
	createProject,
	softDeleteProject,
	updateProject,
} from "@/lib/db/mutations";
import {
	projectCreateSchema,
	projectTeamAssignSchema,
	projectUpdateSchema,
} from "@/lib/validations";

export interface ProjectActionState {
	message: string;
	success?: boolean;
	errors?: Record<string, string[]>;
}

function formValue(formData: FormData, key: string) {
	const value = formData.get(key);
	return typeof value === "string" ? value : undefined;
}

function validationState(
	message: string,
	errors: Record<string, string[] | undefined>,
): ProjectActionState {
	return {
		message,
		errors: Object.fromEntries(
			Object.entries(errors).filter((entry): entry is [string, string[]] =>
				Boolean(entry[1]),
			),
		),
	};
}

export async function createProjectAction(
	_previousState: ProjectActionState,
	formData: FormData,
): Promise<ProjectActionState> {
	const parsed = projectCreateSchema.safeParse({
		name: formValue(formData, "name"),
		description: formValue(formData, "description"),
		dueDate: formValue(formData, "dueDate"),
		teamId: formValue(formData, "teamId"),
	});

	if (!parsed.success) {
		return validationState(
			"Please correct the highlighted fields",
			parsed.error.flatten().fieldErrors,
		);
	}

	let projectId: string;

	try {
		const user = await requireCurrentUser();
		projectId = await createProject(user.id, parsed.data);
	} catch (error) {
		return {
			message:
				error instanceof Error ? error.message : "Unable to create the project",
		};
	}

	revalidatePath("/dashboard");
	revalidatePath("/projects");
	revalidatePath("/team");
	redirect(`/projects/${projectId}`);
}

export async function updateProjectAction(
	_previousState: ProjectActionState,
	formData: FormData,
): Promise<ProjectActionState> {
	const projectId = formValue(formData, "projectId");
	const parsed = projectUpdateSchema.safeParse({
		name: formValue(formData, "name"),
		description: formValue(formData, "description"),
		status: formValue(formData, "status"),
		dueDate: formValue(formData, "dueDate"),
	});

	if (!projectId) {
		return { message: "Project ID is required" };
	}

	if (!parsed.success) {
		return validationState(
			"Please correct the highlighted fields",
			parsed.error.flatten().fieldErrors,
		);
	}

	try {
		const user = await requireCurrentUser();
		await updateProject(projectId, user.id, {
			...parsed.data,
			description: parsed.data.description ?? null,
			dueDate: parsed.data.dueDate ?? null,
		});
	} catch (error) {
		return {
			message:
				error instanceof Error ? error.message : "Unable to update the project",
		};
	}

	revalidatePath("/dashboard");
	revalidatePath("/projects");
	revalidatePath(`/projects/${projectId}`);

	return { message: "Project updated successfully", success: true };
}

export async function deleteProjectAction(formData: FormData) {
	const projectId = formValue(formData, "projectId");

	if (!projectId) {
		throw new Error("Project ID is required");
	}

	const user = await requireCurrentUser();
	await softDeleteProject(projectId, user.id);

	revalidatePath("/dashboard");
	revalidatePath("/projects");
	redirect("/projects");
}

export async function assignProjectTeamAction(
	_previousState: ProjectActionState,
	formData: FormData,
): Promise<ProjectActionState> {
	const parsed = projectTeamAssignSchema.safeParse({
		projectId: formValue(formData, "projectId"),
		teamId: formValue(formData, "teamId"),
	});
	if (!parsed.success) {
		return { message: "Select a valid team" };
	}

	try {
		const user = await requireCurrentUser();
		await assignProjectToTeam(
			parsed.data.projectId,
			user.id,
			parsed.data.teamId,
		);
		revalidatePath(`/projects/${parsed.data.projectId}`);
		revalidatePath("/projects");
		revalidatePath("/team");
		return { message: "Project assigned to team", success: true };
	} catch (error) {
		return {
			message:
				error instanceof Error
					? error.message
					: "Unable to assign project team",
		};
	}
}
