import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";

export interface TeamActivityItem {
	id: string;
	actorName: string;
	action: string;
	taskTitle?: string;
	projectId: string;
	projectName: string;
	teamName: string;
	date: string;
}

interface TeamActivityCardProps {
	activities: TeamActivityItem[];
	page: number;
	totalPages: number;
	selectedScope: string;
	showTeam: boolean;
}

type ActivityPageItem = number | "start-ellipsis" | "end-ellipsis";

function getActivityPageItems(page: number, totalPages: number) {
	if (totalPages <= 7) {
		return Array.from({ length: totalPages }, (_, index) => index + 1);
	}

	const items: ActivityPageItem[] = [1];
	if (page > 3) items.push("start-ellipsis");

	for (
		let pageNumber = Math.max(2, page - 1);
		pageNumber <= Math.min(totalPages - 1, page + 1);
		pageNumber += 1
	) {
		items.push(pageNumber);
	}

	if (page < totalPages - 2) items.push("end-ellipsis");
	items.push(totalPages);
	return items;
}

function activityPageHref(page: number, selectedScope: string) {
	const params = new URLSearchParams();
	if (selectedScope !== "all") params.set("team", selectedScope);
	if (page > 1) params.set("activityPage", String(page));
	const search = params.toString();
	return search ? `/analytics?${search}` : "/analytics";
}

export function TeamActivityCard({
	activities,
	page,
	totalPages,
	selectedScope,
	showTeam,
}: TeamActivityCardProps) {
	const pageItems = getActivityPageItems(page, totalPages);

	return (
		<Card className="flex h-full flex-col overflow-hidden rounded-2xl border-border bg-card shadow-[0_1px_6px_rgba(0,0,0,.06)]">
			<div className="px-5 pb-1.5 pt-5 sm:px-6">
				<h2 className="font-display text-lg font-extrabold text-foreground sm:text-xl">
					Team Activity
				</h2>
				<p className="mt-1 text-sm text-muted-foreground">
					Recent project activity
				</p>
			</div>

			{activities.length === 0 ? (
				<p className="px-6 py-12 text-center text-sm text-muted-foreground">
					No activity has been recorded for this page.
				</p>
			) : (
				<ul className="flex-1 divide-y divide-border px-5 sm:px-6">
					{activities.map((activity) => (
						<li key={activity.id} className="py-2.5">
							<div className="grid gap-1 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-4">
								<p className="min-w-0 text-[13px] font-medium text-foreground sm:text-sm">
									{activity.actorName} {activity.action}
									{activity.taskTitle ? `: ${activity.taskTitle}` : ""}
								</p>
								<time className="text-[11px] text-muted-foreground sm:text-xs">
									{activity.date}
								</time>
							</div>
							<div className="mt-0.5 flex flex-wrap items-center gap-1.5">
								{showTeam && (
									<Badge
										variant="secondary"
										className="border-0 bg-brand/10 text-[10px] text-brand hover:bg-brand/10"
									>
										{activity.teamName}
									</Badge>
								)}
								<Link
									href={`/projects/${activity.projectId}`}
									className="text-xs font-semibold text-brand hover:underline sm:text-sm"
								>
									{activity.projectName}
								</Link>
							</div>
						</li>
					))}
				</ul>
			)}

			{totalPages > 1 && (
				<Pagination className="mt-auto border-t border-border px-3 py-1.5 sm:px-6">
					<PaginationContent className="w-full justify-between sm:w-auto sm:justify-center">
						<PaginationItem className="sm:hidden">
							<PaginationLink
								href={activityPageHref(page - 1, selectedScope)}
								disabled={page === 1}
								size="icon"
								aria-label="Previous activity page"
							>
								<ChevronLeft aria-hidden="true" />
							</PaginationLink>
						</PaginationItem>
						<PaginationItem className="sm:hidden">
							<span className="text-xs font-semibold text-muted-foreground">
								Page {page} of {totalPages}
							</span>
						</PaginationItem>
						<PaginationItem className="sm:hidden">
							<PaginationLink
								href={activityPageHref(page + 1, selectedScope)}
								disabled={page >= totalPages}
								size="icon"
								aria-label="Next activity page"
							>
								<ChevronRight aria-hidden="true" />
							</PaginationLink>
						</PaginationItem>
						<PaginationItem className="hidden sm:block">
							<PaginationPrevious
								href={activityPageHref(page - 1, selectedScope)}
								disabled={page === 1}
							/>
						</PaginationItem>
						{pageItems.map((item) =>
							typeof item === "number" ? (
								<PaginationItem key={item} className="hidden sm:block">
									<PaginationLink
										href={activityPageHref(item, selectedScope)}
										isActive={item === page}
										aria-label={`Activity page ${item} of ${totalPages}`}
									>
										{item}
									</PaginationLink>
								</PaginationItem>
							) : (
								<PaginationItem key={item} className="hidden sm:block">
									<PaginationEllipsis />
								</PaginationItem>
							),
						)}
						<PaginationItem className="hidden sm:block">
							<PaginationNext
								href={activityPageHref(page + 1, selectedScope)}
								disabled={page >= totalPages}
							/>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			)}
		</Card>
	);
}
