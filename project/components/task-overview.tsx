import { AlertCircle, CheckCircle, Clock, Users } from "lucide-react";

const taskStats = [
	{
		label: "Completed",
		count: 24,
		icon: CheckCircle,
		color: "text-green-500",
		bgColor: "bg-green-100 dark:bg-green-900",
	},
	{
		label: "In Progress",
		count: 18,
		icon: Clock,
		color: "text-blue_munsell-500",
		bgColor: "bg-blue_munsell-100 dark:bg-blue_munsell-900",
	},
	{
		label: "Overdue",
		count: 3,
		icon: AlertCircle,
		color: "text-red-500",
		bgColor: "bg-red-100 dark:bg-red-900",
	},
	{
		label: "Assigned to Me",
		count: 12,
		icon: Users,
		color: "text-purple-500",
		bgColor: "bg-purple-100 dark:bg-purple-900",
	},
];

export function TaskOverview() {
	return (
		<div className="bg-white dark:bg-outer_space-500 rounded-lg border border-french_gray-300 dark:border-paynes_gray-400 p-6">
			<h3 className="text-lg font-semibold text-outer_space-500 dark:text-platinum-500 mb-6">
				Task Overview
			</h3>

			<div className="space-y-4">
				{taskStats.map((stat) => (
					<div
						key={stat.label}
						className="flex items-center justify-between p-3 rounded-lg border border-french_gray-300 dark:border-paynes_gray-400"
					>
						<div className="flex items-center space-x-3">
							<div
								className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}
							>
								<stat.icon className={stat.color} size={20} />
							</div>
							<span className="font-medium text-outer_space-500 dark:text-platinum-500">
								{stat.label}
							</span>
						</div>
						<span className="text-2xl font-bold text-outer_space-500 dark:text-platinum-500">
							{stat.count}
						</span>
					</div>
				))}
			</div>

			<div className="mt-6 pt-4 border-t border-french_gray-300 dark:border-paynes_gray-400">
				<div className="text-sm text-paynes_gray-500 dark:text-french_gray-400">
					<span className="font-medium">Productivity:</span> 89% completion rate
					this week
				</div>
			</div>
		</div>
	);
}
