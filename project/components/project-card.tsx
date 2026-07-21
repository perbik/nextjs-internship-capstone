// TODO: Task 4.5 - Design and implement project cards and layouts

/*
TODO: Implementation Notes for Interns:

This component should display:
- Project name and description
- Progress indicator
- Team member count
- Due date
- Status badge
- Actions menu (edit, delete, etc.)

Props interface:
interface ProjectCardProps {
  project: {
    id: string
    name: string
    description?: string
    progress: number
    memberCount: number
    dueDate?: Date
    status: 'active' | 'completed' | 'on-hold'
  }
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

Features to implement:
- Hover effects
- Click to navigate to project board
- Responsive design
- Loading states
- Error states
*/

export function ProjectCard() {
	return (
		<div className="bg-white dark:bg-outer_space-500 p-6 rounded-lg border border-french_gray-300 dark:border-paynes_gray-400">
			<p className="text-center text-paynes_gray-500 dark:text-french_gray-400">
				TODO: Implement ProjectCard component
			</p>
		</div>
	);
}
