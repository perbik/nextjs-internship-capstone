import { auth } from "@clerk/nextjs/server";
import type React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getNotificationSummary } from "@/lib/db/queries";

export default async function ProtectedDashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	await auth.protect();
	const user = await requireCurrentUser();
	const notifications = await getNotificationSummary(user.id);

	return (
		<DashboardLayout notifications={notifications}>{children}</DashboardLayout>
	);
}
