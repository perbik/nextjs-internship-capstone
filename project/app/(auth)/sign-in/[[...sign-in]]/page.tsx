import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
	return (
		<main className="flex min-h-dvh items-center justify-center bg-background px-4 py-10 dark:bg-background">
			<SignIn path="/sign-in" signUpUrl="/sign-up" />
		</main>
	);
}
