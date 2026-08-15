"use client";

import { CheckSquare, Keyboard, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { bulkUpdateTasksAction } from "@/app/(dashboard)/projects/[id]/task-actions";
import type { TaskMemberOption } from "@/components/modals/create-task-modal";
import type { TaskLabelOption } from "@/components/project-labels";
import { type BoardList, useBoardStore } from "@/stores/board-store";
import { useUIStore } from "@/stores/ui-store";

type BulkOperation =
	| "move"
	| "assign"
	| "priority"
	| "add_label"
	| "remove_label";

export function BulkTaskToolbar({
	projectId,
	lists,
	members,
	labels,
}: {
	projectId: string;
	lists: BoardList[];
	members: TaskMemberOption[];
	labels: TaskLabelOption[];
}) {
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
	const allTaskIds = useMemo(
		() => lists.flatMap((list) => list.tasks.map((task) => task.id)),
		[lists],
	);

	useEffect(() => {
		const defaultValues: Record<BulkOperation, string> = {
			move: lists[0]?.id ?? "",
			assign: "unassigned",
			priority: "medium",
			add_label: labels[0]?.id ?? "",
			remove_label: labels[0]?.id ?? "",
		};
		setValue(defaultValues[operation]);
	}, [labels, lists, operation]);

	useEffect(() => {
		function handleShortcut(event: KeyboardEvent) {
			const target = event.target;
			const isTyping =
				target instanceof HTMLInputElement ||
				target instanceof HTMLTextAreaElement ||
				target instanceof HTMLSelectElement ||
				(target instanceof HTMLElement && target.isContentEditable);

			if (isTyping) {
				return;
			}

			if (activeModalId) {
				return;
			}

			if (event.key.toLowerCase() === "b" && !event.ctrlKey && !event.metaKey) {
				event.preventDefault();
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

	async function applyBulkOperation() {
		if (selectedTaskIds.length === 0 || !value || pendingMoves.length > 0) {
			return;
		}

		setIsPending(true);
		setMessage("");
		const orderedSelectedIds = allTaskIds.filter((id) =>
			selectedTaskIds.includes(id),
		);
		const result = await bulkUpdateTasksAction({
			projectId,
			taskIds: orderedSelectedIds,
			operation,
			value,
		});

		setSuccess(Boolean(result.success));
		setMessage(result.message);
		setIsPending(false);

		if (result.success) {
			clearTaskSelection();
			router.refresh();
		}
	}

	if (!bulkMode) {
		return (
			<div className="mb-4 flex items-center justify-between gap-3">
				<button
					type="button"
					onClick={() => setBulkMode(true)}
					className="inline-flex items-center gap-2 rounded-lg border border-french_gray-300 px-3 py-2 text-sm text-outer_space-500 hover:bg-platinum-500 dark:border-paynes_gray-400 dark:text-platinum-500 dark:hover:bg-paynes_gray-400"
				>
					<CheckSquare size={16} />
					Bulk select
				</button>
				<span className="hidden items-center gap-1 text-xs text-paynes_gray-500 sm:flex dark:text-french_gray-400">
					<Keyboard size={14} />
					Press B for bulk mode
				</span>
			</div>
		);
	}

	const operationNeedsLabel =
		operation === "add_label" || operation === "remove_label";

	return (
		<div className="mb-4 space-y-3 rounded-xl border border-blue_munsell-300 bg-blue_munsell-50 p-3 dark:border-blue_munsell-800 dark:bg-blue_munsell-900/20">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<p className="text-sm font-medium text-outer_space-500 dark:text-platinum-500">
					{selectedTaskIds.length} selected
				</p>
				<div className="flex flex-wrap items-center gap-2">
					<button
						type="button"
						onClick={() => selectTasks(allTaskIds)}
						className="text-xs text-blue_munsell-700 hover:underline dark:text-blue_munsell-300"
					>
						Select all ({allTaskIds.length})
					</button>
					<button
						type="button"
						onClick={clearTaskSelection}
						className="text-xs text-paynes_gray-500 hover:underline dark:text-french_gray-400"
					>
						Clear
					</button>
					<button
						type="button"
						onClick={() => setBulkMode(false)}
						aria-label="Exit bulk selection"
						className="rounded p-1 hover:bg-white/70 dark:hover:bg-paynes_gray-400"
					>
						<X size={16} />
					</button>
				</div>
			</div>

			<div className="grid gap-2 md:grid-cols-[10rem_minmax(12rem,1fr)_auto]">
				<label>
					<span className="sr-only">Bulk operation</span>
					<select
						value={operation}
						onChange={(event) =>
							setOperation(event.target.value as BulkOperation)
						}
						className="w-full rounded-lg border border-french_gray-300 bg-white px-3 py-2 text-sm dark:border-paynes_gray-400 dark:bg-outer_space-400"
					>
						<option value="move">Move to</option>
						<option value="assign">Assign to</option>
						<option value="priority">Set priority</option>
						<option value="add_label">Add label</option>
						<option value="remove_label">Remove label</option>
					</select>
				</label>

				<label>
					<span className="sr-only">Bulk operation value</span>
					<select
						value={value}
						onChange={(event) => setValue(event.target.value)}
						disabled={operationNeedsLabel && labels.length === 0}
						className="w-full rounded-lg border border-french_gray-300 bg-white px-3 py-2 text-sm disabled:opacity-50 dark:border-paynes_gray-400 dark:bg-outer_space-400"
					>
						{operation === "move" &&
							lists.map((list) => (
								<option key={list.id} value={list.id}>
									{list.name}
								</option>
							))}
						{operation === "assign" && (
							<>
								<option value="unassigned">Unassigned</option>
								{members.map((member) => (
									<option key={member.id} value={member.id}>
										{member.name}
										{member.isCurrentUser ? " (You)" : ""}
									</option>
								))}
							</>
						)}
						{operation === "priority" && (
							<>
								<option value="low">Low</option>
								<option value="medium">Medium</option>
								<option value="high">High</option>
							</>
						)}
						{operationNeedsLabel &&
							labels.map((label) => (
								<option key={label.id} value={label.id}>
									{label.name}
								</option>
							))}
					</select>
				</label>

				<button
					type="button"
					onClick={applyBulkOperation}
					disabled={
						isPending ||
						selectedTaskIds.length === 0 ||
						!value ||
						pendingMoves.length > 0
					}
					className="rounded-lg bg-blue_munsell-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue_munsell-600 disabled:opacity-50"
				>
					{isPending ? "Applying..." : "Apply"}
				</button>
			</div>

			{pendingMoves.length > 0 && (
				<p className="text-xs text-yellow-700 dark:text-yellow-300">
					Wait for board position changes to finish saving.
				</p>
			)}
			{message && (
				<p
					className={
						success
							? "text-xs text-green-700 dark:text-green-400"
							: "text-xs text-red-600 dark:text-red-400"
					}
					role="status"
				>
					{message}
				</p>
			)}
			<p className="text-[11px] text-paynes_gray-500 dark:text-french_gray-400">
				Shortcuts: B toggles bulk mode · Ctrl/Cmd+A selects visible tasks · Esc
				exits
			</p>
		</div>
	);
}
