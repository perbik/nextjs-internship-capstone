import { CheckCircle, Clock, Plus, TrendingUp, Users } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";

export default function DashboardPage() {
	return (
		<DashboardLayout>
			<div className="space-y-6">
				<div>
					<h1 className="text-3xl font-bold text-outer_space-500 dark:text-platinum-500">
						Dashboard
					</h1>
					<p className="text-paynes_gray-500 dark:text-french_gray-500 mt-2">
						Welcome back! Here's an overview of your projects and tasks.
					</p>
				</div>

				{/* Implementation Status Banner */}
				<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
					<div className="flex items-start">
						<div className="shrink-0">
							<div className="w-8 h-8 bg-blue_munsell-500 rounded-full flex items-center justify-center">
								<TrendingUp className="text-white" size={16} />
							</div>
						</div>
						<div className="ml-3">
							<h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
								Dashboard Implementation Tasks
							</h3>
							<div className="mt-2 text-sm text-blue-800 dark:text-blue-200">
								<ul className="list-disc list-inside space-y-1">
									<li>
										Task 4.2: Create project listing and dashboard interface
									</li>
									<li>
										Task 5.3: Set up client-side state management with Zustand
									</li>
									<li>
										Task 6.6: Optimize performance and implement loading states
									</li>
								</ul>
							</div>
						</div>
					</div>
				</div>

				{/* Stats Grid - Placeholder */}
				<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
					{[
						{
							name: "Active Projects",
							value: "12",
							icon: TrendingUp,
							change: "+2.5%",
						},
						{ name: "Team Members", value: "24", icon: Users, change: "+4.1%" },
						{
							name: "Completed Tasks",
							value: "156",
							icon: CheckCircle,
							change: "+12.3%",
						},
						{
							name: "Pending Tasks",
							value: "43",
							icon: Clock,
							change: "-2.1%",
						},
					].map((stat) => (
						<div
							key={stat.name}
							className="bg-white dark:bg-outer_space-500 overflow-hidden rounded-lg border border-french_gray-300 dark:border-paynes_gray-400 p-6"
						>
							<div className="flex items-center">
								<div className="shrink-0">
									<div className="w-8 h-8 bg-blue_munsell-100 dark:bg-blue_munsell-900 rounded-lg flex items-center justify-center">
										<stat.icon className="text-blue_munsell-500" size={20} />
									</div>
								</div>
								<div className="ml-5 w-0 flex-1">
									<dl>
										<dt className="text-sm font-medium text-paynes_gray-500 dark:text-french_gray-400 truncate">
											{stat.name}
										</dt>
										<dd className="flex items-baseline">
											<div className="text-2xl font-semibold text-outer_space-500 dark:text-platinum-500">
												{stat.value}
											</div>
											<div className="ml-2 flex items-baseline text-sm font-semibold text-green-600 dark:text-green-400">
												{stat.change}
											</div>
										</dd>
									</dl>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Recent Activity & Quick Actions */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Recent Projects */}
					<div className="bg-white dark:bg-outer_space-500 rounded-lg border border-french_gray-300 dark:border-paynes_gray-400 p-6">
						<h3 className="text-lg font-semibold text-outer_space-500 dark:text-platinum-500 mb-4">
							Recent Projects
						</h3>
						<div className="space-y-3">
							{[1, 2, 3].map((i) => (
								<div
									key={i}
									className="flex items-center justify-between p-3 bg-platinum-800 dark:bg-outer_space-400 rounded-lg"
								>
									<div>
										<div className="font-medium text-outer_space-500 dark:text-platinum-500">
											Project {i}
										</div>
										<div className="text-sm text-paynes_gray-500 dark:text-french_gray-400">
											Last updated 2 hours ago
										</div>
									</div>
									<div className="w-12 h-2 bg-french_gray-300 dark:bg-paynes_gray-400 rounded-full">
										<div className="w-8 h-2 bg-blue_munsell-500 rounded-full"></div>
									</div>
								</div>
							))}
						</div>
						<div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
							<p className="text-sm text-yellow-800 dark:text-yellow-200">
								📋 <strong>Task 4.1:</strong> Implement project CRUD operations
							</p>
						</div>
					</div>

					{/* Quick Actions */}
					<div className="bg-white dark:bg-outer_space-500 rounded-lg border border-french_gray-300 dark:border-paynes_gray-400 p-6">
						<h3 className="text-lg font-semibold text-outer_space-500 dark:text-platinum-500 mb-4">
							Quick Actions
						</h3>
						<div className="space-y-3">
							<button
								type="button"
								className="w-full flex items-center justify-center px-4 py-3 bg-blue_munsell-500 text-white rounded-lg hover:bg-blue_munsell-600 transition-colors"
							>
								<Plus size={20} className="mr-2" />
								Create New Project
							</button>
							<button
								type="button"
								className="w-full flex items-center justify-center px-4 py-3 border border-french_gray-300 dark:border-paynes_gray-400 text-outer_space-500 dark:text-platinum-500 rounded-lg hover:bg-platinum-500 dark:hover:bg-paynes_gray-400 transition-colors"
							>
								<Plus size={20} className="mr-2" />
								Add Team Member
							</button>
							<button
								type="button"
								className="w-full flex items-center justify-center px-4 py-3 border border-french_gray-300 dark:border-paynes_gray-400 text-outer_space-500 dark:text-platinum-500 rounded-lg hover:bg-platinum-500 dark:hover:bg-paynes_gray-400 transition-colors"
							>
								<Plus size={20} className="mr-2" />
								Create Task
							</button>
						</div>
						<div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
							<p className="text-sm text-yellow-800 dark:text-yellow-200">
								📋 <strong>Task 4.4:</strong> Build task creation and editing
								functionality
							</p>
						</div>
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
}
