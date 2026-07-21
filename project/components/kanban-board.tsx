// TODO: Task 5.1 - Design responsive Kanban board layout
// TODO: Task 5.2 - Implement drag-and-drop functionality with dnd-kit

/*
TODO: Implementation Notes for Interns:

This is the main Kanban board component that should:
- Display columns (lists) horizontally
- Allow drag and drop of tasks between columns
- Support adding new tasks and columns
- Handle real-time updates
- Be responsive on mobile

Key dependencies to install:
- @dnd-kit/core
- @dnd-kit/sortable
- @dnd-kit/utilities

Features to implement:
- Drag and drop tasks between columns
- Drag and drop to reorder tasks within columns
- Add new task button in each column
- Add new column functionality
- Optimistic updates (Task 5.4)
- Real-time persistence (Task 5.5)
- Mobile responsive design
- Loading states
- Error handling

State management:
- Use Zustand store for board state (Task 5.3)
- Implement optimistic updates
- Handle conflicts with server state
*/

export function KanbanBoard({ projectId }: { projectId: string }) {
	return (
		<div className="bg-white dark:bg-outer_space-500 rounded-lg border border-french_gray-300 dark:border-paynes_gray-400 p-6">
			<div className="text-center text-paynes_gray-500 dark:text-french_gray-400">
				<h3 className="text-lg font-semibold mb-2">
					TODO: Implement Kanban Board
				</h3>
				<p className="text-sm mb-4">Project ID: {projectId}</p>
				<div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded border border-yellow-200 dark:border-yellow-800">
					<p className="text-sm text-yellow-800 dark:text-yellow-200">
						📋 This will be the main interactive Kanban board with drag-and-drop
						functionality
					</p>
				</div>
			</div>
		</div>
	);
}
