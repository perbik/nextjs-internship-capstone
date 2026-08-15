"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { bulkUpdateTasksAction } from "@/app/(dashboard)/projects/[id]/task-actions";
import {
	type BulkOperation,
	canApplyBulkOperation,
	getAllTaskIds,
	getBulkValueOptions,
	getDefaultBulkValue,
	isTypingTarget,
	operationRequiresLabel,
	orderSelectedTaskIds,
} from "@/components/kanban/utils/bulk-task-utils";
import type { TaskLabelOption } from "@/components/project/project-labels";
import type { TaskMemberOption } from "@/components/task/task-modal-types";
import { type BoardList, useBoardStore } from "@/stores/board-store";
import { useUIStore } from "@/stores/ui-store";

interface UseBulkTaskActionsOptions {
	projectId: string;
	lists: BoardList[];
	members: TaskMemberOption[];
	labels: TaskLabelOption[];
}

export function useBulkTaskActions({
	projectId,
	lists,
	members,
	labels,
}: UseBulkTaskActionsOptions) {
	const router = useRouter();
	const activeModalId = useUIStore((state) => state.activeModalId);
	const {
		bulkMode,
		selectedTaskIds,
		pendingMoves,
		setBulkMode,
		selectTasks,
		clearTaskSelection,
	} = useBoardStore();
	const [operation, setOperation] = useState<BulkOperation>("move");
	const [value, setValue] = useState("");
	const [isPending, setIsPending] = useState(false);
	const [message, setMessage] = useState("");
	const [success, setSuccess] = useState(false);
	const allTaskIds = useMemo(() => getAllTaskIds(lists), [lists]);
	const valueOptions = useMemo(
		() => getBulkValueOptions(operation, lists, members, labels),
		[labels, lists, members, operation],
	);
	// Keep selected tasks in the same order in which they appear on the board
	const visibleSelectedTaskIds = useMemo(
		() => orderSelectedTaskIds(allTaskIds, selectedTaskIds),
		[allTaskIds, selectedTaskIds],
	);
	const needsLabel = operationRequiresLabel(operation);
	const canApply = canApplyBulkOperation({
		selectedTaskCount: visibleSelectedTaskIds.length,
		value,
		pendingMoveCount: pendingMoves.length,
		isPending,
	});

	useEffect(() => {
		setValue(getDefaultBulkValue(operation, lists, labels));
	}, [labels, lists, operation]);

	useEffect(() => {
		function handleShortcut(event: KeyboardEvent) {
			// Do not run board shortcuts while the user is typing or using a modal
			if (isTypingTarget(event.target) || activeModalId) {
				return;
			}

			if (event.key.toLowerCase() === "b" && !event.ctrlKey && !event.metaKey) {
				event.preventDefault();
				if (allTaskIds.length === 0) return;
				setBulkMode(!bulkMode);
				setMessage("");
				return;
			}

			if (!bulkMode) {
				return;
			}

			if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "a") {
				event.preventDefault();
				selectTasks(allTaskIds);
			}

			if (event.key === "Escape") {
				event.preventDefault();
				setBulkMode(false);
				setMessage("");
			}
		}

		window.addEventListener("keydown", handleShortcut);
		return () => window.removeEventListener("keydown", handleShortcut);
	}, [activeModalId, allTaskIds, bulkMode, selectTasks, setBulkMode]);

	function selectAll(): void {
		selectTasks(allTaskIds);
	}

	function enterBulkMode(): void {
		if (allTaskIds.length > 0) setBulkMode(true);
	}

	function exitBulkMode(): void {
		setBulkMode(false);
		setMessage("");
	}

	async function applyBulkOperation(): Promise<void> {
		if (!canApply) {
			return;
		}

		setIsPending(true);
		setMessage("");

		try {
			const result = await bulkUpdateTasksAction({
				projectId,
				taskIds: visibleSelectedTaskIds,
				operation,
				value,
			});

			setSuccess(Boolean(result.success));
			setMessage(result.message);

			if (result.success) {
				clearTaskSelection();
				router.refresh();
			}
		} catch {
			setSuccess(false);
			setMessage("Unable to update the selected tasks. Please try again.");
		} finally {
			setIsPending(false);
		}
	}

	return {
		bulkMode,
		selectedTaskCount: visibleSelectedTaskIds.length,
		allTaskCount: allTaskIds.length,
		pendingMoveCount: pendingMoves.length,
		operation,
		value,
		valueOptions,
		needsLabel,
		isPending,
		message,
		success,
		canApply,
		setOperation,
		setValue,
		enterBulkMode,
		selectAll,
		clearTaskSelection,
		exitBulkMode,
		applyBulkOperation,
	};
}
