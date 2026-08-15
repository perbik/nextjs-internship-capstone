import type { EditableTask } from "@/components/task/task-modal-types";
import { Badge } from "@/components/ui/badge";

type TaskPriority = EditableTask["priority"];

const priorityClasses: Record<TaskPriority, string> = {
	low: "bg-[#7cd278]/10 text-[#4db04f] dark:bg-green-900/40 dark:text-green-300",
	medium: "bg-[#37a5ff]/10 text-[#37a5ff] dark:bg-sky-900/40 dark:text-sky-300",
	high: "bg-[#ff3737]/10 text-[#ff3737] dark:bg-red-900/40 dark:text-red-300",
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
	return (
		<Badge
			variant="secondary"
			className={`border-0 px-2.5 py-0.5 text-[11px] font-bold capitalize ${priorityClasses[priority]}`}
		>
			{priority}
		</Badge>
	);
}
