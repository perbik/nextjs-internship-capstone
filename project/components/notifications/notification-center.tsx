"use client";

import { Bell, CheckCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
	markAllNotificationsReadAction,
	markNotificationReadAction,
} from "@/app/(dashboard)/notification-actions";
import type {
	NotificationItem,
	NotificationSummary,
} from "@/components/notifications/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function NotificationCenter({
	summary,
}: {
	summary: NotificationSummary;
}) {
	const router = useRouter();
	const [items, setItems] = useState(summary.items);
	const [unreadCount, setUnreadCount] = useState(summary.unreadCount);
	const [, startTransition] = useTransition();

	// Refresh local state when the server layout provides a newer summary
	useEffect(() => {
		setItems(summary.items);
		setUnreadCount(summary.unreadCount);
	}, [summary]);

	function markOneRead(item: NotificationItem) {
		if (item.readAt) return;

		// Update the badge
		setItems((current) =>
			current.map((entry) =>
				entry.id === item.id ? { ...entry, readAt: new Date() } : entry,
			),
		);
		setUnreadCount((current) => Math.max(0, current - 1));
		startTransition(async () => {
			await markNotificationReadAction(item.id);
		});
	}

	function markAllRead() {
		if (unreadCount === 0) return;

		setItems((current) =>
			current.map((item) => ({ ...item, readAt: item.readAt ?? new Date() })),
		);
		setUnreadCount(0);
		startTransition(async () => {
			await markAllNotificationsReadAction();
		});
	}

	return (
		<Popover onOpenChange={(open) => open && router.refresh()}>
			<Tooltip>
				<TooltipTrigger asChild>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							size="icon"
							className="relative size-9 rounded-md"
							aria-label={
								unreadCount > 0
									? `${unreadCount} unread notifications`
									: "Notifications"
							}
						>
							<Bell size={17} />
							{unreadCount > 0 && (
								<Badge className="absolute -right-1 -top-1 min-w-4 justify-center border-0 bg-brand px-1 py-0 text-[10px] font-bold leading-4 text-white hover:bg-brand">
									{unreadCount > 99 ? "99+" : unreadCount}
								</Badge>
							)}
						</Button>
					</PopoverTrigger>
				</TooltipTrigger>
				<TooltipContent>Notifications</TooltipContent>
			</Tooltip>
			<PopoverContent
				align="end"
				className="w-[min(24rem,calc(100vw-2rem))] p-0"
			>
				<div className="flex items-center justify-between border-b border-border px-4 py-3">
					<div>
						<h2 className="font-display text-base font-bold">Notifications</h2>
						<p className="text-xs text-muted-foreground">
							{unreadCount === 0
								? "You’re all caught up"
								: `${unreadCount} unread`}
						</p>
					</div>
					{unreadCount > 0 && (
						<Button
							variant="ghost"
							size="sm"
							onClick={markAllRead}
							className="gap-1.5"
						>
							<CheckCheck size={14} /> Mark all read
						</Button>
					)}
				</div>

				{items.length === 0 ? (
					<div className="px-6 py-10 text-center">
						<Bell className="mx-auto text-muted-foreground" size={24} />
						<p className="mt-2 text-sm font-semibold">No notifications yet</p>
						<p className="mt-1 text-xs text-muted-foreground">
							Team, project, task, and comment updates will appear here.
						</p>
					</div>
				) : (
					<ScrollArea className="max-h-96">
						<ul className="divide-y divide-border">
							{items.map((item) => (
								<NotificationRow
									key={item.id}
									item={item}
									onRead={markOneRead}
								/>
							))}
						</ul>
					</ScrollArea>
				)}
			</PopoverContent>
		</Popover>
	);
}

function NotificationRow({
	item,
	onRead,
}: {
	item: NotificationItem;
	onRead: (item: NotificationItem) => void;
}) {
	const actorName =
		[item.actorFirstName, item.actorLastName].filter(Boolean).join(" ") ||
		item.actorEmail ||
		"A former member";
	const href = item.teamId
		? `/team/${item.teamId}`
		: item.projectId
			? `/projects/${item.projectId}`
			: null;
	const content = (
		<>
			<span
				className={cn(
					"mt-1.5 size-2 shrink-0 rounded-full",
					item.readAt ? "bg-transparent" : "bg-brand",
				)}
			/>
			<span className="min-w-0">
				<span className="block text-sm leading-5">
					<strong>{actorName}</strong> {item.message}
				</span>
				<time className="mt-1 block text-xs text-muted-foreground">
					{formatNotificationTime(item.createdAt)}
				</time>
			</span>
		</>
	);

	return (
		<li className={cn(!item.readAt && "bg-brand-light/40 dark:bg-brand/5")}>
			{href ? (
				<Link
					href={href}
					onClick={() => onRead(item)}
					className="flex gap-3 px-4 py-3 transition-colors hover:bg-muted/60"
				>
					{content}
				</Link>
			) : (
				<button
					type="button"
					onClick={() => onRead(item)}
					className="flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60"
				>
					{content}
				</button>
			)}
		</li>
	);
}

function formatNotificationTime(value: Date) {
	const date = new Date(value);
	const elapsedMinutes = Math.max(
		0,
		Math.floor((Date.now() - date.getTime()) / 60_000),
	);
	if (elapsedMinutes < 1) return "Just now";
	if (elapsedMinutes < 60) return `${elapsedMinutes}m ago`;
	const hours = Math.floor(elapsedMinutes / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	if (days < 7) return `${days}d ago`;
	return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
