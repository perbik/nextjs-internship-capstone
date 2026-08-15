interface UserNameParts {
	firstName: string | null;
	lastName: string | null;
	email: string;
}

export function getUserDisplayName(user: UserNameParts) {
	return (
		[user.firstName, user.lastName].filter(Boolean).join(" ") || user.email
	);
}
