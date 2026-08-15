import { Show, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LandingHero() {
	return (
		<section className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-7xl items-center px-4 py-16 sm:min-h-[calc(100dvh-4rem)] sm:px-8">
			<div className="max-w-3xl">
				<h1 className="font-display text-5xl font-extrabold leading-none tracking-tight sm:text-6xl lg:text-7xl">
					Brix
				</h1>
				<p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
					Bring structure to every project. Organize tasks, collaborate with
					your team, and keep progress moving with intuitive drag-and-drop
					Kanban boards.
				</p>
				<div className="mt-8 flex flex-col gap-3 sm:flex-row">
					<Show when="signed-in">
						<Button asChild className="h-12 rounded-full px-6">
							<Link href="/dashboard">Start Managing Projects</Link>
						</Button>
					</Show>
					<Show when="signed-out">
						<SignUpButton mode="redirect">
							<Button type="button" className="h-12 rounded-full px-6">
								Start Managing Projects
							</Button>
						</SignUpButton>
					</Show>
					<Button asChild variant="outline" className="h-12 rounded-full px-6">
						<a href="#features">See how it works</a>
					</Button>
				</div>
			</div>
		</section>
	);
}
