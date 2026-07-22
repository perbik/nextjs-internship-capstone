import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
	return (
		<main className="flex min-h-screen items-center justify-center bg-platinum-900 px-4 py-10 dark:bg-outer_space-600">
			<div className="flex w-full max-w-md flex-col items-center gap-8">
				<div className="text-center">
					<h1 className="mb-2 text-3xl font-bold text-outer_space-500 dark:text-platinum-500">
						Create Account
					</h1>
					<p className="text-paynes_gray-500 dark:text-french_gray-400">
						Join ProjectFlow and start managing your projects
					</p>
				</div>
				<SignUp />
			</div>
		</main>
	);
}
