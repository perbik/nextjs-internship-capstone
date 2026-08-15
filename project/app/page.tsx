import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { ArrowRight, CheckCircle, Kanban, Users } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

const highlights = [
	{
		title: "Flexible Kanban boards",
		description:
			"Create custom columns, reorder tasks, and keep every board synchronized.",
		icon: Kanban,
	},
	{
		title: "Team collaboration",
		description:
			"Assign work, manage project permissions, discuss tasks, and track activity.",
		icon: Users,
	},
	{
		title: "Clear progress tracking",
		description:
			"Use deadlines, priorities, labels, analytics, and calendar views to stay on track.",
		icon: CheckCircle,
	},
];

export default function HomePage() {
	return (
		<div className="min-h-screen bg-linear-to-br from-platinum-900 to-platinum-800 dark:from-outer_space-500 dark:to-paynes_gray-500">
			<header className="border-b border-french_gray-300 bg-white/80 backdrop-blur-sm dark:border-paynes_gray-400 dark:bg-outer_space-500/80">
				<div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
					<Link href="/" className="text-2xl font-bold text-blue_munsell-500">
						ProjectFlow
					</Link>
					<div className="flex items-center gap-4">
						<ThemeToggle />
						<Show when="signed-in">
							<Link
								href="/dashboard"
								className="text-outer_space-500 hover:text-blue_munsell-500 dark:text-platinum-500"
							>
								Dashboard
							</Link>
							<Link
								href="/projects"
								className="text-outer_space-500 hover:text-blue_munsell-500 dark:text-platinum-500"
							>
								Projects
							</Link>
							<UserButton />
						</Show>
						<Show when="signed-out">
							<SignInButton mode="redirect">
								<button
									type="button"
									className="text-outer_space-500 hover:text-blue_munsell-500 dark:text-platinum-500"
								>
									Sign in
								</button>
							</SignInButton>
							<SignUpButton mode="redirect">
								<button
									type="button"
									className="rounded-lg bg-blue_munsell-500 px-4 py-2 text-white hover:bg-blue_munsell-600"
								>
									Get started
								</button>
							</SignUpButton>
						</Show>
					</div>
				</div>
			</header>

			<main>
				<section className="px-4 py-20 sm:px-6 lg:px-8">
					<div className="container mx-auto max-w-4xl text-center">
						<p className="mb-4 text-sm font-semibold uppercase tracking-wider text-blue_munsell-600 dark:text-blue_munsell-300">
							Project management without the clutter
						</p>
						<h1 className="text-5xl font-bold text-outer_space-500 md:text-6xl dark:text-platinum-500">
							Plan, collaborate, and deliver with{" "}
							<span className="text-blue_munsell-500">ProjectFlow</span>
						</h1>
						<p className="mx-auto mt-6 max-w-2xl text-xl text-paynes_gray-500 dark:text-french_gray-400">
							Organize projects with flexible Kanban boards, keep your team
							aligned, and turn task activity into visible progress.
						</p>

						<div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
							<Show when="signed-in">
								<Link
									href="/dashboard"
									className="inline-flex items-center justify-center rounded-lg bg-blue_munsell-500 px-8 py-4 text-lg font-semibold text-white hover:bg-blue_munsell-600"
								>
									Open dashboard
									<ArrowRight className="ml-2" size={20} />
								</Link>
							</Show>
							<Show when="signed-out">
								<SignUpButton mode="redirect">
									<button
										type="button"
										className="inline-flex items-center justify-center rounded-lg bg-blue_munsell-500 px-8 py-4 text-lg font-semibold text-white hover:bg-blue_munsell-600"
									>
										Create your workspace
										<ArrowRight className="ml-2" size={20} />
									</button>
								</SignUpButton>
								<SignInButton mode="redirect">
									<button
										type="button"
										className="rounded-lg border-2 border-blue_munsell-500 px-8 py-4 text-lg font-semibold text-blue_munsell-600 hover:bg-blue_munsell-50 dark:text-blue_munsell-300 dark:hover:bg-blue_munsell-900/30"
									>
										Sign in
									</button>
								</SignInButton>
							</Show>
						</div>
					</div>
				</section>

				<section className="bg-white/55 px-4 py-16 sm:px-6 lg:px-8 dark:bg-outer_space-400/50">
					<div className="container mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
						{highlights.map((highlight) => (
							<article
								key={highlight.title}
								className="rounded-xl border border-french_gray-300 bg-white p-6 dark:border-paynes_gray-400 dark:bg-outer_space-500"
							>
								<div className="flex size-11 items-center justify-center rounded-lg bg-blue_munsell-100 text-blue_munsell-700 dark:bg-blue_munsell-900 dark:text-blue_munsell-300">
									<highlight.icon size={22} />
								</div>
								<h2 className="mt-4 text-lg font-semibold text-outer_space-500 dark:text-platinum-500">
									{highlight.title}
								</h2>
								<p className="mt-2 text-sm leading-6 text-paynes_gray-500 dark:text-french_gray-400">
									{highlight.description}
								</p>
							</article>
						))}
					</div>
				</section>
			</main>
		</div>
	);
}
