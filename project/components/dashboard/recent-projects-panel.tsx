"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ProjectCard } from "@/components/project/card";
import type { ProjectSummary } from "@/lib/db/queries";

export function RecentProjectsPanel({
	projects,
}: {
	projects: ProjectSummary[];
}) {
	const [activeIndex, setActiveIndex] = useState(0);
	const project = projects[activeIndex];
	const hasMultiple = projects.length > 1;

	function move(direction: -1 | 1) {
		setActiveIndex(
			(current) => (current + direction + projects.length) % projects.length,
		);
	}

	return (
		<section className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_1px_8px_rgba(0,0,0,.06)]">
			<header className="flex items-center justify-between border-b border-border px-6 py-4">
				<h2 className="font-display text-lg font-extrabold leading-7">
					Recent Projects
				</h2>
				<Link
					href="/projects"
					className="text-xs font-semibold text-brand hover:underline"
				>
					View All
				</Link>
			</header>

			<div className="px-4 pb-2 pt-4">
				{project ? (
					<ProjectCard summary={project} variant="dashboard" />
				) : (
					<div className="flex min-h-59.25 items-center justify-center rounded-[20px] border border-dashed border-input px-6 text-center text-sm text-muted-foreground">
						No projects to show yet.
					</div>
				)}
			</div>

			{project && (
				<div className="flex items-center justify-between px-5 py-3">
					<button
						type="button"
						aria-label="Previous recent project"
						disabled={!hasMultiple}
						onClick={() => move(-1)}
						className="flex size-8 items-center justify-center rounded-full bg-control-muted text-muted-foreground hover:bg-brand-light hover:text-brand disabled:opacity-40  dark:text-muted-foreground"
					>
						<ChevronLeft size={14} />
					</button>

					<fieldset className="flex items-center gap-1.5">
						<legend className="sr-only">
							Project {activeIndex + 1} of {projects.length}
						</legend>
						{projects.map(({ project: item }, index) => (
							<button
								type="button"
								key={item.id}
								aria-label={`Show ${item.name}`}
								onClick={() => setActiveIndex(index)}
								className={`h-1.5 rounded-full ${index === activeIndex ? "w-4 bg-brand" : "w-1.5 bg-black/15 dark:bg-white/35"}`}
							/>
						))}
					</fieldset>

					<button
						type="button"
						aria-label="Next recent project"
						disabled={!hasMultiple}
						onClick={() => move(1)}
						className="flex size-8 items-center justify-center rounded-full bg-control-muted text-muted-foreground hover:bg-brand-light hover:text-brand disabled:opacity-40  dark:text-muted-foreground"
					>
						<ChevronRight size={14} />
					</button>
				</div>
			)}
		</section>
	);
}
