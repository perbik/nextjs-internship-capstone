"use client";

import {
	DragDropProvider,
	type DragEndEvent,
	useDroppable,
} from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import {
	ArrowLeft,
	ArrowRight,
	CheckCircle,
	MoreHorizontal,
	Plus,
	Trash2,
} from "lucide-react";
import {
	useActionState,
	useEffect,
	useRef,
	useState,
	useTransition,
} from "react";
import { useFormStatus } from "react-dom";
import {
	createListAction,
	deleteListAction,
	type ListActionState,
	moveListAction,
	updateListAction,
} from "@/app/(dashboard)/projects/[id]/list-actions";
import { moveTaskAction } from "@/app/(dashboard)/projects/[id]/task-actions";
import {
	CreateTaskModal,
	type TaskMemberOption,
} from "@/components/modals/create-task-modal";
import { TaskCard, type TaskDragData } from "@/components/task-card";

interface BoardTask {
	id: string;
	listId: string;
	title: string;
	description: string | null;
	priority: "low" | "medium" | "high";
	dueDate: Date | null;
	assigneeId: string | null;
	assignee: {
		firstName: string | null;
		lastName: string | null;
		email: string;
	} | null;
}

interface BoardList {
	id: string;
	name: string;
	position: number;
	isCompleted: boolean;
	tasks: BoardTask[];
}

interface KanbanBoardProps {
	projectId: string;
	lists: BoardList[];
	members: TaskMemberOption[];
	canManage: boolean;
	dragEnabled: boolean;
}

interface ColumnDropData {
	kind: "column";
	listId: string;
	index: number;
}

const initialState: ListActionState = { message: "" };

export function KanbanBoard({
	projectId,
	lists,
	members,
	canManage,
	dragEnabled,
}: KanbanBoardProps) {
	const [createState, createAction, isCreating] = useActionState(
		createListAction,
		initialState,
	);
	const [boardLists, setBoardLists] = useState(lists);
	const [moveError, setMoveError] = useState("");
	const [isMoving, startMoveTransition] = useTransition();
	const isDragging = useRef(false);

	useEffect(() => {
		if (!isDragging.current) {
			setBoardLists(lists);
		}
	}, [lists]);

	function handleDragEnd(event: DragEndEvent) {
		isDragging.current = false;

		if (event.canceled || !dragEnabled) {
			return;
		}

		const source = event.operation.source;

		if (!isSortable(source)) {
			return;
		}

		const task = source.data as TaskDragData;
		if (task.kind !== "task") {
			return;
		}

		const dropTarget = event.operation.target?.data as
			| TaskDragData
			| ColumnDropData
			| undefined;
		const droppedOnColumn = dropTarget?.kind === "column";
		const targetListId = droppedOnColumn
			? dropTarget.listId
			: typeof source.group === "string"
				? source.group
				: task.listId;
		const targetPosition = droppedOnColumn ? dropTarget.index : source.index;
		const initialListId =
			typeof source.initialGroup === "string"
				? source.initialGroup
				: task.listId;
		const initialPosition = source.initialIndex;

		if (initialListId === targetListId && initialPosition === targetPosition) {
			return;
		}

		setBoardLists((currentLists) =>
			moveBoardTask(
				currentLists,
				task.taskId,
				initialListId,
				targetListId,
				targetPosition,
			),
		);
		setMoveError("");
		startMoveTransition(async () => {
			const result = await moveTaskAction({
				projectId,
				taskId: task.taskId,
				targetListId,
				targetPosition,
			});

			if (!result.success) {
				setBoardLists(lists);
				setMoveError(result.message);
			}
		});
	}

	return (
		<DragDropProvider
			onDragStart={() => {
				isDragging.current = true;
			}}
			onDragEnd={handleDragEnd}
		>
			<div className="overflow-hidden rounded-lg border border-french_gray-300 bg-white p-5 dark:border-paynes_gray-400 dark:bg-outer_space-500">
				{!dragEnabled && (
					<p className="mb-4 rounded-lg bg-yellow-50 px-3 py-2 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
						Clear task filters to drag and reorder tasks.
					</p>
				)}
				{isMoving && (
					<p className="mb-4 text-sm text-blue_munsell-600 dark:text-blue_munsell-400">
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
							dragDisabled={!dragEnabled}
							canManage={canManage}
							canMoveLeft={index > 0}
							canMoveRight={index < lists.length - 1}
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
		</DragDropProvider>
	);
}

function moveBoardTask(
	currentLists: BoardList[],
	taskId: string,
	sourceListId: string,
	targetListId: string,
	targetPosition: number,
) {
	const sourceList = currentLists.find((list) => list.id === sourceListId);
	const task = sourceList?.tasks.find((item) => item.id === taskId);

	if (!task) {
		return currentLists;
	}

	return currentLists.map((list) => {
		const tasksWithoutMovedTask = list.tasks.filter(
			(item) => item.id !== taskId,
		);

		if (list.id !== targetListId) {
			return list.id === sourceListId
				? { ...list, tasks: tasksWithoutMovedTask }
				: list;
		}

		const nextTasks = [...tasksWithoutMovedTask];
		const nextPosition = Math.min(targetPosition, nextTasks.length);
		nextTasks.splice(nextPosition, 0, { ...task, listId: targetListId });

		return { ...list, tasks: nextTasks };
	});
}

function ListColumn({
	projectId,
	list,
	lists,
	members,
	dragDisabled,
	canManage,
	canMoveLeft,
	canMoveRight,
}: {
	projectId: string;
	list: BoardList;
	lists: BoardList[];
	members: TaskMemberOption[];
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
	const { ref: dropRef, isDropTarget } = useDroppable<ColumnDropData>({
		id: `column-${list.id}`,
		type: "column",
		accept: "task",
		data: {
			kind: "column",
			listId: list.id,
			index: list.tasks.length,
		},
	});

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
						/>
					))
				) : (
					<p className="py-8 text-center text-sm text-paynes_gray-500 dark:text-french_gray-400">
						No tasks in this column
					</p>
				)}
				<CreateTaskModal
					projectId={projectId}
					lists={lists}
					members={members}
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
