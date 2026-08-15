import { Calendar, User } from "lucide-react";
import {
	type EditableTask,
	EditTaskModal,
	type TaskListOption,
	type TaskMemberOption,
} from "@/components/modals/create-task-modal";

interface TaskCardProps {
	projectId: string;
	task: EditableTask & {
		assignee: {
			firstName: string | null;
			lastName: string | null;
			email: string;
		} | null;
	};
	lists: TaskListOption[];
	members: TaskMemberOption[];
}

const priorityClasses = {
	low: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
	medium:
		"bg-blue_munsell-100 text-blue_munsell-700 dark:bg-blue_munsell-900 dark:text-blue_munsell-300",
	high: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
} as const;

export function TaskCard({ projectId, task, lists, members }: TaskCardProps) {
	const assigneeName = task.assignee
		? [task.assignee.firstName, task.assignee.lastName]
				.filter(Boolean)
				.join(" ") || task.assignee.email
		: "Unassigned";

	return (
		<article className="rounded-lg border border-french_gray-300 bg-white p-3 dark:border-paynes_gray-400 dark:bg-outer_space-300">
			<div className="flex items-start justify-between gap-2">
				<h3 className="text-sm font-medium text-outer_space-500 dark:text-platinum-500">
					{task.title}
				</h3>
				<EditTaskModal
					projectId={projectId}
					lists={lists}
					members={members}
					task={task}
				/>
			</div>

			{task.description && (
				<p className="mt-2 line-clamp-2 text-xs text-paynes_gray-500 dark:text-french_gray-400">
					{task.description}
				</p>
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
					<User size={13} className="shrink-0" />
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
