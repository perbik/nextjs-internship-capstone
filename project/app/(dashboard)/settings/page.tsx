import { Bell, Palette, Shield, User } from "lucide-react";

export default function SettingsPage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold text-outer_space-500 dark:text-platinum-500">
					Settings
				</h1>
				<p className="text-paynes_gray-500 dark:text-french_gray-500 mt-2">
					Manage your account and application preferences
				</p>
			</div>

			{/* Implementation Tasks Banner */}
			<div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
				<h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
					⚙️ Settings Implementation Tasks
				</h3>
				<ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
					<li>• Task 2.4: Implement user session management</li>
					<li>
						• Task 6.4: Implement project member management and permissions
					</li>
				</ul>
			</div>

			{/* Settings Sections */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Settings Navigation */}
				<div className="bg-white dark:bg-outer_space-500 rounded-lg border border-french_gray-300 dark:border-paynes_gray-400 p-6">
					<h3 className="text-lg font-semibold text-outer_space-500 dark:text-platinum-500 mb-4">
						Settings
					</h3>
					<nav className="space-y-2">
						{[
							{ name: "Profile", icon: User, active: true },
							{ name: "Notifications", icon: Bell, active: false },
							{ name: "Security", icon: Shield, active: false },
							{ name: "Appearance", icon: Palette, active: false },
						].map((item) => (
							<button
								type="button"
								key={item.name}
								className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
									item.active
										? "bg-blue_munsell-100 dark:bg-blue_munsell-900 text-blue_munsell-700 dark:text-blue_munsell-300"
										: "text-outer_space-500 dark:text-platinum-500 hover:bg-platinum-500 dark:hover:bg-paynes_gray-400"
								}`}
							>
								<item.icon className="mr-3" size={16} />
								{item.name}
							</button>
						))}
					</nav>
				</div>

				{/* Settings Content */}
				<div className="lg:col-span-2 bg-white dark:bg-outer_space-500 rounded-lg border border-french_gray-300 dark:border-paynes_gray-400 p-6">
					<h3 className="text-lg font-semibold text-outer_space-500 dark:text-platinum-500 mb-6">
						Profile Settings
					</h3>

					<div className="space-y-6">
						<div>
							<label
								htmlFor="full-name"
								className="block text-sm font-medium text-outer_space-500 dark:text-platinum-500 mb-2"
							>
								Full Name
							</label>
							<input
								id="full-name"
								type="text"
								defaultValue="John Doe"
								className="w-full px-3 py-2 border border-french_gray-300 dark:border-paynes_gray-400 rounded-lg bg-white dark:bg-outer_space-400 text-outer_space-500 dark:text-platinum-500 focus:outline-none focus:ring-2 focus:ring-blue_munsell-500"
							/>
						</div>

						<div>
							<label
								htmlFor="email-address"
								className="block text-sm font-medium text-outer_space-500 dark:text-platinum-500 mb-2"
							>
								Email Address
							</label>
							<input
								id="email-address"
								type="email"
								defaultValue="john@example.com"
								className="w-full px-3 py-2 border border-french_gray-300 dark:border-paynes_gray-400 rounded-lg bg-white dark:bg-outer_space-400 text-outer_space-500 dark:text-platinum-500 focus:outline-none focus:ring-2 focus:ring-blue_munsell-500"
							/>
						</div>

						<div>
							<label
								htmlFor="role"
								className="block text-sm font-medium text-outer_space-500 dark:text-platinum-500 mb-2"
							>
								Role
							</label>
							<select
								id="role"
								className="w-full px-3 py-2 border border-french_gray-300 dark:border-paynes_gray-400 rounded-lg bg-white dark:bg-outer_space-400 text-outer_space-500 dark:text-platinum-500 focus:outline-none focus:ring-2 focus:ring-blue_munsell-500"
							>
								<option>Project Manager</option>
								<option>Developer</option>
								<option>Designer</option>
								<option>QA Engineer</option>
							</select>
						</div>

						<div className="flex justify-end space-x-3 pt-4">
							<button
								type="button"
								className="px-4 py-2 text-paynes_gray-500 dark:text-french_gray-400 hover:bg-platinum-500 dark:hover:bg-paynes_gray-400 rounded-lg transition-colors"
							>
								Cancel
							</button>
							<button
								type="button"
								className="px-4 py-2 bg-blue_munsell-500 text-white rounded-lg hover:bg-blue_munsell-600 transition-colors"
							>
								Save Changes
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
