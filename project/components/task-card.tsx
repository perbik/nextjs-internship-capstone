// TODO: Task 5.6 - Create task detail modals and editing interfaces

/*
TODO: Implementation Notes for Interns:

This component should display:
- Task title and description
- Priority indicator
- Assignee avatar
- Due date
- Labels/tags
- Comments count
- Drag handle for reordering

Props interface:
interface TaskCardProps {
  task: {
    id: string
    title: string
    description?: string
    priority: 'low' | 'medium' | 'high'
    assignee?: User
    dueDate?: Date
    labels: string[]
    commentsCount: number
  }
  isDragging?: boolean
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

Features to implement:
- Drag and drop support
- Click to open task modal
- Priority color coding
- Overdue indicators
- Responsive design
*/

export function TaskCard() {
	return (
		<div className="bg-white dark:bg-outer_space-300 p-4 rounded-lg border border-french_gray-300 dark:border-paynes_gray-400">
			<p className="text-center text-paynes_gray-500 dark:text-french_gray-400 text-sm">
				TODO: Implement TaskCard component
			</p>
		</div>
	);
}
