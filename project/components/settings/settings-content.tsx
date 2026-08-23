import { UserProfile } from "@clerk/nextjs";

export function SettingsContent() {
	return (
		<section
			className="min-w-0 max-w-full overflow-hidden rounded-2xl border border-border bg-card shadow-[0_1px_6px_rgba(0,0,0,0.06)]"
			aria-label="Account settings"
		>
			{/* Keep Clerk sections inside the single embedded settings route */}
			<UserProfile
				routing="hash"
				appearance={{
					elements: {
						rootBox: "!w-full min-w-0 !max-w-full overflow-hidden",
						cardBox:
							"h-auto min-h-0 !w-full !max-w-full overflow-hidden shadow-none md:max-h-[34rem]",
						card: "h-auto min-h-0 !w-full !max-w-full overflow-hidden rounded-none border-0 shadow-none",
						scrollBox:
							"h-auto min-h-0 !w-full min-w-0 flex-1 overflow-x-hidden md:max-h-[34rem] md:overflow-hidden",
						navbar: "border-border bg-muted",
						navbarButton:
							"rounded-xl text-muted-foreground hover:bg-card hover:text-foreground data-[active=true]:bg-brand-light data-[active=true]:text-brand",
						pageScrollBox:
							"h-auto min-h-0 !w-full min-w-0 flex-1 overflow-x-hidden bg-card px-0 md:max-h-[34rem] md:overflow-y-auto",
						profileSection: "min-w-0 border-border px-4 sm:px-6",
						profileSectionTitleText: "text-foreground",
						profileSectionContent: "min-w-0 max-w-full text-foreground",
						profileSectionItem: "min-w-0 max-w-full gap-2",
						profileSectionItemList: "min-w-0 max-w-full",
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
