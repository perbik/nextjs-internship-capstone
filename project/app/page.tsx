import { CoreFeatures } from "@/components/landing/core-features";
import { FeatureShowcase } from "@/components/landing/feature-showcase";
import { LandingHero } from "@/components/landing/landing-hero";
import { PublicHeader } from "@/components/landing/public-header";

export default function HomePage() {
	return (
		<div className="min-h-screen bg-card text-foreground">
			<PublicHeader />
			<main>
				<LandingHero />
				<CoreFeatures />
				<FeatureShowcase />
			</main>
		</div>
	);
}
