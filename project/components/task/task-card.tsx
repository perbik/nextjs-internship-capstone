import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar } from "lucide-react";
import { type CSSProperties, useState } from "react";
import type { TaskLabelOption } from "@/components/project/project-labels";
import {
	type EditableTask,
	EditTaskModal,
	type TaskListOption,
	type TaskMemberOption,
} from "@/components/task/create-task-modal";
import { TaskActionsMenu } from "@/components/task/task-actions-menu";
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

export interface TaskDragData {
	kind: "task";
	taskId: string;
	listId: string;
	index: number;
}

const priorityClasses = {
	low: "bg-[#7cd278]/10 text-[#4db04f] dark:bg-green-900/40 dark:text-green-300",
	medium: "bg-[#37a5ff]/10 text-[#37a5ff] dark:bg-sky-900/40 dark:text-sky-300",
	high: "bg-[#ff3737]/10 text-[#ff3737] dark:bg-red-900/40 dark:text-red-300",
} as const;

const avatarClasses = [
	"bg-brand",
	"bg-[#6366f1]",
	"bg-[#0ea5e9]",
	"bg-[#4db04f]",
] as const;

function formatDueDate(value: string | Date) {
	return new Intl.DateTimeFormat("en-US", {
		month: "2-digit",
		day: "2-digit",
		year: "numeric",
		timeZone: "UTC",
	}).format(new Date(value));
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
	const sortableDisabled = dragDisabled || actionsOpen;
	const openModal = useUIStore((state) => state.openModal);
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
		},
		disabled: sortableDisabled,
	});
	const style: CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition,
	};
	const assigneeName = task.assignee
		? [task.assignee.firstName, task.assignee.lastName]
				.filter(Boolean)
				.join(" ") || task.assignee.email
		: "Unassigned";
	const assigneeInitials = task.assignee
		? assigneeName
				.split(/\s+/)
				.slice(0, 2)
				.map((part) => part[0]?.toUpperCase())
				.join("")
		: "—";
	const avatarClass = task.assignee
		? avatarClasses[
				assigneeName
					.split("")
					.reduce((total, character) => total + character.charCodeAt(0), 0) %
					avatarClasses.length
			]
		: "bg-[#a8a8a8]";

	return (
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
				if (
					bulkMode ||
					(event.target instanceof HTMLElement &&
						Boolean(event.target.closest("button, input, label, a")))
				) {
					return;
				}

				openModal(`edit-task:${task.id}`);
			}}
			onKeyUp={(event) => {
				if (event.key === "Enter" && !bulkMode && !actionsOpen) {
					openModal(`edit-task:${task.id}`);
				}
			}}
			className={`touch-pan-y rounded-xl border border-input bg-card p-3 shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition-[opacity,box-shadow,border-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30  bg-control ${
				bulkMode
					? "cursor-pointer"
					: sortableDisabled
						? "cursor-default"
						: "cursor-grab hover:border-blue_munsell-400 hover:shadow-md active:cursor-grabbing"
			} ${selected ? "border-blue_munsell-500 ring-2 ring-blue_munsell-500/30" : ""} ${isDragging ? "opacity-40" : ""}`}
		>
			<div className="flex items-start justify-between gap-2">
				{bulkMode && (
					<input
						type="checkbox"
						checked={selected}
						onChange={onToggleSelection}
						aria-label={`Select ${task.title}`}
						className="mt-0.5 size-4 shrink-0 accent-blue_munsell-500"
					/>
				)}
				<div className="min-w-0">
					<h3 className="truncate text-sm font-bold text-foreground ">
						{task.title}
					</h3>
				</div>
				{!bulkMode && (
					<div className="shrink-0">
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
					</div>
				)}
			</div>

			{task.description && (
				<p className="mt-2 line-clamp-2 text-xs leading-[16.5px] text-muted-foreground ">
					{task.description}
				</p>
			)}

			{task.labels.length > 0 && (
				<div className="mt-2 flex flex-wrap gap-1">
					{task.labels.map((label) => (
						<span
							key={label.id}
							className="rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
							style={{ backgroundColor: label.color }}
						>
							{label.name}
						</span>
					))}
				</div>
			)}

			<div className="mt-3 flex min-h-8 items-center justify-between gap-2 pt-1">
				<div className="flex min-w-0 items-center gap-2">
					<span
						className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${priorityClasses[task.priority]}`}
					>
						{task.priority}
					</span>
					{task.dueDate && (
						<span className="flex items-center gap-1 text-[10px] text-muted-foreground">
							<Calendar size={11} />
							{formatDueDate(task.dueDate)}
						</span>
					)}
				</div>
				<span
					className="flex min-w-0 items-center gap-1 text-xs text-paynes_gray-500 dark:text-french_gray-400"
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
