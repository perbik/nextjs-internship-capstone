import { Mail, MoreHorizontal, UserPlus } from "lucide-react";

export default function TeamPage() {
	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold text-outer_space-500 dark:text-platinum-500">
						Team
					</h1>
					<p className="text-paynes_gray-500 dark:text-french_gray-500 mt-2">
						Manage team members and permissions
					</p>
				</div>
				<button
					type="button"
					className="inline-flex items-center px-4 py-2 bg-blue_munsell-500 text-white rounded-lg hover:bg-blue_munsell-600 transition-colors"
				>
					<UserPlus size={20} className="mr-2" />
					Invite Member
				</button>
			</div>

			{/* Implementation Tasks Banner */}
			<div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
				<h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
					📋 Team Management Implementation Tasks
				</h3>
				<ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
					<li>
						• Task 6.1: Implement task assignment and user collaboration
						features
					</li>
					<li>
						• Task 6.4: Implement project member management and permissions
					</li>
				</ul>
			</div>

			{/* Team Members Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{[
					{
						name: "John Doe",
						role: "Project Manager",
						email: "john@example.com",
						avatar: "JD",
					},
					{
						name: "Jane Smith",
						role: "Developer",
						email: "jane@example.com",
						avatar: "JS",
					},
					{
						name: "Mike Johnson",
						role: "Designer",
						email: "mike@example.com",
						avatar: "MJ",
					},
					{
						name: "Sarah Wilson",
						role: "Developer",
						email: "sarah@example.com",
						avatar: "SW",
					},
					{
						name: "Tom Brown",
						role: "QA Engineer",
						email: "tom@example.com",
						avatar: "TB",
					},
					{
						name: "Lisa Davis",
						role: "Designer",
						email: "lisa@example.com",
						avatar: "LD",
					},
				].map((member) => (
					<div
						key={member.email}
						className="bg-white dark:bg-outer_space-500 rounded-lg border border-french_gray-300 dark:border-paynes_gray-400 p-6"
					>
						<div className="flex items-start justify-between mb-4">
							<div className="flex items-center space-x-3">
								<div className="w-12 h-12 bg-blue_munsell-500 rounded-full flex items-center justify-center text-white font-semibold">
									{member.avatar}
								</div>
								<div>
									<h3 className="font-semibold text-outer_space-500 dark:text-platinum-500">
										{member.name}
									</h3>
									<p className="text-sm text-paynes_gray-500 dark:text-french_gray-400">
										{member.role}
									</p>
								</div>
							</div>
							<button
								type="button"
								aria-label={`More actions for ${member.name}`}
								className="p-1 hover:bg-platinum-500 dark:hover:bg-paynes_gray-400 rounded"
							>
								<MoreHorizontal size={16} />
							</button>
						</div>

						<div className="flex items-center text-sm text-paynes_gray-500 dark:text-french_gray-400 mb-4">
							<Mail size={16} className="mr-2" />
							{member.email}
						</div>

						<div className="flex items-center justify-between">
							<span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
								Active
							</span>
							<div className="text-sm text-paynes_gray-500 dark:text-french_gray-400">
								{Math.floor(Math.random() * 10) + 1} projects
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
