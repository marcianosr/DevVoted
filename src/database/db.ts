import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import "dotenv/config";

const isTestEnvironment = process.env.NODE_ENV === "test" || process.env.VITEST;

export const DATABASE_URL = process.env.SUPABASE_DB_URL || "";

if (!DATABASE_URL && !isTestEnvironment) {
	throw new Error("DATABASE_URL is not defined in your environment variables");
}

// Disable prefetch as it is not supported for "Transaction" pool mode
// In test environment, use a dummy connection string to prevent errors
const connectionString = isTestEnvironment
	? "postgresql://dummy:dummy@localhost:5432/dummy"
	: DATABASE_URL;

export const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client);
