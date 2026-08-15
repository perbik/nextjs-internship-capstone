import path from "node:path";

const workspaceRoot = path.resolve(process.cwd(), "..");

/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		authInterrupts: true,
	},
	outputFileTracingRoot: workspaceRoot,
	turbopack: {
		root: workspaceRoot,
	},
	images: {
		unoptimized: true,
	},
};

export default nextConfig;
