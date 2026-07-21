// TODO: Task 4.1 - Implement project CRUD operations
// TODO: Task 4.4 - Build task creation and editing functionality

/*
TODO: Implementation Notes for Interns:

Modal for creating new projects with form validation.

Features to implement:
- Form with project name, description, due date
- Zod validation
- Error handling
- Loading states
- Success feedback
- Team member assignment
- Project template selection

Form fields:
- Name (required)
- Description (optional)
- Due date (optional)
- Team members (optional)
- Project template (optional)
- Privacy settings

Integration:
- Use project validation schema from lib/validations.ts
- Call project creation API
- Update project list optimistically
- Handle errors gracefully
*/

export function CreateProjectModal() {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
			<div className="bg-white dark:bg-outer_space-500 rounded-lg p-6 w-full max-w-md mx-4">
				<h3 className="text-lg font-semibold text-outer_space-500 dark:text-platinum-500 mb-4">
					TODO: Create Project Modal
				</h3>
				<div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded border border-yellow-200 dark:border-yellow-800">
					<p className="text-sm text-yellow-800 dark:text-yellow-200">
						📋 Implement project creation form with validation
					</p>
				</div>
			</div>
		</div>
	);
}
