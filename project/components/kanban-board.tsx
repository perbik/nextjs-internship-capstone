"use client";

import {
	closestCorners,
	DndContext,
	type DragCancelEvent,
	type DragEndEvent,
	type DragOverEvent,
	DragOverlay,
	type DragStartEvent,
	KeyboardSensor,
	PointerSensor,
	useDroppable,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
	ArrowLeft,
	ArrowRight,
	CheckCircle,
	MoreHorizontal,
	Plus,
	Trash2,
} from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import {
	createListAction,
	deleteListAction,
	type ListActionState,
	moveListAction,
	updateListAction,
} from "@/app/(dashboard)/projects/[id]/list-actions";
import { saveBoardLayoutAction } from "@/app/(dashboard)/projects/[id]/task-actions";
import { BulkTaskToolbar } from "@/components/bulk-task-toolbar";
import {
	CreateTaskModal,
	type TaskMemberOption,
} from "@/components/modals/create-task-modal";
import type { TaskLabelOption } from "@/components/project-labels";
import { TaskCard } from "@/components/task-card";
import {
	type BoardList,
	type BoardMove,
	useBoardStore,
} from "@/stores/board-store";

interface KanbanBoardProps {
	projectId: string;
	lists: BoardList[];
	members: TaskMemberOption[];
	labels: TaskLabelOption[];
	canManage: boolean;
	dragEnabled: boolean;
}

const initialState: ListActionState = { message: "" };

function findTaskLocation(lists: BoardList[], taskId: string) {
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

function getDropLocation(data: Record<string, unknown> | undefined) {
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

export function KanbanBoard({
	projectId,
	lists,
	members,
	labels,
	canManage,
	dragEnabled,
}: KanbanBoardProps) {
	const [createState, createAction, isCreating] = useActionState(
		createListAction,
		initialState,
	);
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
		bulkMode,
	} = useBoardStore();
	const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const saveInFlight = useRef(false);
	const dragOrigin = useRef<{
		taskId: string;
		listId: string;
		position: number;
	} | null>(null);
	const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 4 },
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);
	const boardLists = storedProjectId === projectId ? storedLists : lists;
	const isMoving = pendingMoves.length > 0;

	useEffect(() => {
		syncBoard(projectId, lists);
	}, [lists, projectId, syncBoard]);

	function handleDragStart(event: DragStartEvent) {
		const location = findTaskLocation(boardLists, String(event.active.id));

		if (!location) {
			return;
		}

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
		const origin = dragOrigin.current;

		if (!origin || !event.over) {
			return;
		}

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
		setActiveTaskId(null);
		cancelDragging();
	}

	function handleDragEnd(event: DragEndEvent) {
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

	function scheduleSave(delay = 250) {
		if (saveTimer.current) {
			clearTimeout(saveTimer.current);
		}

		saveTimer.current = setTimeout(() => {
			saveTimer.current = null;
			void persistBoardSnapshot();
		}, delay);
	}

	async function persistBoardSnapshot() {
		if (saveInFlight.current) {
			return;
		}

		const state = useBoardStore.getState();
		const capturedMoves = [...state.pendingMoves];

		if (capturedMoves.length === 0) {
			return;
		}

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

			if (result.success) {
				confirmSnapshot(
					capturedMoves.map((move) => move.id),
					snapshot,
				);
			} else {
				rejectSnapshot(
					capturedMoves.map((move) => move.id),
					result.message,
				);
			}
		} catch {
			rejectSnapshot(
				capturedMoves.map((move) => move.id),
				"Unable to save the task position. Please try again.",
			);
		} finally {
			saveInFlight.current = false;

			if (useBoardStore.getState().pendingMoves.length > 0) {
				scheduleSave(0);
			}
		}
	}

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCorners}
			onDragStart={handleDragStart}
			onDragOver={handleDragOver}
			onDragEnd={handleDragEnd}
			onDragCancel={handleDragCancel}
		>
			<div className="overflow-hidden rounded-lg border border-french_gray-300 bg-white p-5 dark:border-paynes_gray-400 dark:bg-outer_space-500">
				<BulkTaskToolbar
					projectId={projectId}
					lists={boardLists}
					members={members}
					labels={labels}
				/>
				{!dragEnabled && (
					<p className="mb-4 rounded-lg bg-yellow-50 px-3 py-2 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
						Clear task filters to drag and reorder tasks.
					</p>
				)}
				{isMoving && (
					<p className="sr-only" role="status" aria-live="polite">
						Saving task position...
					</p>
				)}
				{moveError && (
					<p
						className="mb-4 text-sm text-red-600 dark:text-red-400"
						role="alert"
					>
						{moveError}
					</p>
				)}
				<div className="flex gap-5 overflow-x-auto pb-3">
					{boardLists.map((list, index) => (
						<ListColumn
							key={list.id}
							projectId={projectId}
							list={list}
							lists={boardLists}
							members={members}
							labels={labels}
							dragDisabled={!dragEnabled || bulkMode}
							canManage={canManage}
							canMoveLeft={index > 0}
							canMoveRight={index < boardLists.length - 1}
						/>
					))}

					{canManage && (
						<form
							action={createAction}
							className="w-80 shrink-0 self-start rounded-lg border border-dashed border-french_gray-300 bg-platinum-800 p-4 dark:border-paynes_gray-400 dark:bg-outer_space-400"
						>
							<input type="hidden" name="projectId" value={projectId} />
							<label
								htmlFor="new-list-name"
								className="text-sm font-medium text-outer_space-500 dark:text-platinum-500"
							>
								Add a column
							</label>
							<input
								id="new-list-name"
								name="name"
								required
								maxLength={100}
								placeholder="Column name"
								className="mt-2 w-full rounded-md border border-french_gray-300 bg-white px-3 py-2 text-sm text-outer_space-500 focus:outline-none focus:ring-2 focus:ring-blue_munsell-500 dark:border-paynes_gray-400 dark:bg-outer_space-500 dark:text-platinum-500"
							/>
							<label className="mt-3 flex items-center gap-2 text-sm text-paynes_gray-500 dark:text-french_gray-400">
								<input
									type="checkbox"
									name="isCompleted"
									className="size-4 accent-blue_munsell-500"
								/>
								Tasks here count as completed
							</label>
							{createState.message && (
								<p
									className={`mt-2 text-xs ${
										createState.success
											? "text-green-600 dark:text-green-400"
											: "text-red-600 dark:text-red-400"
									}`}
									role="status"
								>
									{createState.message}
								</p>
							)}
							<button
								type="submit"
								disabled={isCreating}
								className="mt-3 inline-flex items-center gap-2 rounded-md bg-blue_munsell-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue_munsell-600 disabled:opacity-60"
							>
								<Plus size={16} />
								{isCreating ? "Adding..." : "Add column"}
							</button>
						</form>
					)}
				</div>
			</div>
			<DragOverlay dropAnimation={null}>
				{activeTaskId ? (
					<div className="w-72 rounded-lg border border-blue_munsell-400 bg-white p-3 text-sm font-medium text-outer_space-500 shadow-xl dark:bg-outer_space-300 dark:text-platinum-500">
						{findTaskLocation(boardLists, activeTaskId)?.task.title}
					</div>
				) : null}
			</DragOverlay>
		</DndContext>
	);
}

