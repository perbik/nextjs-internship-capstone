import { relations } from "drizzle-orm";
import {
	type AnyPgColumn,
	boolean,
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";

// Shared database values
export const projectStatus = pgEnum("project_status", [
	"active",
	"completed",
	"on_hold",
]);

export type ProjectStatus = (typeof projectStatus.enumValues)[number];

export const projectMemberRole = pgEnum("project_member_role", [
	"owner",
	"admin",
	"member",
]);

export const teamMemberRole = pgEnum("team_member_role", [
	"owner",
	"admin",
	"member",
]);

export const taskPriority = pgEnum("task_priority", ["low", "medium", "high"]);

// Events that can appear in a user's notification inbox
export const notificationType = pgEnum("notification_type", [
	"team_member_added",
	"project_member_added",
	"task_assigned",
	"task_completed",
	"task_commented",
]);

// User and project tables
export const users = pgTable("users", {
	id: uuid("id").defaultRandom().primaryKey(),
	clerkId: text("clerk_id").notNull().unique(),
	email: text("email").notNull(),
	firstName: text("first_name"),
	lastName: text("last_name"),
	imageUrl: text("image_url"),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const projects = pgTable(
	"projects",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		name: text("name").notNull(),
		description: text("description"),
		ownerId: uuid("owner_id")
			.notNull()
			.references(() => users.id, { onDelete: "restrict" }),
		teamId: uuid("team_id").references((): AnyPgColumn => teams.id, {
			onDelete: "set null",
		}),
		status: projectStatus("status").default("active").notNull(),
		dueDate: timestamp("due_date", { withTimezone: true }),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		deletedAt: timestamp("deleted_at", { withTimezone: true }),
	},
	(table) => [
		index("projects_owner_id_idx").on(table.ownerId),
		index("projects_team_id_idx").on(table.teamId),
		index("projects_deleted_at_idx").on(table.deletedAt),
	],
);

// Team and membership tables
export const teams = pgTable(
	"teams",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		name: text("name").notNull(),
		description: text("description"),
		ownerId: uuid("owner_id")
			.notNull()
			.references(() => users.id, { onDelete: "restrict" }),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		deletedAt: timestamp("deleted_at", { withTimezone: true }),
	},
	(table) => [
		index("teams_owner_id_idx").on(table.ownerId),
		index("teams_deleted_at_idx").on(table.deletedAt),
	],
);

export const teamMembers = pgTable(
	"team_members",
	{
		teamId: uuid("team_id")
			.notNull()
			.references(() => teams.id, { onDelete: "cascade" }),
		userId: uuid("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		role: teamMemberRole("role").default("member").notNull(),
		joinedAt: timestamp("joined_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		primaryKey({ columns: [table.teamId, table.userId] }),
		index("team_members_user_id_idx").on(table.userId),
	],
);

export const projectMembers = pgTable(
	"project_members",
	{
		projectId: uuid("project_id")
			.notNull()
			.references(() => projects.id, { onDelete: "cascade" }),
		userId: uuid("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		role: projectMemberRole("role").default("member").notNull(),
		joinedAt: timestamp("joined_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		primaryKey({ columns: [table.projectId, table.userId] }),
		index("project_members_user_id_idx").on(table.userId),
	],
);

// Kanban board tables
export const lists = pgTable(
	"lists",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		projectId: uuid("project_id")
			.notNull()
			.references(() => projects.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		position: integer("position").default(0).notNull(),
		isCompleted: boolean("is_completed").default(false).notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index("lists_project_id_idx").on(table.projectId),
		index("lists_project_position_idx").on(table.projectId, table.position),
	],
);

export const labels = pgTable(
	"labels",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		projectId: uuid("project_id")
			.notNull()
			.references(() => projects.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		color: text("color").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index("labels_project_id_idx").on(table.projectId),
		uniqueIndex("labels_project_name_unique").on(table.projectId, table.name),
	],
);

export const tasks = pgTable(
	"tasks",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		listId: uuid("list_id")
			.notNull()
			.references(() => lists.id, { onDelete: "cascade" }),
		title: text("title").notNull(),
		description: text("description"),
		assigneeId: uuid("assignee_id").references(() => users.id, {
			onDelete: "set null",
		}),
		priority: taskPriority("priority").default("medium").notNull(),
		dueDate: timestamp("due_date", { withTimezone: true }),
		position: integer("position").default(0).notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		deletedAt: timestamp("deleted_at", { withTimezone: true }),
	},
	(table) => [
		index("tasks_list_id_idx").on(table.listId),
		index("tasks_assignee_id_idx").on(table.assigneeId),
		index("tasks_deleted_at_idx").on(table.deletedAt),
		index("tasks_list_position_idx").on(table.listId, table.position),
	],
);

export const taskLabels = pgTable(
	"task_labels",
	{
		taskId: uuid("task_id")
			.notNull()
			.references(() => tasks.id, { onDelete: "cascade" }),
		labelId: uuid("label_id")
			.notNull()
			.references(() => labels.id, { onDelete: "cascade" }),
	},
	(table) => [
		primaryKey({ columns: [table.taskId, table.labelId] }),
		index("task_labels_label_id_idx").on(table.labelId),
	],
);

// Comments and activity history
export const comments = pgTable(
	"comments",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		content: text("content").notNull(),
		taskId: uuid("task_id")
			.notNull()
			.references(() => tasks.id, { onDelete: "cascade" }),
		authorId: uuid("author_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index("comments_task_id_idx").on(table.taskId),
		index("comments_author_id_idx").on(table.authorId),
	],
);

export const activityLogs = pgTable(
	"activity_logs",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		projectId: uuid("project_id")
			.notNull()
			.references(() => projects.id, { onDelete: "cascade" }),
		taskId: uuid("task_id").references(() => tasks.id, {
			onDelete: "cascade",
		}),
		actorId: uuid("actor_id").references(() => users.id, {
			onDelete: "set null",
		}),
		action: text("action").notNull(),
		metadata: jsonb("metadata")
			.$type<Record<string, string | number | boolean | null>>()
			.default({})
			.notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index("activity_logs_project_id_idx").on(table.projectId),
		index("activity_logs_task_id_idx").on(table.taskId),
		index("activity_logs_actor_id_idx").on(table.actorId),
		index("activity_logs_created_at_idx").on(table.createdAt),
	],
);

// Private notifications are stored for one recipient and may link to related content
export const notifications = pgTable(
	"notifications",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		recipientId: uuid("recipient_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		actorId: uuid("actor_id").references(() => users.id, {
			onDelete: "set null",
		}),
		type: notificationType("type").notNull(),
		teamId: uuid("team_id").references(() => teams.id, {
			onDelete: "set null",
		}),
		projectId: uuid("project_id").references(() => projects.id, {
			onDelete: "set null",
		}),
		taskId: uuid("task_id").references(() => tasks.id, {
			onDelete: "set null",
		}),
		message: text("message").notNull(),
		readAt: timestamp("read_at", { withTimezone: true }),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index("notifications_recipient_created_at_idx").on(
			table.recipientId,
			table.createdAt,
		),
		index("notifications_recipient_read_at_idx").on(
			table.recipientId,
			table.readAt,
		),
	],
);

// One user to many projects, teams, memberships, tasks, comments, and activities
export const usersRelations = relations(users, ({ many }) => ({
	ownedProjects: many(projects),
	projectMemberships: many(projectMembers),
	ownedTeams: many(teams),
	teamMemberships: many(teamMembers),
	assignedTasks: many(tasks),
	comments: many(comments),
	activities: many(activityLogs),
	receivedNotifications: many(notifications, {
		relationName: "notificationRecipient",
	}),
	createdNotifications: many(notifications, {
		relationName: "notificationActor",
	}),
}));

// Many projects to one owner and team; one project to many members, lists, labels, and activities
export const projectsRelations = relations(projects, ({ one, many }) => ({
	owner: one(users, {
		fields: [projects.ownerId],
		references: [users.id],
	}),
	team: one(teams, {
		fields: [projects.teamId],
		references: [teams.id],
	}),
	members: many(projectMembers),
	lists: many(lists),
	labels: many(labels),
	activities: many(activityLogs),
	notifications: many(notifications),
}));

// Many teams to one owner; one team to many members and projects
export const teamsRelations = relations(teams, ({ one, many }) => ({
	owner: one(users, {
		fields: [teams.ownerId],
		references: [users.id],
	}),
	members: many(teamMembers),
	projects: many(projects),
	notifications: many(notifications),
}));

// Many team memberships to one team and one user
export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
	team: one(teams, {
		fields: [teamMembers.teamId],
		references: [teams.id],
	}),
	user: one(users, {
		fields: [teamMembers.userId],
		references: [users.id],
	}),
}));

