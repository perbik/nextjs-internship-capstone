"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { StatusPage } from "@/components/feedback/status-page";
import { Button } from "@/components/ui/button";

interface ErrorPageProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<StatusPage
			code="500 · Error"
			description="An unexpected error interrupted this page. Try loading it again, or return to your dashboard."
			icon={<TriangleAlert aria-hidden="true" className="size-7" />}
			title="Something went wrong"
		>
			<Button type="button" size="lg" className="rounded-full" onClick={reset}>
				<RotateCcw aria-hidden="true" />
				Try again
			</Button>
			<Button asChild size="lg" variant="outline" className="rounded-full">
				<Link href="/dashboard">Go to dashboard</Link>
			</Button>
		</StatusPage>
	);
}
