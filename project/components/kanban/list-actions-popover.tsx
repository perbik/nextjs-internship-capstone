"use client";

import { ArrowLeft, ArrowRight, MoreHorizontal, Trash2 } from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
	deleteListAction,
	type ListActionState,
	moveListAction,
	updateListAction,
} from "@/app/(dashboard)/projects/[id]/list-actions";
import { DestructiveActionDialog } from "@/components/ui/destructive-action-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import type { BoardList } from "@/stores/board-store";

const initialState: ListActionState = { message: "" };

interface ListActionsPopoverProps {
	projectId: string;
	list: BoardList;
	canMoveLeft: boolean;
	canMoveRight: boolean;
}

export function ListActionsPopover({
	projectId,
	list,
	canMoveLeft,
	canMoveRight,
}: ListActionsPopoverProps) {
	const [updateState, updateAction, isUpdating] = useActionState(
		updateListAction,
		initialState,
	);
	const [deleteState, deleteAction, isDeleting] = useActionState(
		deleteListAction,
		initialState,
	);

	return (
		<Popover>
			<PopoverTrigger asChild>
				<button
					type="button"
					aria-label={`Manage ${list.name}`}
					className="flex rounded p-1.5 text-paynes_gray-500 hover:bg-french_gray-300 dark:text-french_gray-400 dark:hover:bg-paynes_gray-400"
				>
					<MoreHorizontal size={18} />
				</button>
			</PopoverTrigger>
			<PopoverContent
				align="end"
				sideOffset={8}
				className="w-64 rounded-xl border-french_gray-300 bg-card p-4 shadow-xl dark:border-paynes_gray-400 dark:bg-outer_space-500"
			>
				<form action={updateAction} className="space-y-3">
					<input type="hidden" name="listId" value={list.id} />
					<input type="hidden" name="projectId" value={projectId} />
					<div className="space-y-1.5">
						<Label htmlFor={`list-${list.id}-name`}>Column name</Label>
						<Input
							id={`list-${list.id}-name`}
							name="name"
							required
							maxLength={100}
							defaultValue={list.name}
						/>
					</div>
					<label className="flex items-center gap-2 text-xs text-paynes_gray-500 dark:text-french_gray-400">
						<input
							type="checkbox"
							name="isCompleted"
							defaultChecked={list.isCompleted}
							className="size-4 accent-brand"
						/>
						Tasks here count as completed
					</label>
					{updateState.message && <ActionMessage state={updateState} />}
					<button
						type="submit"
						disabled={isUpdating}
						className="w-full rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
					>
						{isUpdating ? "Saving..." : "Save changes"}
					</button>
				</form>

				<div className="my-3 border-t border-border " />
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

				<DestructiveActionDialog
					title={`Delete ${list.name}?`}
					description="Every task in this column will also be deleted. This action cannot be undone from the board."
					action={deleteAction}
					fields={[
						{ name: "listId", value: list.id },
						{ name: "projectId", value: projectId },
					]}
					confirmLabel="Delete column"
					pendingLabel="Deleting..."
					error={deleteState.success ? undefined : deleteState.message}
					trigger={
						<button
							type="button"
							disabled={isDeleting}
							className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
						>
							<Trash2 size={15} />
							Delete column
						</button>
					}
				/>
			</PopoverContent>
		</Popover>
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
	const [state, action] = useActionState(
		async (_previousState: ListActionState, formData: FormData) =>
			moveListAction(formData),
		initialState,
	);

	return (
		<form action={action}>
			<input type="hidden" name="projectId" value={projectId} />
			<input type="hidden" name="listId" value={listId} />
			<input type="hidden" name="direction" value={direction} />
			<MoveSubmitButton direction={direction} disabled={disabled} />
			{state.message && !state.success && <ActionMessage state={state} />}
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
			className="flex w-full items-center justify-center gap-1 rounded-lg border border-input px-2 py-1.5 text-xs text-foreground disabled:cursor-not-allowed disabled:opacity-40  "
		>
			<Icon size={14} />
			{direction === "left" ? "Move left" : "Move right"}
		</button>
	);
}

function ActionMessage({ state }: { state: ListActionState }) {
	return (
		<p
			className={`mb-2 text-xs ${state.success ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
			role="status"
		>
			{state.message}
		</p>
	);
}
