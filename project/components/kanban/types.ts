import type { ReactNode } from "react";
import type { TaskLabelOption } from "@/components/project/project-labels";
import type { TaskMemberOption } from "@/components/task/create-task-modal";
import type { BoardList } from "@/stores/board-store";

export interface KanbanBoardProps {
	projectId: string;
	lists: BoardList[];
	members: TaskMemberOption[];
	labels: TaskLabelOption[];
	canManage: boolean;
	dragEnabled: boolean;
	filterControl?: ReactNode;
}

export interface ListColumnProps {
	board: {
		projectId: string;
		lists: BoardList[];
		members: TaskMemberOption[];
		labels: TaskLabelOption[];
		canManage: boolean;
	};
	list: BoardList;
	position: {
		index: number;
		canMoveLeft: boolean;
		canMoveRight: boolean;
	};
	dragDisabled: boolean;
	columnDragDisabled: boolean;
}
