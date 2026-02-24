import { sql } from "drizzle-orm";

import { db } from "@/src/database/db";

async function resetDatabase() {
	console.log("🗑️  Dropping all tables...");

	try {
		await db.execute(sql`
            DROP TABLE IF EXISTS run_gate_history CASCADE;
            DROP TABLE IF EXISTS run_shop_offerings CASCADE;
            DROP TABLE IF EXISTS run_category_coverage CASCADE;
            DROP TABLE IF EXISTS runs CASCADE;
            DROP TABLE IF EXISTS gate_types CASCADE;
            DROP TABLE IF EXISTS polls_categories CASCADE;
            DROP TABLE IF EXISTS polls_options CASCADE;
            DROP TABLE IF EXISTS polls_response_options CASCADE;
            DROP TABLE IF EXISTS polls_responses CASCADE;
            DROP TABLE IF EXISTS polls_user_performance CASCADE;
            DROP TABLE IF EXISTS polls CASCADE;
            DROP TABLE IF EXISTS daily_polls CASCADE;
            DROP TABLE IF EXISTS users CASCADE;
            DROP TABLE IF EXISTS seasons CASCADE;
            DROP TABLE IF EXISTS leaderboard CASCADE;
            DROP TABLE IF EXISTS polls_active_runs CASCADE;
            DROP TABLE IF EXISTS polls_history CASCADE;
            DROP TABLE IF EXISTS __drizzle_migrations CASCADE;
        `);

		console.log("✅ All tables dropped successfully!");
	} catch (error) {
		console.error("❌ Error dropping tables:", error);
		throw error;
	}
}

resetDatabase()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
