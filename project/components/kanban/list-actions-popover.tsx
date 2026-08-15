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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DestructiveActionDialog } from "@/components/ui/destructive-action-dialog";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { BoardList } from "@/stores/board-store";

const INITIAL_STATE: ListActionState = { message: "" };

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
		INITIAL_STATE,
	);
	const [deleteState, deleteAction, isDeleting] = useActionState(
		deleteListAction,
		INITIAL_STATE,
	);

	return (
		<Popover>
			<Tooltip>
				<TooltipTrigger asChild>
					<PopoverTrigger asChild>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							aria-label={`Actions for column: ${list.name}`}
							className="size-7 rounded-md text-muted-foreground hover:bg-brand/5 hover:text-brand"
						>
							<MoreHorizontal size={18} aria-hidden="true" />
						</Button>
					</PopoverTrigger>
				</TooltipTrigger>
				<TooltipContent>Actions for column: {list.name}</TooltipContent>
			</Tooltip>
			<PopoverContent
				align="end"
				sideOffset={8}
				className="w-64 rounded-xl border-border bg-popover p-4 text-popover-foreground shadow-xl"
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
						<FieldError message={updateState.errors?.name?.[0]} />
					</div>
					<div className="flex items-center gap-2">
						<Checkbox
							id={`list-${list.id}-completed`}
							name="isCompleted"
							defaultChecked={list.isCompleted}
						/>
						<Label
							htmlFor={`list-${list.id}-completed`}
							className="text-xs font-normal text-muted-foreground"
						>
							Tasks here count as completed
						</Label>
					</div>
					{updateState.message && <ActionMessage state={updateState} />}
					<Button type="submit" disabled={isUpdating} className="w-full">
						{isUpdating ? "Saving..." : "Save changes"}
					</Button>
				</form>

				<div className="my-3 border-t border-border" />
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
						<Button
							type="button"
							variant="outline"
							disabled={isDeleting}
							className="w-full border-destructive/30 text-destructive hover:border-destructive/50 hover:bg-destructive/5 hover:text-destructive"
						>
							<Trash2 size={15} aria-hidden="true" />
							Delete column
						</Button>
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
		INITIAL_STATE,
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
		<Button
			type="submit"
			variant="outline"
			size="sm"
			disabled={disabled || pending}
			className="w-full gap-1 px-2 text-xs disabled:cursor-not-allowed"
		>
			<Icon size={14} aria-hidden="true" />
			{direction === "left" ? "Move left" : "Move right"}
		</Button>
	);
}

function ActionMessage({ state }: { state: ListActionState }) {
	return (
		<p
			className={`mb-2 text-xs ${state.success ? "text-success" : "text-destructive"}`}
			role={state.success ? "status" : "alert"}
		>
			{state.message}
		</p>
	);
}
