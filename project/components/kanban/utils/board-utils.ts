import type { BoardList, BoardTask } from "@/stores/board-store";

export interface TaskLocation {
	listId: string;
	position: number;
	task: BoardTask;
}

export interface DropLocation {
	listId: string;
	position: number;
}

// Find a task's current position in the board
export function findTaskLocation(
	lists: BoardList[],
	taskId: string,
): TaskLocation | null {
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

// Validate dnd-kit metadata before using it as a drop position
export function getDropLocation(
	data: Record<string, unknown> | undefined,
): DropLocation | null {
	if (
		(data?.kind !== "task" && data?.kind !== "column") ||
		typeof data.listId !== "string" ||
		typeof data.index !== "number" ||
		!Number.isInteger(data.index) ||
		data.index < 0
	) {
		return null;
	}

	return {
		listId: data.listId,
		position: data.index,
	};
}
