import type { BoardList } from "@/stores/board-store";

export function findTaskLocation(lists: BoardList[], taskId: string) {
	for (const list of lists) {
		const position = list.tasks.findIndex((task) => task.id === taskId);

		if (position >= 0) {
			return {
				listId: list.id,
				position,
				task: list.tasks[position],
			};
		}
	}

	return null;
}

export function getDropLocation(data: Record<string, unknown> | undefined) {
	if (
		(data?.kind !== "task" && data?.kind !== "column") ||
		typeof data.listId !== "string" ||
		typeof data.index !== "number"
	) {
		return null;
	}

	return {
		listId: data.listId,
		position: data.index,
	};
}