// Many project memberships to one project and one user
export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
	project: one(projects, {
		fields: [projectMembers.projectId],
		references: [projects.id],
	}),
	user: one(users, {
		fields: [projectMembers.userId],
		references: [users.id],
	}),
}));

// Many lists to one project; one list to many tasks
export const listsRelations = relations(lists, ({ one, many }) => ({
	project: one(projects, {
		fields: [lists.projectId],
		references: [projects.id],
	}),
	tasks: many(tasks),
}));

// Many labels to one project; tasks and labels are many-to-many through task labels
export const labelsRelations = relations(labels, ({ one, many }) => ({
	project: one(projects, {
		fields: [labels.projectId],
		references: [projects.id],
	}),
	taskLabels: many(taskLabels),
}));

// Many tasks to one list and assignee; one task to many comments, labels, and activities
export const tasksRelations = relations(tasks, ({ one, many }) => ({
	list: one(lists, {
		fields: [tasks.listId],
		references: [lists.id],
	}),
	assignee: one(users, {
		fields: [tasks.assigneeId],
		references: [users.id],
	}),
	comments: many(comments),
	taskLabels: many(taskLabels),
	activities: many(activityLogs),
	notifications: many(notifications),
}));

// Many task-label records to one task and one label
export const taskLabelsRelations = relations(taskLabels, ({ one }) => ({
	task: one(tasks, {
		fields: [taskLabels.taskId],
		references: [tasks.id],
	}),
	label: one(labels, {
		fields: [taskLabels.labelId],
		references: [labels.id],
	}),
}));

