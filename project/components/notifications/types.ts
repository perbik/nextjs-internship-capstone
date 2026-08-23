export type NotificationItem = {
	id: string;
	type:
		| "team_member_added"
		| "project_member_added"
		| "task_assigned"
		| "task_completed"
		| "task_commented";
	message: string;
	teamId: string | null;
	projectId: string | null;
	taskId: string | null;
	readAt: Date | null;
	createdAt: Date;
	actorFirstName: string | null;
	actorLastName: string | null;
	actorEmail: string | null;
};

export type NotificationSummary = {
	items: NotificationItem[];
	unreadCount: number;
};
