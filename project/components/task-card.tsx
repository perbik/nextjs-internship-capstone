import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar } from "lucide-react";
import type { CSSProperties } from "react";
import {
	type EditableTask,
	EditTaskModal,
	type TaskListOption,
	type TaskMemberOption,
} from "@/components/modals/create-task-modal";
import type { TaskLabelOption } from "@/components/project-labels";

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
}

export interface TaskDragData {
	kind: "task";
	taskId: string;
	listId: string;
	index: number;
}

const priorityClasses = {
	low: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
	medium:
		"bg-blue_munsell-100 text-blue_munsell-700 dark:bg-blue_munsell-900 dark:text-blue_munsell-300",
	high: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
} as const;

export function TaskCard({
	projectId,
	index,
	dragDisabled,
	task,
	lists,
	members,
	labels,
}: TaskCardProps) {
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
		disabled: dragDisabled,
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

	return (
		<article
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			tabIndex={dragDisabled ? -1 : 0}
			aria-label={`${task.title}. Drag to reorder or move to another column.`}
			className={`touch-pan-y rounded-lg border border-french_gray-300 bg-white p-3 transition-[opacity,box-shadow,border-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue_munsell-500 dark:border-paynes_gray-400 dark:bg-outer_space-300 ${
				dragDisabled
					? "cursor-default"
					: "cursor-grab hover:border-blue_munsell-400 hover:shadow-md active:cursor-grabbing"
			} ${isDragging ? "opacity-40" : ""}`}
		>
			<div className="flex items-start justify-between gap-2">
				<div className="min-w-0">
					<h3 className="text-sm font-medium text-outer_space-500 dark:text-platinum-500">
						{task.title}
					</h3>
					{!dragDisabled && (
						<p className="mt-0.5 text-[11px] text-paynes_gray-400 dark:text-french_gray-500">
							Drag card to move
						</p>
					)}
				</div>
				<div className="shrink-0">
					<EditTaskModal
						projectId={projectId}
						lists={lists}
						members={members}
						labels={labels}
						task={task}
					/>
				</div>
			</div>

			{task.description && (
				<p className="mt-2 line-clamp-2 text-xs text-paynes_gray-500 dark:text-french_gray-400">
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

			<div className="mt-3 flex items-center justify-between gap-2">
				<span
					className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${priorityClasses[task.priority]}`}
				>
					{task.priority}
				</span>
				<span
					className="flex min-w-0 items-center gap-1 text-xs text-paynes_gray-500 dark:text-french_gray-400"
					title={assigneeName}
				>
					<span
						aria-hidden="true"
						className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue_munsell-100 text-[9px] font-semibold text-blue_munsell-700 dark:bg-blue_munsell-900 dark:text-blue_munsell-300"
					>
						{assigneeInitials}
					</span>
					<span className="max-w-24 truncate">{assigneeName}</span>
				</span>
			</div>

			{task.dueDate && (
				<p className="mt-2 flex items-center gap-1 text-xs text-paynes_gray-500 dark:text-french_gray-400">
					<Calendar size={13} />
					{new Date(task.dueDate).toLocaleDateString()}
				</p>
			)}
		</article>
	);
}
