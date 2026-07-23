export type ProjectStatus = "active" | "completed" | "on_hold";

export type ProjectMemberRole = "owner" | "admin" | "member";

export type TaskPriority = "low" | "medium" | "high";

export interface User {
	id: string;
	clerkId: string;
	email: string;
	firstName: string | null;
	lastName: string | null;
	imageUrl: string | null;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date | null;
}

export interface Project {
	id: string;
	name: string;
	description: string | null;
	ownerId: string;
	status: ProjectStatus;
	dueDate: Date | null;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date | null;
}

export interface ProjectMember {
	projectId: string;
	userId: string;
	role: ProjectMemberRole;
	joinedAt: Date;
}

export interface List {
	id: string;
	projectId: string;
	name: string;
	position: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface Task {
	id: string;
	listId: string;
	title: string;
	description: string | null;
	assigneeId: string | null;
	priority: TaskPriority;
	dueDate: Date | null;
	position: number;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date | null;
}

export interface Comment {
	id: string;
	content: string;
	taskId: string;
	authorId: string;
	createdAt: Date;
	updatedAt: Date;
}
