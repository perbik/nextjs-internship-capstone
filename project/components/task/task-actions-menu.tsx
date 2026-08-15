"use client";

import { AlertTriangle, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import {
	deleteTaskAction,
	type TaskActionState,
} from "@/app/(dashboard)/projects/[id]/task-actions";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBoardStore } from "@/stores/board-store";
import { useUIStore } from "@/stores/ui-store";

const initialState: TaskActionState = { message: "" };

interface TaskActionsMenuProps {
	projectId: string;
	taskId: string;
	taskTitle: string;
	onOpenChange?: (open: boolean) => void;
}

export function TaskActionsMenu({
	projectId,
	taskId,
	taskTitle,
	onOpenChange,
}: TaskActionsMenuProps) {
	const [deleteOpen, setDeleteOpen] = useState(false);
	const openModal = useUIStore((state) => state.openModal);
	const removeTask = useBoardStore((state) => state.removeTask);
	const [state, deleteAction, isPending] = useActionState(
		deleteTaskAction,
		initialState,
	);

	useEffect(() => {
		if (!state.success) return;

		removeTask(taskId);
		setDeleteOpen(false);
	}, [removeTask, state.success, taskId]);

	return (
		<>
			<DropdownMenu modal={false} onOpenChange={onOpenChange}>
				<DropdownMenuTrigger asChild>
					{/* Stop card dragging and editing when the menu trigger is used */}
					<button
						type="button"
						aria-label={`Actions for ${taskTitle}`}
						onPointerDown={(event) => event.stopPropagation()}
						onClick={(event) => event.stopPropagation()}
						className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
					>
						<MoreHorizontal size={15} />
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="end"
					className="w-36"
					onPointerDown={(event) => event.stopPropagation()}
					onClick={(event) => event.stopPropagation()}
				>
					<DropdownMenuItem
						onSelect={() => openModal(`edit-task:${taskId}`)}
						className="cursor-pointer"
					>
						<Pencil />
						Edit
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onSelect={() => setDeleteOpen(true)}
						className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700 dark:text-red-400 dark:focus:bg-red-950/30 dark:focus:text-red-300"
					>
						<Trash2 />
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Deletion requires confirmation because it changes persisted task data */}
			<AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
				<AlertDialogContent>
					<div className="flex size-11 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
						<AlertTriangle size={20} />
					</div>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete {taskTitle}?</AlertDialogTitle>
						<AlertDialogDescription>
							This task will be removed from the board. Its comments and
							activity history will remain in the database.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<form action={deleteAction} className="space-y-4">
						{/* The server action verifies project access and the task's project */}
						<input type="hidden" name="projectId" value={projectId} />
						<input type="hidden" name="taskId" value={taskId} />
						{state.message && !state.success && (
							<p
								className="text-sm text-red-600 dark:text-red-400"
								role="alert"
							>
								{state.message}
							</p>
						)}
						<AlertDialogFooter>
							<AlertDialogCancel type="button">Cancel</AlertDialogCancel>
							<Button type="submit" variant="destructive" disabled={isPending}>
								{isPending ? "Deleting..." : "Delete task"}
							</Button>
						</AlertDialogFooter>
					</form>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
