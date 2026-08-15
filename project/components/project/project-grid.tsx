import { ProjectCard } from "@/components/project/card";
import type { ProjectSummary } from "@/lib/db/queries";

interface ProjectGridProps {
	projects: ProjectSummary[];
}

export function ProjectGrid({ projects }: ProjectGridProps) {
	return (
		<div className="grid grid-cols-1 items-stretch gap-3 md:grid-cols-2 lg:grid-cols-3">
			{projects.map((project) => (
				<ProjectCard key={project.project.id} summary={project} />
			))}
		</div>
	);
}