// Many comments to one task and one author
export const commentsRelations = relations(comments, ({ one }) => ({
	task: one(tasks, {
		fields: [comments.taskId],
		references: [tasks.id],
	}),
	author: one(users, {
		fields: [comments.authorId],
		references: [users.id],
	}),
}));

// Many activities to one project, task, and actor
export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
	project: one(projects, {
		fields: [activityLogs.projectId],
		references: [projects.id],
	}),
	task: one(tasks, {
		fields: [activityLogs.taskId],
		references: [tasks.id],
	}),
	actor: one(users, {
		fields: [activityLogs.actorId],
		references: [users.id],
	}),
}));

// Each notification belongs to one recipient and may reference its actor and content
export const notificationsRelations = relations(notifications, ({ one }) => ({
	recipient: one(users, {
		fields: [notifications.recipientId],
		references: [users.id],
		relationName: "notificationRecipient",
	}),
	actor: one(users, {
		fields: [notifications.actorId],
		references: [users.id],
		relationName: "notificationActor",
	}),
	team: one(teams, {
		fields: [notifications.teamId],
		references: [teams.id],
	}),
	project: one(projects, {
		fields: [notifications.projectId],
		references: [projects.id],
	}),
	task: one(tasks, {
		fields: [notifications.taskId],
		references: [tasks.id],
	}),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type ProjectMember = typeof projectMembers.$inferSelect;
export type NewProjectMember = typeof projectMembers.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type List = typeof lists.$inferSelect;
export type NewList = typeof lists.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type Label = typeof labels.$inferSelect;
export type NewLabel = typeof labels.$inferInsert;
export type TaskLabel = typeof taskLabels.$inferSelect;
export type NewTaskLabel = typeof taskLabels.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
