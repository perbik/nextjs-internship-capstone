import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import type React from "react";
import "../styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/themes";
import { ui } from "@clerk/ui";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const plusJakartaSans = Plus_Jakarta_Sans({
	subsets: ["latin"],
	variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
	title: "Brix — Project Management",
	description: "Break projects down and build progress up with your team.",
	icons: {
		icon: "/brix-logo.svg",
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
			<body className={`${inter.variable} ${plusJakartaSans.variable}`}>
				<ClerkProvider appearance={{ theme: shadcn }} ui={ui}>
					<ThemeProvider>
						<TooltipProvider delayDuration={300}>
							{children}
							<Toaster richColors position="top-right" />
						</TooltipProvider>
					</ThemeProvider>
				</ClerkProvider>
			</body>
		</html>
	);
}
