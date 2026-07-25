import { ProjectCard } from "@/components/project-card";
import type { ProjectSummary } from "@/lib/db/queries";

interface ProjectGridProps {
	projects: ProjectSummary[];
}

export function ProjectGrid({ projects }: ProjectGridProps) {
	return (
		<div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
			{projects.map((project) => (
				<ProjectCard key={project.project.id} summary={project} />
			))}
		</div>
	);
}
