import { ArrowRight, CheckCircle, Users, Zap } from "lucide-react";
import Link from "next/link";

export function Hero() {
	return (
		<section className="py-20 px-4 sm:px-6 lg:px-8">
			<div className="container mx-auto text-center">
				<div className="max-w-4xl mx-auto">
					<h1 className="text-5xl md:text-6xl font-bold text-outer_space-500 dark:text-platinum-500 mb-6">
						Streamline Your
						<span className="text-blue_munsell-500"> Project Management</span>
					</h1>

					<p className="text-xl text-paynes_gray-500 dark:text-french_gray-500 mb-8 max-w-2xl mx-auto">
						Organize tasks, collaborate with your team, and deliver projects on
						time with our intuitive Kanban-style project management platform.
					</p>

					<div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
						<Link
							href="/dashboard"
							className="inline-flex items-center px-8 py-4 bg-blue_munsell-500 text-white rounded-lg hover:bg-blue_munsell-600 transition-colors text-lg font-semibold"
						>
							Start Free Trial
							<ArrowRight className="ml-2" size={20} />
						</Link>

						<button
							type="button"
							className="inline-flex items-center px-8 py-4 border-2 border-blue_munsell-500 text-blue_munsell-500 rounded-lg hover:bg-blue_munsell-50 dark:hover:bg-blue_munsell-900 transition-colors text-lg font-semibold"
						>
							Watch Demo
						</button>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
						<div className="flex items-center justify-center space-x-2 text-outer_space-500 dark:text-platinum-500">
							<CheckCircle className="text-blue_munsell-500" size={20} />
							<span>No Credit Card Required</span>
						</div>
						<div className="flex items-center justify-center space-x-2 text-outer_space-500 dark:text-platinum-500">
							<Users className="text-blue_munsell-500" size={20} />
							<span>Team Collaboration</span>
						</div>
						<div className="flex items-center justify-center space-x-2 text-outer_space-500 dark:text-platinum-500">
							<Zap className="text-blue_munsell-500" size={20} />
							<span>Real-time Updates</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
