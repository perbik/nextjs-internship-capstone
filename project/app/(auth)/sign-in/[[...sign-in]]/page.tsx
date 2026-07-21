// TODO: Task 2.3 - Create sign-in and sign-up pages
export default function SignInPage() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-platinum-900 dark:bg-outer_space-600 px-4">
			<div className="w-full max-w-md">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-outer_space-500 dark:text-platinum-500 mb-2">
						Welcome Back
					</h1>
					<p className="text-paynes_gray-500 dark:text-french_gray-400">
						Sign in to your project management account
					</p>
				</div>

				{/* TODO: Task 2.3 - Replace with actual Clerk SignIn component */}
				<div className="bg-white dark:bg-outer_space-500 p-8 rounded-lg border border-french_gray-300 dark:border-paynes_gray-400">
					<div className="text-center text-paynes_gray-500 dark:text-french_gray-400">
						<p className="mb-4">
							🔐 Clerk Authentication Component Placeholder
						</p>
						<p className="text-sm">TODO: Implement Clerk SignIn component</p>
						<div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
							<p className="text-sm text-yellow-800 dark:text-yellow-200">
								📋 <strong>For Interns:</strong> Replace this with{" "}
								{`<SignIn />`} from @clerk/nextjs
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

/*
TODO: Task 2.3 Implementation Notes:
- Import SignIn from @clerk/nextjs
- Configure sign-in redirects
- Style to match design system
- Add proper error handling
*/
