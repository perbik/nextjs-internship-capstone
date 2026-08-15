import { UserProfile } from "@clerk/nextjs";

export function SettingsContent() {
	return (
		<section
			className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card shadow-[0_1px_6px_rgba(0,0,0,0.06)]"
			aria-label="Account settings"
		>
			{/* Keep Clerk sections inside the single embedded settings route */}
			<UserProfile
				routing="hash"
				appearance={{
					elements: {
						rootBox: "!w-full min-w-0",
						cardBox:
							"h-auto min-h-0 !w-full !max-w-none shadow-none md:max-h-[34rem]",
						card: "h-auto min-h-0 !w-full !max-w-none rounded-none border-0 shadow-none",
						scrollBox:
							"h-auto min-h-0 !w-full flex-1 md:max-h-[34rem] md:overflow-hidden",
						navbar: "border-border bg-muted",
						navbarButton:
							"rounded-xl text-muted-foreground hover:bg-card hover:text-foreground data-[active=true]:bg-brand-light data-[active=true]:text-brand",
						pageScrollBox:
							"h-auto min-h-0 !w-full flex-1 bg-card md:max-h-[34rem] md:overflow-y-auto",
						profileSection: "border-border",
						profileSectionTitleText: "text-foreground",
						profileSectionContent: "text-foreground",
						formFieldInput:
							"border-input bg-background text-foreground focus:border-ring",
						formButtonPrimary:
							"bg-primary text-primary-foreground hover:bg-primary/90",
					},
				}}
			/>
		</section>
	);
}
