import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/lib/db/schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
	throw new Error("DATABASE_URL is required");
}

export const db = drizzle(databaseUrl, { schema });
