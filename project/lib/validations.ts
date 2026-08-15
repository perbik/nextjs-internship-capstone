import { z } from "zod";
import {
	projectMemberRole,
	projectStatus,
	taskPriority,
} from "@/lib/db/schema";

// Values from the db that keep validation aligned with the persisted enums
const PROJECT_STATUSES = projectStatus.enumValues;
const PROJECT_ROLES = projectMemberRole.enumValues;
const TASK_PRIORITIES = taskPriority.enumValues;

const MANAGEABLE_MEMBER_ROLES = ["admin", "member"] as const;

// Shared form-field validation
const requiredText = (field: string, maximum: number) =>
	z
		.string({ error: `${field} must be text` })
		.trim()
		.min(1, `${field} is required`)
		.max(maximum, `${field} must be ${maximum} characters or fewer`);

const optionalText = (field: string, maximum: number) =>
	z.preprocess(
		(value) =>
			typeof value === "string" && value.trim() === "" ? undefined : value,
		z
			.string({ error: `${field} must be text` })
			.trim()
			.max(maximum, `${field} must be ${maximum} characters or fewer`)
			.optional(),
	);

const optionalUuid = (field: string) =>
	z.preprocess(
		(value) => (value === "" || value === null ? undefined : value),
		z.uuid(`${field} must be a valid ID`).optional(),
	);

const optionalDate = (field: string) =>
	z.preprocess(
		(value) => (value === "" || value === null ? undefined : value),
		z.coerce.date({ error: `${field} must be a valid date` }).optional(),
	);

const optionalPosition = z.preprocess(
	(value) => (value === "" || value === null ? undefined : value),
	z.coerce
		.number({ error: "Position must be a number" })
		.int("Position must be a whole number")
		.nonnegative("Position cannot be negative")
		.optional(),
);

// Prevent empty update requests
const hasUpdate = (data: Record<string, unknown>) =>
	Object.values(data).some((value) => value !== undefined);

// Date-only deadlines are compared by calendar day so today remains valid
const futureOptionalDate = (field: string) =>
	optionalDate(field).refine(
		(date) => {
			if (!date) return true;

			const today = new Date();
			today.setHours(0, 0, 0, 0);

			const selectedDate = new Date(date);
			selectedDate.setHours(0, 0, 0, 0);

			return selectedDate >= today;
		},
		{
			message: `${field} cannot be in the past`,
		},
	);

// Project validation
export const projectSchema = z.object({
	name: requiredText("Name", 100),
	description: optionalText("Description", 500),
	dueDate: futureOptionalDate("Due date"),
});

export const projectCreateSchema = projectSchema.extend({
	teamId: z.uuid("Select a team for this project"),
});

export const projectUpdateSchema = projectSchema
	.extend({
		dueDate: optionalDate("Due date"),
		status: z.enum(PROJECT_STATUSES, {
			error: "Status must be active, completed, or on hold",
		}),
	})
	.partial()
	.refine(hasUpdate, { message: "At least one project field is required" });

export const projectFilterSchema = z.object({
	q: optionalText("Search", 100).catch(undefined),
	status: z.preprocess(
		(value) => (value === "" ? undefined : value),
		z.enum(PROJECT_STATUSES).optional().catch(undefined),
	),
	role: z.preprocess(
		(value) => (value === "" ? undefined : value),
		z.enum(PROJECT_ROLES).optional().catch(undefined),
	),
	page: z.coerce.number().int().positive().catch(1),
});

// Task and board validation
export const taskSchema = z.object({
	title: requiredText("Title", 200),
	description: optionalText("Description", 1000),
	priority: z.enum(TASK_PRIORITIES, {
		error: "Priority must be low, medium, or high",
	}),
	dueDate: optionalDate("Due date"),
	assigneeId: optionalUuid("Assignee"),
	labelIds: z
		.array(z.uuid("Label must be a valid ID"))
		.max(10, "A task can have at most 10 labels")
		.default([]),
});

export const taskCreateSchema = taskSchema.extend({
	listId: z.uuid("List must be a valid ID"),
	position: optionalPosition,
});

export const taskUpdateSchema = taskCreateSchema
	.partial()
	.refine(hasUpdate, { message: "At least one task field is required" });

export const taskFilterSchema = z.object({
	q: optionalText("Search", 200).catch(undefined),
	priority: z.preprocess(
		(value) => (value === "" ? undefined : value),
		z.enum(TASK_PRIORITIES).optional().catch(undefined),
	),
	assignee: z.preprocess(
		(value) => (value === "" ? undefined : value),
		z
			.union([
				z.uuid("Assignee must be a valid ID"),
				z.literal("me"),
				z.literal("unassigned"),
			])
			.optional()
			.catch(undefined),
	),
});

export const boardLayoutSchema = z.object({
	projectId: z.uuid("Project must be a valid ID"),
	lists: z
		.array(
			z.object({
				id: z.uuid("List must be a valid ID"),
				taskIds: z.array(z.uuid("Task must be a valid ID")),
			}),
		)
		.min(1, "The board must contain at least one list"),
});

