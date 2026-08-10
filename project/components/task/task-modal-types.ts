import type { TaskLabelOption } from "@/components/project/project-labels";

export interface TaskMemberOption {
	id: string;
	name: string;
	isCurrentUser?: boolean;
}

export interface TaskListOption {
	id: string;
	name: string;
}

export interface TaskProjectOption {
	id: string;
	name: string;
	lists: TaskListOption[];
	members: TaskMemberOption[];
	labels: TaskLabelOption[];
	canManageLabels?: boolean;
}

export interface EditableTask {
	id: string;
	listId: string;
	title: string;
	description: string | null;
	priority: "low" | "medium" | "high";
	dueDate: Date | null;
	assigneeId: string | null;
	labels: TaskLabelOption[];
}

export interface TaskFormOptions {
	projectId: string;
	lists: TaskListOption[];
	members: TaskMemberOption[];
	labels: TaskLabelOption[];
	canManageLabels?: boolean;
	initialListId?: string;
	task?: EditableTask;
	projectOptions?: TaskProjectOption[];
}
