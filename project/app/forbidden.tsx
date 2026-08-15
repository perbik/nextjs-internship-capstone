import { ArrowRight, ShieldX } from "lucide-react";
import Link from "next/link";
import { StatusPage } from "@/components/feedback/status-page";
import { Button } from "@/components/ui/button";

export default function Forbidden() {
	return (
		<StatusPage
			code="403 · Forbidden"
			description="This team or project is restricted. Ask an owner for access, or return to a space available to your account."
			icon={<ShieldX aria-hidden="true" className="size-7" />}
			title="You don’t have access"
		>
			<Button asChild size="lg" className="rounded-full">
				<Link href="/dashboard">
					Go to dashboard
					<ArrowRight aria-hidden="true" />
				</Link>
			</Button>
			<Button asChild size="lg" variant="outline" className="rounded-full">
				<Link href="/">Back to home</Link>
			</Button>
		</StatusPage>
	);
}
