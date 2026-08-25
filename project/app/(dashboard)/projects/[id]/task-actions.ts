"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireCurrentUser } from "@/lib/auth/current-user";
import {
	bulkUpdateTasks,
	createTask,
	deleteTask,
	saveBoardLayout,
	updateTask,
} from "@/lib/db/mutations";
import {
	boardLayoutSchema,
	bulkTaskOperationSchema,
	taskCreateSchema,
} from "@/lib/validations";

export interface TaskActionState {
	message: string;
	success?: boolean;
	errors?: Record<string, string[]>;
}

const UUID_SCHEMA = z.uuid();

const TASK_ACTION_MESSAGES = new Set([
	"You must be signed in",
	"Your Brix account is not synchronized yet",
	"You do not have access to this task list",
	"The assignee must be a member of this project",
	"A label cannot be assigned more than once",
	"Every label must belong to this project",
	"You do not have permission to edit this task",
	"A task cannot be moved to a different project",
	"You do not have permission to delete this task",
	"This task has already been deleted",
	"You do not have permission to update this board",
	"The board columns have changed. Reload and try again.",
	"The board tasks have changed. Reload and try again.",
	"Some selected tasks are no longer available. Reload and try again.",
	"The selected column is not part of this project",
	"The assignee must be a project member",
	"The selected label is not part of this project",
]);

// Shared helpers for task form actions
function formValue(formData: FormData, key: string) {
	const value = formData.get(key);
	return typeof value === "string" ? value : undefined;
}

function taskFormData(formData: FormData) {
	return {
		listId: formValue(formData, "listId"),
		title: formValue(formData, "title"),
		description: formValue(formData, "description"),
		priority: formValue(formData, "priority"),
		dueDate: formValue(formData, "dueDate"),
		assigneeId: formValue(formData, "assigneeId"),
		labelIds: formData
			.getAll("labelIds")
			.filter((value): value is string => typeof value === "string"),
	};
}

function validationState(
	message: string,
	errors: Record<string, string[] | undefined>,
): TaskActionState {
	return {
		message,
		errors: Object.fromEntries(
			Object.entries(errors).filter((entry): entry is [string, string[]] =>
				Boolean(entry[1]),
			),
		),
	};
}

function normalizeTaskData(data: z.output<typeof taskCreateSchema>) {
	return {
		listId: data.listId,
		title: data.title,
		description: data.description ?? null,
		priority: data.priority,
		dueDate: data.dueDate ?? null,
		assigneeId: data.assigneeId ?? null,
		labelIds: data.labelIds,
	};
}

function actionError(error: unknown, fallback: string): TaskActionState {
	if (error instanceof Error && TASK_ACTION_MESSAGES.has(error.message)) {
		return { message: error.message };
	}

	console.error(fallback, error);
	return { message: fallback };
}

function revalidateTaskViews(projectId: string) {
	revalidatePath(`/projects/${projectId}`);
	revalidatePath("/projects");
	revalidatePath("/dashboard");
	revalidatePath("/calendar");
	revalidatePath("/analytics");
}

// Create a task from the complete task form
export async function createTaskAction(
	_previousState: TaskActionState,
	formData: FormData,
): Promise<TaskActionState> {
	const projectId = UUID_SCHEMA.safeParse(formValue(formData, "projectId"));
	const parsed = taskCreateSchema.safeParse(taskFormData(formData));

	if (!projectId.success || !parsed.success) {
		return parsed.success
			? { message: "Invalid project ID" }
			: validationState(
					"Please correct the task fields",
					parsed.error.flatten().fieldErrors,
				);
	}

	let savedProjectId: string;

	try {
		const user = await requireCurrentUser();
		const result = await createTask(user.id, normalizeTaskData(parsed.data));
		savedProjectId = result.projectId;
	} catch (error) {
		return actionError(error, "Unable to create the task");
	}

	revalidateTaskViews(savedProjectId);
	return { message: "Task created", success: true };
}

// Update a task from the complete edit form
export async function updateTaskAction(
	_previousState: TaskActionState,
	formData: FormData,
): Promise<TaskActionState> {
	const projectId = UUID_SCHEMA.safeParse(formValue(formData, "projectId"));
	const taskId = UUID_SCHEMA.safeParse(formValue(formData, "taskId"));
	const parsed = taskCreateSchema.safeParse(taskFormData(formData));

	if (!projectId.success || !taskId.success || !parsed.success) {
		return parsed.success
			? { message: "Invalid task or project ID" }
			: validationState(
					"Please correct the task fields",
					parsed.error.flatten().fieldErrors,
				);
	}

	let savedProjectId: string;

	try {
		const user = await requireCurrentUser();
		const result = await updateTask(
			taskId.data,
			user.id,
			normalizeTaskData(parsed.data),
		);
		savedProjectId = result.projectId;
	} catch (error) {
		return actionError(error, "Unable to update the task");
	}

	revalidateTaskViews(savedProjectId);
	return { message: "Task updated", success: true };
}

// Soft-delete a task from an accessible project
export async function deleteTaskAction(
	_previousState: TaskActionState,
	formData: FormData,
): Promise<TaskActionState> {
	const projectId = UUID_SCHEMA.safeParse(formValue(formData, "projectId"));
	const taskId = UUID_SCHEMA.safeParse(formValue(formData, "taskId"));

	if (!projectId.success || !taskId.success) {
		return { message: "Invalid task or project ID" };
	}

	try {
		const user = await requireCurrentUser();
		await deleteTask(taskId.data, projectId.data, user.id);
	} catch (error) {
		return actionError(error, "Unable to delete the task");
	}

	revalidateTaskViews(projectId.data);
	return { message: "Task deleted", success: true };
}

// Persist the complete board order after drag and drop
export async function saveBoardLayoutAction(
	input: unknown,
): Promise<TaskActionState> {
	const parsed = boardLayoutSchema.safeParse(input);

	if (!parsed.success) {
		return { message: "Invalid board layout" };
	}

	try {
		const user = await requireCurrentUser();
		await saveBoardLayout(parsed.data.projectId, user.id, parsed.data.lists);
	} catch (error) {
		return actionError(error, "Unable to save the board");
	}

	revalidateTaskViews(parsed.data.projectId);
	return { message: "Board saved", success: true };
}

// Apply one validated operation to the selected tasks
export async function bulkUpdateTasksAction(
	input: unknown,
): Promise<TaskActionState> {
	const parsed = bulkTaskOperationSchema.safeParse(input);

	if (!parsed.success) {
		return {
			message:
				parsed.error.issues[0]?.message ??
				"Select valid tasks and a bulk action",
		};
	}

	try {
		const user = await requireCurrentUser();
		await bulkUpdateTasks(user.id, parsed.data);
	} catch (error) {
		return actionError(error, "Unable to update the selected tasks");
	}

	revalidateTaskViews(parsed.data.projectId);
	return {
		message: `${parsed.data.taskIds.length} ${
			parsed.data.taskIds.length === 1 ? "task" : "tasks"
		} updated`,
		success: true,
	};
}
