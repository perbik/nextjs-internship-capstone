import { BarChart3, Calendar, Kanban, Shield, Users, Zap } from "lucide-react";

const features = [
	{
		icon: Kanban,
		title: "Kanban Boards",
		description:
			"Visualize your workflow with intuitive drag-and-drop Kanban boards that keep your team organized.",
	},
	{
		icon: Users,
		title: "Team Collaboration",
		description:
			"Work together seamlessly with real-time updates, comments, and task assignments.",
	},
	{
		icon: Calendar,
		title: "Timeline Management",
		description:
			"Track deadlines and milestones with integrated calendar views and due date reminders.",
	},
	{
		icon: BarChart3,
		title: "Progress Analytics",
		description:
			"Monitor project progress with detailed analytics and performance insights.",
	},
	{
		icon: Shield,
		title: "Secure & Private",
		description:
			"Enterprise-grade security ensures your project data stays safe and confidential.",
	},
	{
		icon: Zap,
		title: "Lightning Fast",
		description:
			"Optimized performance delivers instant updates and smooth user experience.",
	},
];

export function Features() {
	return (
		<section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
			<div className="container mx-auto">
				<div className="text-center mb-16">
					<h2 className="text-4xl font-bold text-outer_space-500 dark:text-platinum-500 mb-4">
						Everything You Need to Succeed
					</h2>
					<p className="text-xl text-paynes_gray-500 dark:text-french_gray-500 max-w-2xl mx-auto">
						Powerful features designed to help teams collaborate effectively and
						deliver projects on time.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{features.map((feature) => (
						<div
							key={feature.title}
							className="p-6 bg-white dark:bg-outer_space-400 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-french_gray-300 dark:border-paynes_gray-400"
						>
							<div className="w-12 h-12 bg-blue_munsell-100 dark:bg-blue_munsell-900 rounded-lg flex items-center justify-center mb-4">
								<feature.icon className="text-blue_munsell-500" size={24} />
							</div>
							<h3 className="text-xl font-semibold text-outer_space-500 dark:text-platinum-500 mb-2">
								{feature.title}
							</h3>
							<p className="text-paynes_gray-500 dark:text-french_gray-500">
								{feature.description}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
