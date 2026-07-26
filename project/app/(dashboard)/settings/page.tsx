import { SettingsContent } from "@/components/settings-content";

export default function SettingsPage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold text-outer_space-500 dark:text-platinum-500">
					Settings
				</h1>
				<p className="mt-2 text-paynes_gray-500 dark:text-french_gray-500">
					Manage your ProjectFlow account, security, and appearance.
				</p>
			</div>
			<SettingsContent />
		</div>
	);
}
