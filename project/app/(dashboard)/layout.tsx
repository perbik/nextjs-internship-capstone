import { auth } from "@clerk/nextjs/server";
import type React from "react";
import { DashboardLayout } from "@/components/dashboard-layout";

export default async function ProtectedDashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	await auth.protect();

	return <DashboardLayout>{children}</DashboardLayout>;
}
