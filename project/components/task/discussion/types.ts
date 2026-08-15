export interface TaskCommentItem {
	id: string;
	content: string;
	createdAt: Date;
	updatedAt: Date;
	authorName: string;
	isOwn: boolean;
}

export interface TaskActivityItem {
	id: string;
	action: string;
	createdAt: Date;
	actorName: string;
	metadata: Record<string, string | number | boolean | null>;
}
