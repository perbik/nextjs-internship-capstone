import { SettingsContent } from "@/components/settings/settings-content";

export default function SettingsPage() {
	return (
		<div className="w-full space-y-5">
			<header>
				<h1 className="font-display text-3xl font-extrabold tracking-[-0.03em] text-foreground sm:text-4xl">
					Account &amp; security
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Update your profile, sign-in methods, and active sessions.
				</p>
			</header>
			<SettingsContent />
		</div>
	);
}
