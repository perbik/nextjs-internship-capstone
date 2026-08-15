"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireCurrentUser } from "@/lib/auth/current-user";
import {
	createProject,
	softDeleteProject,
	updateProject,
} from "@/lib/db/mutations";
import { projectCreateSchema, projectUpdateSchema } from "@/lib/validations";

export interface ProjectActionState {
	message: string;
	success?: boolean;
	errors?: Record<string, string[]>;
}

const PROJECT_ID_SCHEMA = z.uuid("Project must be a valid ID");

const PROJECT_ACTION_MESSAGES = new Set([
	"You must be signed in",
	"Your Brix account is not synchronized yet",
	"Only a team owner or administrator can create projects for this team",
	"You do not have permission to update this project",
	"Only the project owner can delete this project",
	"Project not found",
]);

// Shared helpers for project form actions
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

function actionError(error: unknown, fallback: string): ProjectActionState {
	if (error instanceof Error && PROJECT_ACTION_MESSAGES.has(error.message)) {
		return { message: error.message };
	}

	console.error(fallback, error);
	return { message: fallback };
}

function revalidateProjectViews(projectId?: string) {
	revalidatePath("/dashboard");
	revalidatePath("/projects");
	revalidatePath("/team");
	revalidatePath("/analytics");
	revalidatePath("/calendar");

	if (projectId) revalidatePath(`/projects/${projectId}`);
}

// Create a project and continue to its board
export async function createProjectAction(
	_previousState: ProjectActionState,
	formData: FormData,
): Promise<ProjectActionState> {
	let projectId: string;

	try {
		const user = await requireCurrentUser();
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

		projectId = await createProject(user.id, parsed.data);
	} catch (error) {
		return actionError(error, "Unable to create the project");
	}

	revalidateProjectViews(projectId);
	redirect(`/projects/${projectId}`);
}

// Update project details that the current user can manage
export async function updateProjectAction(
	_previousState: ProjectActionState,
	formData: FormData,
): Promise<ProjectActionState> {
	const projectId = PROJECT_ID_SCHEMA.safeParse(
		formValue(formData, "projectId"),
	);

	if (!projectId.success) {
		return { message: "Invalid project ID" };
	}

	try {
		const user = await requireCurrentUser();
		const parsed = projectUpdateSchema.safeParse({
			name: formValue(formData, "name"),
			description: formValue(formData, "description"),
			status: formValue(formData, "status"),
			dueDate: formValue(formData, "dueDate"),
		});

		if (!parsed.success) {
			return validationState(
				"Please correct the highlighted fields",
				parsed.error.flatten().fieldErrors,
			);
		}

		await updateProject(projectId.data, user.id, {
			...parsed.data,
			description: parsed.data.description ?? null,
			dueDate: parsed.data.dueDate ?? null,
		});
	} catch (error) {
		return actionError(error, "Unable to update the project");
	}

	revalidateProjectViews(projectId.data);

	return { message: "Project updated successfully", success: true };
}

// Soft-delete a project owned by the current user
export async function deleteProjectAction(
	_previousState: ProjectActionState,
	formData: FormData,
): Promise<ProjectActionState> {
	const projectId = PROJECT_ID_SCHEMA.safeParse(
		formValue(formData, "projectId"),
	);

	if (!projectId.success) {
		return { message: "Invalid project ID" };
	}

	try {
		const user = await requireCurrentUser();
		await softDeleteProject(projectId.data, user.id);
	} catch (error) {
		return actionError(error, "Unable to delete the project");
	}

	revalidateProjectViews(projectId.data);
	redirect("/projects");
}