const bulkTaskBase = {
	projectId: z.uuid("Project must be a valid ID"),
	taskIds: z
		.array(z.uuid("Task must be a valid ID"))
		.min(1, "Select at least one task")
		.max(100, "You can update at most 100 tasks at once"),
};

export const bulkTaskOperationSchema = z.discriminatedUnion("operation", [
	z.object({
		...bulkTaskBase,
		operation: z.literal("move"),
		value: z.uuid("Column must be a valid ID"),
	}),
	z.object({
		...bulkTaskBase,
		operation: z.literal("assign"),
		value: z.union([
			z.uuid("Assignee must be a valid ID"),
			z.literal("unassigned"),
		]),
	}),
	z.object({
		...bulkTaskBase,
		operation: z.literal("priority"),
		value: z.enum(TASK_PRIORITIES),
	}),
	z.object({
		...bulkTaskBase,
		operation: z.literal("add_label"),
		value: z.uuid("Label must be a valid ID"),
	}),
	z.object({
		...bulkTaskBase,
		operation: z.literal("remove_label"),
		value: z.uuid("Label must be a valid ID"),
	}),
]);

// User profile validation
export const userProfileSchema = z.object({
	firstName: optionalText("First name", 100),
	lastName: optionalText("Last name", 100),
	email: z.email("Enter a valid email address").optional(),
	imageUrl: z.url("Image URL must be valid").optional(),
});

export const userSchema = userProfileSchema;

// Lists and labels
export const listSchema = z.object({
	name: requiredText("List name", 100),
	position: optionalPosition,
	isCompleted: z.boolean().optional(),
});

export const listCreateSchema = listSchema.extend({
	projectId: z.uuid("Project must be a valid ID"),
});

export const listUpdateSchema = listSchema
	.partial()
	.refine(hasUpdate, { message: "At least one list field is required" });

export const labelSchema = z.object({
	name: requiredText("Label name", 50),
	color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Choose a valid label color"),
});

export const labelCreateSchema = labelSchema.extend({
	projectId: z.uuid("Project must be a valid ID"),
});

// Project membership and team assignment
export const projectMemberCreateSchema = z.object({
	projectId: z.uuid("Project must be a valid ID"),
	userId: z.uuid("Member must be a valid ID"),
	role: z.enum(MANAGEABLE_MEMBER_ROLES, {
		error: "Role must be admin or member",
	}),
});

export const projectMemberUpdateSchema = z.object({
	projectId: z.uuid("Project must be a valid ID"),
	userId: z.uuid("Member must be a valid ID"),
	role: z.enum(MANAGEABLE_MEMBER_ROLES, {
		error: "Role must be admin or member",
	}),
});

export const projectMemberRemoveSchema = z.object({
	projectId: z.uuid("Project must be a valid ID"),
	userId: z.uuid("Member must be a valid ID"),
});

// Team validation
export const teamCreateSchema = z.object({
	name: requiredText("Team name", 100),
	description: optionalText("Description", 500),
});

export const teamMemberCreateSchema = z.object({
	teamId: z.uuid("Team must be a valid ID"),
	email: z.email("Enter a valid member email").trim().toLowerCase(),
	role: z.enum(MANAGEABLE_MEMBER_ROLES, {
		error: "Role must be admin or member",
	}),
});

export const teamMemberUpdateSchema = z.object({
	teamId: z.uuid("Team must be a valid ID"),
	userId: z.uuid("Member must be a valid ID"),
	role: z.enum(MANAGEABLE_MEMBER_ROLES, {
		error: "Role must be admin or member",
	}),
});

export const teamMemberRemoveSchema = z.object({
	teamId: z.uuid("Team must be a valid ID"),
	userId: z.uuid("Member must be a valid ID"),
});

// Comment validation
export const commentSchema = z.object({
	content: requiredText("Comment", 1000),
});

export const commentCreateSchema = commentSchema.extend({
	taskId: z.uuid("Task must be a valid ID"),
});

export const commentUpdateSchema = commentSchema.partial().refine(hasUpdate, {
	message: "Comment content is required",
});

// Validated input and output types used across actions and database operations
export type ProjectInput = z.input<typeof projectSchema>;
export type ProjectData = z.output<typeof projectSchema>;
export type ProjectCreateData = z.output<typeof projectCreateSchema>;
export type TaskInput = z.input<typeof taskSchema>;
export type TaskData = z.output<typeof taskSchema>;
export type ProjectFilters = z.output<typeof projectFilterSchema>;
export type TaskFilters = z.output<typeof taskFilterSchema>;
export type BulkTaskOperation = z.output<typeof bulkTaskOperationSchema>;
export type UserProfileInput = z.input<typeof userProfileSchema>;
export type ListInput = z.input<typeof listSchema>;
export type LabelInput = z.input<typeof labelSchema>;
export type CommentInput = z.input<typeof commentSchema>;
