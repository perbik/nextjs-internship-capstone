export interface ManagedTeam {
	id: string;
	name: string;
	description: string | null;
	role: "owner" | "admin" | "member";
	projects: Array<{
		id: string;
		name: string;
		status: "active" | "completed" | "on_hold";
	}>;
	members: Array<{
		id: string;
		name: string;
		email: string;
		role: "owner" | "admin" | "member";
		isCurrentUser: boolean;
	}>;
}
