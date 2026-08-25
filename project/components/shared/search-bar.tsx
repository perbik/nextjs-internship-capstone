"use client";

import { LoaderCircle, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
	initialValue?: string;
	placeholder: string;
	maxLength: number;
	accessibleLabel: string;
	variant?: "default" | "pill";
	resetParams?: string[];
}

const EMPTY_RESET_PARAMS: string[] = [];

export function SearchBar({
	initialValue = "",
	placeholder,
	maxLength,
	accessibleLabel,
	variant = "default",
	resetParams = EMPTY_RESET_PARAMS,
}: SearchBarProps) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const inputId = useId();
	const [value, setValue] = useState(initialValue);
	const [isPending, startTransition] = useTransition();
	const lastSubmittedQuery = useRef(initialValue);

	useEffect(() => {
		const urlQuery = searchParams.get("q") ?? "";

		if (urlQuery !== lastSubmittedQuery.current) {
			setValue(urlQuery);
			lastSubmittedQuery.current = urlQuery;
		}
	}, [searchParams]);

	useEffect(() => {
		const timeout = window.setTimeout(() => {
			const nextQuery = value.trim();
			const currentQuery = searchParams.get("q") ?? "";

			if (nextQuery === currentQuery) {
				return;
			}

			const nextParams = new URLSearchParams(searchParams.toString());

			if (nextQuery) {
				nextParams.set("q", nextQuery);
			} else {
				nextParams.delete("q");
			}
			for (const param of resetParams) nextParams.delete(param);

			lastSubmittedQuery.current = nextQuery;
			const query = nextParams.toString();
			startTransition(() => {
				router.replace(query ? `${pathname}?${query}` : pathname, {
					scroll: false,
				});
			});
		}, 350);

		return () => window.clearTimeout(timeout);
	}, [pathname, resetParams, router, searchParams, value]);

	return (
		<label htmlFor={inputId} className="relative block">
			<span className="sr-only">{accessibleLabel}</span>
			<Search
				size={17}
				className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted-foreground"
			/>
			<Input
				id={inputId}
				type="search"
				name="q"
				maxLength={maxLength}
				value={value}
				onChange={(event) => setValue(event.target.value)}
				placeholder={placeholder}
				className={`w-full bg-card py-2 pl-10 pr-10 text-base text-foreground focus-visible:ring-brand/30 md:text-sm ${
					variant === "pill" ? "h-11 rounded-full" : "rounded-lg"
				}`}
			/>
			{isPending && (
				<LoaderCircle
					size={17}
					aria-label="Updating search results"
					className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-brand"
				/>
			)}
		</label>
	);
}
