"use client";

import { LoaderCircle, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

interface DebouncedSearchInputProps {
	initialValue?: string;
	placeholder: string;
	maxLength: number;
	accessibleLabel: string;
}

export function DebouncedSearchInput({
	initialValue = "",
	placeholder,
	maxLength,
	accessibleLabel,
}: DebouncedSearchInputProps) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
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

			lastSubmittedQuery.current = nextQuery;
			const query = nextParams.toString();
			startTransition(() => {
				router.replace(query ? `${pathname}?${query}` : pathname, {
					scroll: false,
				});
			});
		}, 350);

		return () => window.clearTimeout(timeout);
	}, [pathname, router, searchParams, value]);

	return (
		<label className="relative">
			<span className="sr-only">{accessibleLabel}</span>
			<Search
				size={17}
				className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-paynes_gray-500 dark:text-french_gray-400"
			/>
			<input
				type="search"
				name="q"
				maxLength={maxLength}
				value={value}
				onChange={(event) => setValue(event.target.value)}
				placeholder={placeholder}
				className="w-full rounded-lg border border-french_gray-300 bg-white py-2 pl-10 pr-10 text-sm text-outer_space-500 focus:outline-none focus:ring-2 focus:ring-blue_munsell-500 dark:border-paynes_gray-400 dark:bg-outer_space-400 dark:text-platinum-500"
			/>
			{isPending && (
				<LoaderCircle
					size={17}
					aria-label="Updating search results"
					className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-blue_munsell-500"
				/>
			)}
		</label>
	);
}
