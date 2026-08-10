import type { TaskActivityItem } from "@/components/task/discussion/types";

const activityLabels: Record<string, string> = {
	task_created: "created the task",
	task_updated: "updated the task",
	task_moved: "moved the task",
	task_reordered: "reordered the task",
	task_deleted: "deleted the task",
	comment_added: "added a comment",
	comment_updated: "edited a comment",
	comment_deleted: "deleted a comment",
};

export function activityDescription(activity: TaskActivityItem) {
	if (
		activity.action === "task_moved" &&
		typeof activity.metadata.fromListName === "string" &&
		typeof activity.metadata.toListName === "string"
	) {
		return `moved the task from ${activity.metadata.fromListName} to ${activity.metadata.toListName}`;
	}

	if (
		activity.action === "task_field_changed" &&
		typeof activity.metadata.field === "string"
	) {
		const from =
			typeof activity.metadata.from === "string"
				? activity.metadata.from
				: null;
		const to =
			typeof activity.metadata.to === "string" ? activity.metadata.to : null;

		switch (activity.metadata.field) {
			case "title":
				return `changed the title from “${from}” to “${to}”`;
			case "description":
				return "updated the description";
			case "priority":
				return `changed the priority from ${from} to ${to}`;
			case "dueDate":
				if (!from && to)
					return `set the due date to ${new Date(to).toLocaleDateString()}`;
				if (from && !to)
					return `removed the due date (${new Date(from).toLocaleDateString()})`;
				return `changed the due date from ${new Date(from ?? "").toLocaleDateString()} to ${new Date(to ?? "").toLocaleDateString()}`;
			case "assignee":
				if (!from && to) return `assigned the task to ${to}`;
				if (from && !to) return `unassigned the task from ${from}`;
				return `reassigned the task from ${from} to ${to}`;
			case "labels":
				if (!from && to) return `added labels: ${to}`;
				if (from && !to) return `removed labels: ${from}`;
				return `changed the labels from ${from} to ${to}`;
			default:
				return `changed ${activity.metadata.field}`;
		}
	}

	if (
		(activity.action === "task_label_added" ||
			activity.action === "task_label_removed") &&
		typeof activity.metadata.labelName === "string"
	) {
		return `${activity.action === "task_label_added" ? "added" : "removed"} the ${activity.metadata.labelName} label`;
	}

	return activityLabels[activity.action] ?? activity.action;
}
