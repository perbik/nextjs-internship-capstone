// TODO: Task 2.2 - Configure authentication middleware for route protection
// import { authMiddleware } from "@clerk/nextjs"

// Placeholder proxy - currently allows all routes for development
// TODO: Replace with actual Clerk authMiddleware when authentication is implemented
export default function proxy() {
	// TODO: Implement actual authentication middleware
	// For now, allow all routes so interns can navigate and see the mock pages
	console.log("TODO: Implement Clerk authentication middleware");

	// Return undefined to allow all requests through
	return undefined;
}

export const config = {
	// TODO: Update matcher when implementing actual authentication
	// For now, don't match any routes to allow free navigation
	matcher: [],
};

/*
TODO: Task 2.2 Implementation Notes for Interns:
- Install and configure Clerk
- Set up authMiddleware to protect routes
- Configure public routes: ["/", "/sign-in", "/sign-up"]
- Protect all dashboard routes: ["/dashboard", "/projects"]
- Add proper redirects for unauthenticated users

Example implementation when ready:
export default authMiddleware({
  publicRoutes: ["/", "/sign-in", "/sign-up"],
  ignoredRoutes: [],
})

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}
*/