function ListColumn({
	projectId,
	list,
	lists,
	members,
	labels,
	dragDisabled,
	canManage,
	canMoveLeft,
	canMoveRight,
}: {
	projectId: string;
	list: BoardList;
	lists: BoardList[];
	members: TaskMemberOption[];
	labels: TaskLabelOption[];
	dragDisabled: boolean;
	canManage: boolean;
	canMoveLeft: boolean;
	canMoveRight: boolean;
}) {
	const [updateState, updateAction, isUpdating] = useActionState(
		updateListAction,
		initialState,
	);
	const [deleteState, deleteAction, isDeleting] = useActionState(
		deleteListAction,
		initialState,
	);
	const { setNodeRef: dropRef, isOver: isDropTarget } = useDroppable({
		id: `column-${list.id}`,
		data: {
			kind: "column",
			listId: list.id,
			index: list.tasks.length,
		},
	});
	const bulkMode = useBoardStore((state) => state.bulkMode);
	const selectedTaskIds = useBoardStore((state) => state.selectedTaskIds);
	const toggleTaskSelection = useBoardStore(
		(state) => state.toggleTaskSelection,
	);

	return (
		<section className="w-80 shrink-0 overflow-hidden rounded-lg border border-french_gray-300 bg-platinum-800 dark:border-paynes_gray-400 dark:bg-outer_space-400">
			<header className="border-b border-french_gray-300 p-4 dark:border-paynes_gray-400">
				<div className="flex items-center justify-between gap-2">
					<div className="min-w-0">
						<h2 className="flex items-center gap-2 truncate font-semibold text-outer_space-500 dark:text-platinum-500">
							{list.name}
							{list.isCompleted && (
								<CheckCircle
									size={15}
									className="shrink-0 text-green-600 dark:text-green-400"
									aria-label="Completed column"
								/>
							)}
						</h2>
						<p className="mt-1 text-xs text-paynes_gray-500 dark:text-french_gray-400">
							{list.tasks.length} {list.tasks.length === 1 ? "task" : "tasks"}
						</p>
					</div>

					{canManage && (
						<details>
							<summary className="flex cursor-pointer list-none rounded p-1.5 text-paynes_gray-500 hover:bg-french_gray-300 dark:text-french_gray-400 dark:hover:bg-paynes_gray-400">
								<MoreHorizontal size={18} />
								<span className="sr-only">Manage {list.name}</span>
							</summary>
							<div className="mt-2 w-64 rounded-lg border border-french_gray-300 bg-white p-4 shadow-xl dark:border-paynes_gray-400 dark:bg-outer_space-500">
								<form action={updateAction} className="space-y-3">
									<input type="hidden" name="listId" value={list.id} />
									<input type="hidden" name="projectId" value={projectId} />
									<label className="block text-xs font-medium text-outer_space-500 dark:text-platinum-500">
										Column name
										<input
											name="name"
											required
											maxLength={100}
											defaultValue={list.name}
											className="mt-1 w-full rounded-md border border-french_gray-300 bg-white px-2.5 py-2 text-sm dark:border-paynes_gray-400 dark:bg-outer_space-400"
										/>
									</label>
									<label className="flex items-center gap-2 text-xs text-paynes_gray-500 dark:text-french_gray-400">
										<input
											type="checkbox"
											name="isCompleted"
											defaultChecked={list.isCompleted}
											className="size-4 accent-blue_munsell-500"
										/>
										Tasks here count as completed
									</label>
									{updateState.message && <ActionMessage state={updateState} />}
									<button
										type="submit"
										disabled={isUpdating}
										className="w-full rounded-md bg-blue_munsell-500 px-3 py-2 text-sm text-white disabled:opacity-60"
									>
										{isUpdating ? "Saving..." : "Save changes"}
									</button>
								</form>

								<div className="my-3 border-t border-french_gray-300 dark:border-paynes_gray-400" />

								<div className="mb-3 grid grid-cols-2 gap-2">
									<MoveListButton
										projectId={projectId}
										listId={list.id}
										direction="left"
										disabled={!canMoveLeft}
									/>
									<MoveListButton
										projectId={projectId}
										listId={list.id}
										direction="right"
										disabled={!canMoveRight}
									/>
								</div>

								<form
									action={deleteAction}
									onSubmit={(event) => {
										if (
											!window.confirm(
												`Delete "${list.name}" and all tasks inside it?`,
											)
										) {
											event.preventDefault();
										}
									}}
								>
									<input type="hidden" name="listId" value={list.id} />
									<input type="hidden" name="projectId" value={projectId} />
									{deleteState.message && <ActionMessage state={deleteState} />}
									<button
										type="submit"
										disabled={isDeleting}
										className="flex w-full items-center justify-center gap-2 rounded-md border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
									>
										<Trash2 size={15} />
										{isDeleting ? "Deleting..." : "Delete column"}
									</button>
								</form>
							</div>
						</details>
					)}
				</div>
			</header>

			<div
				ref={dropRef}
				className={`min-h-80 space-y-3 p-3 transition-colors ${
					isDropTarget ? "bg-blue_munsell-50 dark:bg-blue_munsell-900/20" : ""
				}`}
			>
				<SortableContext
					items={list.tasks.map((task) => task.id)}
					strategy={verticalListSortingStrategy}
				>
					{list.tasks.length > 0 ? (
						list.tasks.map((task, index) => (
							<TaskCard
								key={task.id}
								projectId={projectId}
								index={index}
								dragDisabled={dragDisabled}
								task={task}
								lists={lists}
								members={members}
								labels={labels}
								bulkMode={bulkMode}
								selected={selectedTaskIds.includes(task.id)}
								onToggleSelection={() => toggleTaskSelection(task.id)}
							/>
						))
					) : (
						<p className="py-8 text-center text-sm text-paynes_gray-500 dark:text-french_gray-400">
							No tasks in this column
						</p>
					)}
				</SortableContext>
				<CreateTaskModal
					projectId={projectId}
					lists={lists}
					members={members}
					labels={labels}
					initialListId={list.id}
				/>
			</div>
		</section>
	);
}

