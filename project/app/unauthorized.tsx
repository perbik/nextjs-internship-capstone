import { ArrowRight, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { StatusPage } from "@/components/feedback/status-page";
import { Button } from "@/components/ui/button";

export default function Unauthorized() {
	return (
		<StatusPage
			code="401 · Unauthorized"
			description="Sign in to continue. If you were already signed in, your session may have expired."
			icon={<LockKeyhole aria-hidden="true" className="size-7" />}
			title="Let’s get you back in"
		>
			<Button asChild size="lg" className="rounded-full">
				<Link href="/sign-in">
					Sign in
					<ArrowRight aria-hidden="true" />
				</Link>
			</Button>
			<Button asChild size="lg" variant="outline" className="rounded-full">
				<Link href="/">Back to home</Link>
			</Button>
		</StatusPage>
	);
}
