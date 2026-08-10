"use client";

import {
	type DragCancelEvent,
	type DragEndEvent,
	type DragOverEvent,
	type DragStartEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useEffect, useRef, useState } from "react";
import { moveListAction } from "@/app/(dashboard)/projects/[id]/list-actions";
import { saveBoardLayoutAction } from "@/app/(dashboard)/projects/[id]/task-actions";
import {
	findTaskLocation,
	getDropLocation,
} from "@/components/kanban/utils/board-utils";
import {
	type BoardList,
	type BoardMove,
	useBoardStore,
} from "@/stores/board-store";

export function useKanbanDrag({
	projectId,
	lists,
	dragEnabled,
}: {
	projectId: string;
	lists: BoardList[];
	dragEnabled: boolean;
}) {
	const {
		projectId: storedProjectId,
		lists: storedLists,
		pendingMoves,
		moveError,
		syncBoard,
		startDragging,
		stopDragging,
		cancelDragging,
		previewMove,
		queueMove,
		confirmSnapshot,
		rejectSnapshot,
		clearMoveError,
		reorderLists,
		confirmListOrder,
		revertListOrder,
		bulkMode,
	} = useBoardStore();
	const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const saveInFlight = useRef(false);
	const dragOrigin = useRef<{
		taskId: string;
		listId: string;
		position: number;
	} | null>(null);
	const listDragOrigin = useRef<{ listId: string; index: number } | null>(null);
	const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
	const [activeListId, setActiveListId] = useState<string | null>(null);
	const [listMoveError, setListMoveError] = useState("");
	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);
	const boardLists = storedProjectId === projectId ? storedLists : lists;

	useEffect(() => {
		syncBoard(projectId, lists);
	}, [lists, projectId, syncBoard]);

	function handleDragStart(event: DragStartEvent) {
		if (event.active.data.current?.kind === "list") {
			const listId = String(event.active.data.current.listId);
			const index = boardLists.findIndex((list) => list.id === listId);

			if (index < 0) return;

			listDragOrigin.current = { listId, index };
			setActiveListId(listId);
			setListMoveError("");
			startDragging();
			return;
		}

		const location = findTaskLocation(boardLists, String(event.active.id));
		if (!location) return;

		dragOrigin.current = {
			taskId: String(event.active.id),
			listId: location.listId,
			position: location.position,
		};
		setActiveTaskId(String(event.active.id));
		startDragging();
		clearMoveError();
	}

	function handleDragOver(event: DragOverEvent) {
		if (event.active.data.current?.kind === "list") return;

		const origin = dragOrigin.current;
		if (!origin || !event.over) return;

		const current = findTaskLocation(boardLists, origin.taskId);
		const target = getDropLocation(event.over.data.current);

		if (
			!current ||
			!target ||
			(current.listId === target.listId && current.position === target.position)
		) {
			return;
		}

		previewMove({
			taskId: origin.taskId,
			sourceListId: current.listId,
			targetListId: target.listId,
			targetPosition: target.position,
		});
	}

	function handleDragCancel(_event: DragCancelEvent) {
		dragOrigin.current = null;
		listDragOrigin.current = null;
		setActiveTaskId(null);
		setActiveListId(null);
		cancelDragging();
	}

	function handleDragEnd(event: DragEndEvent) {
		if (event.active.data.current?.kind === "list") {
			const origin = listDragOrigin.current;
			const targetListId =
				typeof event.over?.data.current?.listId === "string"
					? event.over.data.current.listId
					: null;

			listDragOrigin.current = null;
			setActiveListId(null);

			if (!origin || !targetListId || origin.listId === targetListId) {
				stopDragging();
				return;
			}

			const targetIndex = boardLists.findIndex(
				(list) => list.id === targetListId,
			);

			if (targetIndex < 0 || targetIndex === origin.index) {
				stopDragging();
				return;
			}

			reorderLists(origin.listId, targetListId);
			void persistListMove(origin.listId, origin.index, targetIndex);
			return;
		}

		const origin = dragOrigin.current;
		const finalLocation = event.over
			? getDropLocation(event.over.data.current)
			: null;

		dragOrigin.current = null;
		setActiveTaskId(null);
		stopDragging();

		if (!origin || !finalLocation || !dragEnabled) {
			cancelDragging();
			return;
		}

		if (
			origin.listId === finalLocation.listId &&
			origin.position === finalLocation.position
		) {
			cancelDragging();
			return;
		}

		const move: BoardMove = {
			id: crypto.randomUUID(),
			taskId: origin.taskId,
			sourceListId: origin.listId,
			targetListId: finalLocation.listId,
			targetPosition: finalLocation.position,
		};

		queueMove(move);
		scheduleSave();
	}

	async function persistListMove(
		listId: string,
		fromIndex: number,
		toIndex: number,
	) {
		const direction = toIndex < fromIndex ? "left" : "right";
		const moveCount = Math.abs(toIndex - fromIndex);

		try {
			for (let moveIndex = 0; moveIndex < moveCount; moveIndex += 1) {
				const formData = new FormData();
				formData.set("projectId", projectId);
				formData.set("listId", listId);
				formData.set("direction", direction);
				const result = await moveListAction(formData);
				if (!result.success) throw new Error(result.message);
			}
			confirmListOrder();
		} catch {
			revertListOrder();
			setListMoveError("Unable to save the column position. Please try again.");
		} finally {
			stopDragging();
		}
	}

	function scheduleSave(delay = 250) {
		if (saveTimer.current) clearTimeout(saveTimer.current);

		saveTimer.current = setTimeout(() => {
			saveTimer.current = null;
			void persistBoardSnapshot();
		}, delay);
	}

	async function persistBoardSnapshot() {
		if (saveInFlight.current) return;

		const state = useBoardStore.getState();
		const capturedMoves = [...state.pendingMoves];
		if (capturedMoves.length === 0) return;

		const snapshot = state.lists.map((list) => ({
			...list,
			tasks: [...list.tasks],
		}));
		saveInFlight.current = true;

		try {
			const result = await saveBoardLayoutAction({
				projectId,
				lists: snapshot.map((list) => ({
					id: list.id,
					taskIds: list.tasks.map((task) => task.id),
				})),
			});
			const moveIds = capturedMoves.map((move) => move.id);

			if (result.success) confirmSnapshot(moveIds, snapshot);
			else rejectSnapshot(moveIds, result.message);
		} catch {
			rejectSnapshot(
				capturedMoves.map((move) => move.id),
				"Unable to save the task position. Please try again.",
			);
		} finally {
			saveInFlight.current = false;
			if (useBoardStore.getState().pendingMoves.length > 0) scheduleSave(0);
		}
	}

	return {
		sensors,
		boardLists,
		pendingMoves,
		moveError,
		listMoveError,
		activeTaskId,
		activeListId,
		bulkMode,
		handleDragStart,
		handleDragOver,
		handleDragEnd,
		handleDragCancel,
	};
}
