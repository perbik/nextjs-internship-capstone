import { FeatureShowcase } from "@/components/landing/feature-showcase";
import { LandingHero } from "@/components/landing/landing-hero";
import { PublicHeader } from "@/components/landing/public-header";

export default function HomePage() {
	return (
		<div className="min-h-screen bg-card text-foreground dark:bg-background ">
			<PublicHeader />
			<main>
				<LandingHero />
				<FeatureShowcase />
			</main>
		</div>
	);
}