function MoveListButton({
	projectId,
	listId,
	direction,
	disabled,
}: {
	projectId: string;
	listId: string;
	direction: "left" | "right";
	disabled: boolean;
}) {
	return (
		<form action={moveListAction}>
			<input type="hidden" name="projectId" value={projectId} />
			<input type="hidden" name="listId" value={listId} />
			<input type="hidden" name="direction" value={direction} />
			<MoveSubmitButton direction={direction} disabled={disabled} />
		</form>
	);
}

function MoveSubmitButton({
	direction,
	disabled,
}: {
	direction: "left" | "right";
	disabled: boolean;
}) {
	const { pending } = useFormStatus();
	const Icon = direction === "left" ? ArrowLeft : ArrowRight;

	return (
		<button
			type="submit"
			disabled={disabled || pending}
			className="flex w-full items-center justify-center gap-1 rounded-md border border-french_gray-300 px-2 py-1.5 text-xs text-outer_space-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-paynes_gray-400 dark:text-platinum-500"
		>
			<Icon size={14} />
			{direction === "left" ? "Move left" : "Move right"}
		</button>
	);
}

function ActionMessage({ state }: { state: ListActionState }) {
	return (
		<p
			className={`mb-2 text-xs ${
				state.success
					? "text-green-600 dark:text-green-400"
					: "text-red-600 dark:text-red-400"
			}`}
			role="status"
		>
			{state.message}
		</p>
	);
}
