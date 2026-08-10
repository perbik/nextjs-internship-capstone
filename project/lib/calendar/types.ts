export type CalendarView = "month" | "week" | "day";

export interface CalendarEvent {
	id: string;
	title: string;
	dueDate: Date;
	projectId: string;
	projectName: string;
	type: "project" | "task";
	completed: boolean;
	priority?: "low" | "medium" | "high";
}
