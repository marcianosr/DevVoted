import { db } from "~/database/db";
import { sql } from "drizzle-orm";

async function truncatePollsHistory() {
	console.log("Truncating polls_history table...");

	try {
		await db.execute(sql`TRUNCATE TABLE polls_history CASCADE`);
		console.log("✅ Successfully truncated polls_history table");
	} catch (error) {
		console.error("❌ Error truncating table:", error);
		process.exit(1);
	}

	process.exit(0);
}

truncatePollsHistory();
