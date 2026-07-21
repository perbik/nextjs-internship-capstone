import { BarChart3, Clock, TrendingUp, Users } from "lucide-react";

export default function AnalyticsPage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold text-outer_space-500 dark:text-platinum-500">
					Analytics
				</h1>
				<p className="text-paynes_gray-500 dark:text-french_gray-500 mt-2">
					Track project performance and team productivity
				</p>
			</div>

			{/* Implementation Tasks Banner */}
			<div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
				<h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
					📊 Analytics Implementation Tasks
				</h3>
				<ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
					<li>• Task 6.6: Optimize performance and implement loading states</li>
					<li>• Task 8.5: Set up performance monitoring and analytics</li>
				</ul>
			</div>

			{/* Analytics Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{[
					{
						title: "Project Velocity",
						value: "8.5",
						unit: "tasks/week",
						icon: TrendingUp,
						color: "blue",
					},
					{
						title: "Team Efficiency",
						value: "92%",
						unit: "completion rate",
						icon: BarChart3,
						color: "green",
					},
					{
						title: "Active Users",
						value: "24",
						unit: "this week",
						icon: Users,
						color: "purple",
					},
					{
						title: "Avg. Task Time",
						value: "2.3",
						unit: "days",
						icon: Clock,
						color: "orange",
					},
				].map((metric) => (
					<div
						key={metric.title}
						className="bg-white dark:bg-outer_space-500 rounded-lg border border-french_gray-300 dark:border-paynes_gray-400 p-6"
					>
						<div className="flex items-center justify-between mb-4">
							<div
								className={`w-10 h-10 bg-${metric.color}-100 dark:bg-${metric.color}-900 rounded-lg flex items-center justify-center`}
							>
								<metric.icon className={`text-${metric.color}-500`} size={20} />
							</div>
						</div>
						<div className="text-2xl font-bold text-outer_space-500 dark:text-platinum-500 mb-1">
							{metric.value}
						</div>
						<div className="text-sm text-paynes_gray-500 dark:text-french_gray-400 mb-2">
							{metric.unit}
						</div>
						<div className="text-xs font-medium text-outer_space-500 dark:text-platinum-500">
							{metric.title}
						</div>
					</div>
				))}
			</div>

			{/* Charts Placeholder */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div className="bg-white dark:bg-outer_space-500 rounded-lg border border-french_gray-300 dark:border-paynes_gray-400 p-6">
					<h3 className="text-lg font-semibold text-outer_space-500 dark:text-platinum-500 mb-4">
						Project Progress
					</h3>
					<div className="h-64 bg-platinum-800 dark:bg-outer_space-400 rounded-lg flex items-center justify-center">
						<div className="text-center text-paynes_gray-500 dark:text-french_gray-400">
							<BarChart3 size={48} className="mx-auto mb-2" />
							<p>Chart Component Placeholder</p>
							<p className="text-sm">
								TODO: Implement with Chart.js or Recharts
							</p>
						</div>
					</div>
				</div>

				<div className="bg-white dark:bg-outer_space-500 rounded-lg border border-french_gray-300 dark:border-paynes_gray-400 p-6">
					<h3 className="text-lg font-semibold text-outer_space-500 dark:text-platinum-500 mb-4">
						Team Activity
					</h3>
					<div className="h-64 bg-platinum-800 dark:bg-outer_space-400 rounded-lg flex items-center justify-center">
						<div className="text-center text-paynes_gray-500 dark:text-french_gray-400">
							<TrendingUp size={48} className="mx-auto mb-2" />
							<p>Activity Chart Placeholder</p>
							<p className="text-sm">TODO: Implement activity timeline</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
