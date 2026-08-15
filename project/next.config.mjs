/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		authInterrupts: true,
	},
	turbopack: {
		root: process.cwd(),
	},
	images: {
		unoptimized: true,
	},
};

export default nextConfig;
