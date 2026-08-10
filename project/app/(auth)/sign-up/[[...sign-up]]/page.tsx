import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
	return (
		<main className="flex min-h-dvh items-center justify-center bg-background px-4 py-10 dark:bg-background">
			<SignUp path="/sign-up" signInUrl="/sign-in" />
		</main>
	);
}
