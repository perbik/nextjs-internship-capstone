import { Calendar, MoreHorizontal, Settings, Users } from "lucide-react";

export function ProjectHeader() {
	return (
		<div className="bg-white dark:bg-outer_space-500 rounded-lg border border-french_gray-300 dark:border-paynes_gray-400 p-6">
			<div className="flex items-start justify-between">
				<div className="flex-1">
					<div className="flex items-center space-x-3 mb-2">
						<div className="w-3 h-3 bg-blue_munsell-500 rounded-full" />
						<h1 className="text-2xl font-bold text-outer_space-500 dark:text-platinum-500">
							Website Redesign
						</h1>
					</div>

					<p className="text-paynes_gray-500 dark:text-french_gray-400 mb-4">
						Complete overhaul of company website with modern design and improved
						user experience
					</p>

					<div className="flex items-center space-x-6 text-sm text-paynes_gray-500 dark:text-french_gray-400">
						<div className="flex items-center">
							<Users size={16} className="mr-2" />5 members
						</div>
						<div className="flex items-center">
							<Calendar size={16} className="mr-2" />
							Due Feb 15, 2024
						</div>
						<div className="flex items-center">
							<div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
							75% complete
						</div>
					</div>
				</div>

				<div className="flex items-center space-x-2">
					<button
						type="button"
						aria-label="Project settings"
						className="p-2 hover:bg-platinum-500 dark:hover:bg-paynes_gray-400 rounded-lg transition-colors"
					>
						<Settings size={20} />
					</button>
					<button
						type="button"
						aria-label="More project actions"
						className="p-2 hover:bg-platinum-500 dark:hover:bg-paynes_gray-400 rounded-lg transition-colors"
					>
						<MoreHorizontal size={20} />
					</button>
				</div>
			</div>
		</div>
	);
}
