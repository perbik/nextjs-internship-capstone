import { Pool } from "@neondatabase/serverless";
import type { ExtractTablesWithRelations } from "drizzle-orm";
import { drizzle, type NeonTransaction } from "drizzle-orm/neon-serverless";
import * as schema from "@/lib/db/schema";

export type DatabaseTransaction = NeonTransaction<
	typeof schema,
	ExtractTablesWithRelations<typeof schema>
>;

// Run related writes together and roll them back when one fails
export async function withTransaction<T>(
	operation: (tx: DatabaseTransaction) => Promise<T>,
) {
	const databaseUrl = process.env.DATABASE_URL;

	if (!databaseUrl) {
		throw new Error("DATABASE_URL is required");
	}

	const pool = new Pool({ connectionString: databaseUrl });
	const transactionDb = drizzle({ client: pool, schema });

	try {
		return await transactionDb.transaction(operation);
	} finally {
		await pool.end();
	}
}
