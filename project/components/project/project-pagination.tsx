import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import type { ProjectFilters } from "@/lib/validations";

interface ProjectPaginationProps {
	filters: ProjectFilters;
	page: number;
	totalPages: number;
}

function projectPageHref(page: number, filters: ProjectFilters) {
	const params = new URLSearchParams();
	if (filters.q) params.set("q", filters.q);
	if (filters.status) params.set("status", filters.status);
	if (filters.role) params.set("role", filters.role);
	if (page > 1) params.set("page", String(page));

	const query = params.toString();
	return query ? `/projects?${query}` : "/projects";
}

function visiblePages(page: number, totalPages: number) {
	if (totalPages <= 7) {
		return Array.from({ length: totalPages }, (_, index) => index + 1);
	}

	const pages: Array<number | "start" | "end"> = [1];
	if (page > 3) pages.push("start");
	for (
		let value = Math.max(2, page - 1);
		value <= Math.min(totalPages - 1, page + 1);
		value++
	) {
		pages.push(value);
	}
	if (page < totalPages - 2) pages.push("end");
	pages.push(totalPages);
	return pages;
}

export function ProjectPagination({
	filters,
	page,
	totalPages,
}: ProjectPaginationProps) {
	if (totalPages <= 1) return null;

	return (
		<Pagination className="m-0 w-auto justify-end">
			<PaginationContent>
				<PaginationItem>
					<PaginationPrevious
						href={projectPageHref(page - 1, filters)}
						disabled={page === 1}
						size="sm"
						className="h-8 px-2 text-xs hover:bg-transparent hover:text-primary"
					/>
				</PaginationItem>
				{visiblePages(page, totalPages).map((item) =>
					typeof item === "number" ? (
						<PaginationItem key={item}>
							<PaginationLink
								href={projectPageHref(item, filters)}
								isActive={item === page}
								aria-label={`Project page ${item} of ${totalPages}`}
								size="sm"
								className="size-8 p-0 text-xs hover:bg-transparent hover:text-primary"
							>
								{item}
							</PaginationLink>
						</PaginationItem>
					) : (
						<PaginationItem key={item}>
							<PaginationEllipsis />
						</PaginationItem>
					),
				)}
				<PaginationItem>
					<PaginationNext
						href={projectPageHref(page + 1, filters)}
						disabled={page === totalPages}
						size="sm"
						className="h-8 px-2 text-xs hover:bg-transparent hover:text-primary"
					/>
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	);
}
