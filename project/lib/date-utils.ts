export function formatUtcDate(value: string | Date) {
	return new Intl.DateTimeFormat("en-US", {
		month: "2-digit",
		day: "2-digit",
		year: "numeric",
		timeZone: "UTC",
	}).format(new Date(value));
}
