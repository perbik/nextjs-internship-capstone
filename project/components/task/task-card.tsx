import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar } from "lucide-react";
import { type CSSProperties, useState } from "react";
import type { TaskLabelOption } from "@/components/project/project-labels";
import { EditTaskModal } from "@/components/task/create-task-modal";
import { PriorityBadge } from "@/components/task/priority-badge";
import { TaskActionsMenu } from "@/components/task/task-actions-menu";
import type {
	EditableTask,
	TaskListOption,
	TaskMemberOption,
} from "@/components/task/task-modal-types";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { getInitials } from "@/lib/avatar-utils";
import { formatUtcDate } from "@/lib/date-utils";
import { useUIStore } from "@/stores/ui-store";

interface TaskCardProps {
	projectId: string;
	index: number;
	dragDisabled: boolean;
	task: EditableTask & {
		assignee: {
			firstName: string | null;
			lastName: string | null;
			email: string;
		} | null;
	};
	lists: TaskListOption[];
	members: TaskMemberOption[];
	labels: TaskLabelOption[];
	canManageLabels: boolean;
	bulkMode: boolean;
	selected: boolean;
	onToggleSelection: () => void;
}

// Identifies the task's current position during a drag operation
export interface TaskDragData {
	kind: "task";
	taskId: string;
	listId: string;
	index: number;
}

export function TaskCard({
	projectId,
	index,
	dragDisabled,
	task,
	lists,
	members,
	labels,
	canManageLabels,
	bulkMode,
	selected,
	onToggleSelection,
}: TaskCardProps) {
	const [actionsOpen, setActionsOpen] = useState(false);
	const activeModalId = useUIStore((state) => state.activeModalId);
	const sortableDisabled =
		dragDisabled || actionsOpen || activeModalId !== null;
	const openModal = useUIStore((state) => state.openModal);

	// Connect this task and its board position to dnd-kit
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: task.id,
		data: {
			kind: "task",
			taskId: task.id,
			listId: task.listId,
			index,
		} satisfies TaskDragData,
		disabled: sortableDisabled,
	});
	const style: CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	// Prepare the fallback avatar details shown in the card footer
	const assigneeName = task.assignee
		? [task.assignee.firstName, task.assignee.lastName]
				.filter(Boolean)
				.join(" ") || task.assignee.email
		: "Unassigned";
	const assigneeInitials = task.assignee ? getInitials(assigneeName) : "—";
	const avatarClass = task.assignee ? "bg-brand" : "bg-muted-foreground";

	return (
		// The whole card is draggable normally and selectable in bulk mode
		<article
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			tabIndex={sortableDisabled ? -1 : 0}
			aria-label={
				bulkMode
					? `${task.title}. ${selected ? "Selected" : "Not selected"}.`
					: `${task.title}. Drag to reorder or move to another column.`
			}
			onClick={(event) => {
				// Interactive controls handle their own click without opening the task
				if (
					event.target instanceof HTMLElement &&
					event.target.closest("button, input, label, a")
				) {
					return;
				}
				if (bulkMode) {
					onToggleSelection();
					return;
				}

				openModal(`edit-task:${task.id}`);
			}}
			onKeyUp={(event) => {
				if (event.key === "Enter" && !bulkMode && !actionsOpen) {
					openModal(`edit-task:${task.id}`);
				}
			}}
			className={`touch-pan-y rounded-xl border border-input bg-card p-3 shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition-[opacity,box-shadow,border-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 ${
				bulkMode
					? "cursor-pointer"
					: sortableDisabled
						? "cursor-default"
						: "cursor-grab hover:border-brand/50 hover:shadow-md active:cursor-grabbing"
			} ${selected ? "border-brand ring-2 ring-brand/30" : ""} ${isDragging ? "opacity-40" : ""}`}
		>
			{/* Task title and the current card action */}
			<div className="flex items-start justify-between gap-2">
				<div className="min-w-0">
					<h3 className="truncate text-sm font-bold text-foreground ">
						{task.title}
					</h3>
				</div>
				<div className="flex size-6 shrink-0 items-center justify-center">
					{bulkMode ? (
						<Checkbox
							checked={selected}
							onCheckedChange={onToggleSelection}
							aria-label={`Select ${task.title}`}
							className="size-5 rounded-md border-2 border-muted-foreground/40 bg-card text-white shadow-sm transition-colors hover:border-brand hover:bg-brand/5 focus-visible:ring-brand/30 data-[state=checked]:border-brand data-[state=checked]:bg-brand data-[state=checked]:text-white [&_svg]:size-3"
						/>
					) : (
						<>
							<TaskActionsMenu
								projectId={projectId}
								taskId={task.id}
								taskTitle={task.title}
								onOpenChange={setActionsOpen}
							/>
							<EditTaskModal
								projectId={projectId}
								lists={lists}
								members={members}
								labels={labels}
								canManageLabels={canManageLabels}
								task={task}
								showTrigger={false}
							/>
						</>
					)}
				</div>
			</div>

			{/* Optional task description */}
			{task.description && (
				<p className="mt-2 line-clamp-2 text-xs leading-[16.5px] text-muted-foreground ">
					{task.description}
				</p>
			)}

			{/* User-defined task labels */}
			{task.labels.length > 0 && (
				<div className="mt-2 flex flex-wrap gap-1">
					{task.labels.map((label) => (
						<Badge
							key={label.id}
							className="border-0 px-2 py-0.5 text-[10px] font-medium text-white hover:opacity-90"
							style={{ backgroundColor: label.color }}
						>
							{label.name}
						</Badge>
					))}
				</div>
			)}

			{/* Priority, deadline, and assignee summary */}
			<div className="mt-3 flex min-h-8 items-center justify-between gap-2 pt-1">
				<div className="flex min-w-0 items-center gap-2">
					<PriorityBadge priority={task.priority} />
					{task.dueDate && (
						<span className="flex items-center gap-1 text-[10px] text-muted-foreground">
							<Calendar size={11} />
							{formatUtcDate(task.dueDate)}
						</span>
					)}
				</div>
				<span
					className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground"
					title={assigneeName}
				>
					<span
						aria-hidden="true"
						className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${avatarClass}`}
					>
						{assigneeInitials}
					</span>
					<span className="sr-only">{assigneeName}</span>
				</span>
			</div>
		</article>
	);
}
