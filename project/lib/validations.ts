import { z } from "zod";

const PROJECT_STATUSES = ["active", "completed", "on_hold"] as const;
const PROJECT_ROLES = ["owner", "admin", "member"] as const;
const TASK_PRIORITIES = ["low", "medium", "high"] as const;

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

const hasUpdate = (data: Record<string, unknown>) =>
	Object.values(data).some((value) => value !== undefined);

const futureOptionalDate = (field: string) =>
	optionalDate(field).refine((date) => !date || date > new Date(), {
		message: `${field} must be in the future`,
	});

export const projectSchema = z.object({
	name: requiredText("Name", 100),
	description: optionalText("Description", 500),
	dueDate: futureOptionalDate("Due date"),
});

export const projectCreateSchema = projectSchema;

export const projectUpdateSchema = projectSchema
	.extend({
		dueDate: optionalDate("Due date"),
		status: z.enum(PROJECT_STATUSES, {
			error: "Status must be active, completed, or on hold",
		}),
	})
	.partial()
	.refine(hasUpdate, { message: "At least one project field is required" });

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

export const projectFilterSchema = z.object({
	q: optionalText("Search", 100),
	status: z.preprocess(
		(value) => (value === "" ? undefined : value),
		z.enum(PROJECT_STATUSES).optional(),
	),
	role: z.preprocess(
		(value) => (value === "" ? undefined : value),
		z.enum(PROJECT_ROLES).optional(),
	),
});

export const taskFilterSchema = z.object({
	q: optionalText("Search", 200),
	priority: z.preprocess(
		(value) => (value === "" ? undefined : value),
		z.enum(TASK_PRIORITIES).optional(),
	),
	assignee: z.preprocess(
		(value) => (value === "" ? undefined : value),
		z
			.union([
				z.uuid("Assignee must be a valid ID"),
				z.literal("me"),
				z.literal("unassigned"),
			])
			.optional(),
	),
});

export const userProfileSchema = z.object({
	firstName: optionalText("First name", 100),
	lastName: optionalText("Last name", 100),
	email: z.email("Enter a valid email address").optional(),
	imageUrl: z.url("Image URL must be valid").optional(),
});

export const userSchema = userProfileSchema;

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

export const projectMemberCreateSchema = z.object({
	projectId: z.uuid("Project must be a valid ID"),
	email: z.email("Enter a valid member email").trim().toLowerCase(),
	role: z.enum(["admin", "member"], {
		error: "Role must be admin or member",
	}),
});

export const projectMemberUpdateSchema = z.object({
	projectId: z.uuid("Project must be a valid ID"),
	userId: z.uuid("Member must be a valid ID"),
	role: z.enum(["admin", "member"], {
		error: "Role must be admin or member",
	}),
});

export const projectMemberRemoveSchema = z.object({
	projectId: z.uuid("Project must be a valid ID"),
	userId: z.uuid("Member must be a valid ID"),
});

export const commentSchema = z.object({
	content: requiredText("Comment", 1000),
});

export const commentCreateSchema = commentSchema.extend({
	taskId: z.uuid("Task must be a valid ID"),
});

export const commentUpdateSchema = commentSchema.partial().refine(hasUpdate, {
	message: "Comment content is required",
});

export type ProjectInput = z.input<typeof projectSchema>;
export type ProjectData = z.output<typeof projectSchema>;
export type TaskInput = z.input<typeof taskSchema>;
export type TaskData = z.output<typeof taskSchema>;
export type ProjectFilters = z.output<typeof projectFilterSchema>;
export type TaskFilters = z.output<typeof taskFilterSchema>;
export type UserProfileInput = z.input<typeof userProfileSchema>;
export type ListInput = z.input<typeof listSchema>;
export type LabelInput = z.input<typeof labelSchema>;
export type CommentInput = z.input<typeof commentSchema>;
