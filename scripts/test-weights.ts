/**
 * Test script for category weight snapshots
 * Run with: npx tsx scripts/test-weights.ts
 */
import { snapshotGlobalWeightsForDate } from "../src/domains/polls/services/dailyPoll.service";
import { db } from "../src/database/db";
import { dailyPollsTable } from "../src/database/schema";
import { desc } from "drizzle-orm";

const TARGET_DATE = "2026-01-02"; // Change this to test different dates

const main = async () => {
	console.log(`\n❄️ Snapshotting weights for ${TARGET_DATE}...\n`);

	const weights = await snapshotGlobalWeightsForDate(TARGET_DATE);

	console.log("Calculated weights:");
	console.table(weights);

	// Check what's in the DB
	const records = await db
		.select()
		.from(dailyPollsTable)
		.orderBy(desc(dailyPollsTable.date))
		.limit(5);

	console.log("\nLatest daily_polls records:");
	console.table(
		records.map((r) => ({
			date: r.date,
			poll_id: r.poll_id,
			has_weights: !!r.category_weights,
		}))
	);

	process.exit(0);
};

main().catch(console.error);
