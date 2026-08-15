export type ProjectActorRole = "owner" | "admin";
export type MutableProjectMemberRole = "admin" | "member";

export interface ManagedProjectMember {
	id: string;
	name: string;
	email: string;
	role: "owner" | MutableProjectMemberRole;
	isCurrentUser: boolean;
}

export interface EligibleProjectMember {
	id: string;
	name: string;
	email: string;
}

export interface OptimisticRoleChange {
	userId: string;
	role: MutableProjectMemberRole;
}
