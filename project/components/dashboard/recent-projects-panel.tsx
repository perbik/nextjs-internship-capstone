"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ProjectCard } from "@/components/project/card";
import { Button } from "@/components/ui/button";
import type { ProjectSummary } from "@/lib/db/queries";

interface RecentProjectsPanelProps {
	projects: ProjectSummary[];
}

export function RecentProjectsPanel({ projects }: RecentProjectsPanelProps) {
	const [activeIndex, setActiveIndex] = useState(0);
	const visibleIndex = Math.min(activeIndex, Math.max(projects.length - 1, 0));
	const project = projects[visibleIndex];
	const hasMultiple = projects.length > 1;

	function move(direction: -1 | 1) {
		// Wrap navigation at either end of the recent-project list
		setActiveIndex(
			(visibleIndex + direction + projects.length) % projects.length,
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
					<Button
						type="button"
						variant="ghost"
						size="icon"
						aria-label="Previous recent project"
						disabled={!hasMultiple}
						onClick={() => move(-1)}
						className="size-8 rounded-full bg-control-muted text-muted-foreground hover:bg-brand-light hover:text-brand disabled:opacity-40"
					>
						<ChevronLeft size={14} />
					</Button>

					<fieldset className="flex items-center gap-1.5">
						<legend className="sr-only">
							Choose a recent project. Project {visibleIndex + 1} of{" "}
							{projects.length} is currently shown.
						</legend>
						{projects.map(({ project: item }, index) => (
							<button
								type="button"
								key={item.id}
								aria-label={`Show ${item.name}`}
								aria-pressed={index === visibleIndex}
								onClick={() => setActiveIndex(index)}
								className={`h-1.5 rounded-full ${index === visibleIndex ? "w-4 bg-brand" : "w-1.5 bg-black/15 dark:bg-white/35"}`}
							/>
						))}
					</fieldset>

					<Button
						type="button"
						variant="ghost"
						size="icon"
						aria-label="Next recent project"
						disabled={!hasMultiple}
						onClick={() => move(1)}
						className="size-8 rounded-full bg-control-muted text-muted-foreground hover:bg-brand-light hover:text-brand disabled:opacity-40"
					>
						<ChevronRight size={14} />
					</Button>
				</div>
			)}
		</section>
	);
}
