import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import "dotenv/config";

export const DATABASE_URL = process.env.SUPABASE_DB_URL || "";

// Disable prefetch as it is not supported for "Transaction" pool mode
export const client = postgres(DATABASE_URL, { prepare: false });

if (!DATABASE_URL) {
	throw new Error("DATABASE_URL is not defined in your environment variables");
}
export const db = drizzle(client);
