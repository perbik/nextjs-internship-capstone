// Calendar navigation
export type CalendarView = "month" | "week" | "day";

// Projects and tasks share this display shape in calendar components
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
