import type { TaskLabelOption } from "@/components/project/project-labels";
import type { TaskMemberOption } from "@/components/task/task-modal-types";
import type { BoardList } from "@/stores/board-store";

export type BulkOperation =
	| "move"
	| "assign"
	| "priority"
	| "add_label"
	| "remove_label";

export interface BulkSelectOption {
	value: string;
	label: string;
}

export const bulkOperationOptions: BulkSelectOption[] = [
	{ value: "move", label: "Move to" },
	{ value: "assign", label: "Assign to" },
	{ value: "priority", label: "Set priority" },
	{ value: "add_label", label: "Add label" },
	{ value: "remove_label", label: "Remove label" },
];

export function getAllTaskIds(lists: BoardList[]): string[] {
	return lists.flatMap((list) => list.tasks.map((task) => task.id));
}

export function getDefaultBulkValue(
	operation: BulkOperation,
	lists: BoardList[],
	labels: TaskLabelOption[],
): string {
	const defaultValues: Record<BulkOperation, string> = {
		move: lists[0]?.id ?? "",
		assign: "unassigned",
		priority: "medium",
		add_label: labels[0]?.id ?? "",
		remove_label: labels[0]?.id ?? "",
	};

	return defaultValues[operation];
}

export function operationRequiresLabel(operation: BulkOperation): boolean {
	return operation === "add_label" || operation === "remove_label";
}

export function getBulkValueOptions(
	operation: BulkOperation,
	lists: BoardList[],
	members: TaskMemberOption[],
	labels: TaskLabelOption[],
): BulkSelectOption[] {
	switch (operation) {
		case "move":
			return lists.map((list) => ({ value: list.id, label: list.name }));
		case "assign":
			return [
				{ value: "unassigned", label: "Unassigned" },
				...members.map((member) => ({
					value: member.id,
					label: `${member.name}${member.isCurrentUser ? " (You)" : ""}`,
				})),
			];
		case "priority":
			return [
				{ value: "low", label: "Low" },
				{ value: "medium", label: "Medium" },
				{ value: "high", label: "High" },
			];
		case "add_label":
		case "remove_label":
			return labels.map((label) => ({
				value: label.id,
				label: label.name,
			}));
	}
}

export function orderSelectedTaskIds(
	allTaskIds: string[],
	selectedTaskIds: string[],
): string[] {
	const selectedIds = new Set(selectedTaskIds);
	return allTaskIds.filter((taskId) => selectedIds.has(taskId));
}

export function canApplyBulkOperation({
	selectedTaskCount,
	value,
	pendingMoveCount,
	isPending,
}: {
	selectedTaskCount: number;
	value: string;
	pendingMoveCount: number;
	isPending: boolean;
}): boolean {
	return (
		!isPending &&
		selectedTaskCount > 0 &&
		Boolean(value) &&
		pendingMoveCount === 0
	);
}

export function isTypingTarget(target: EventTarget | null): boolean {
	return (
		target instanceof HTMLInputElement ||
		target instanceof HTMLTextAreaElement ||
		target instanceof HTMLSelectElement ||
		(target instanceof HTMLElement &&
			Boolean(target.closest('[role="combobox"], [role="listbox"]'))) ||
		(target instanceof HTMLElement && target.isContentEditable)
	);
}
