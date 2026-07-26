"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { createTask, saveBoardLayout, updateTask } from "@/lib/db/mutations";
import {
	boardLayoutSchema,
	taskCreateSchema,
	taskUpdateSchema,
} from "@/lib/validations";

export interface TaskActionState {
	message: string;
	success?: boolean;
	errors?: Record<string, string[]>;
}

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

export async function createTaskAction(
	_previousState: TaskActionState,
	formData: FormData,
): Promise<TaskActionState> {
	const projectId = z.uuid().safeParse(formValue(formData, "projectId"));
	const parsed = taskCreateSchema.safeParse(taskFormData(formData));

	if (!projectId.success || !parsed.success) {
		return parsed.success
			? { message: "Invalid project ID" }
			: validationState(
					"Please correct the task fields",
					parsed.error.flatten().fieldErrors,
				);
	}

	try {
		const user = await requireCurrentUser();
		await createTask(user.id, normalizeTaskData(parsed.data));
	} catch (error) {
		return {
			message:
				error instanceof Error ? error.message : "Unable to create the task",
		};
	}

	revalidatePath(`/projects/${projectId.data}`);
	revalidatePath("/projects");
	revalidatePath("/dashboard");
	return { message: "Task created", success: true };
}

export async function updateTaskAction(
	_previousState: TaskActionState,
	formData: FormData,
): Promise<TaskActionState> {
	const projectId = z.uuid().safeParse(formValue(formData, "projectId"));
	const taskId = z.uuid().safeParse(formValue(formData, "taskId"));
	const parsed = taskUpdateSchema.safeParse(taskFormData(formData));

	if (!projectId.success || !taskId.success || !parsed.success) {
		return parsed.success
			? { message: "Invalid task or project ID" }
			: validationState(
					"Please correct the task fields",
					parsed.error.flatten().fieldErrors,
				);
	}

	const completeTask = taskCreateSchema.safeParse(parsed.data);

	if (!completeTask.success) {
		return validationState(
			"Please complete the required task fields",
			completeTask.error.flatten().fieldErrors,
		);
	}

	try {
		const user = await requireCurrentUser();
		await updateTask(
			taskId.data,
			user.id,
			normalizeTaskData(completeTask.data),
		);
	} catch (error) {
		return {
			message:
				error instanceof Error ? error.message : "Unable to update the task",
		};
	}

	revalidatePath(`/projects/${projectId.data}`);
	revalidatePath("/projects");
	revalidatePath("/dashboard");
	return { message: "Task updated", success: true };
}

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
		return {
			message:
				error instanceof Error ? error.message : "Unable to save the board",
		};
	}

	return { message: "Board saved", success: true };
}
