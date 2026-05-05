/**
 * Test script for category weight snapshots
 * Run with: npx tsx scripts/test-weights.ts
 */
import { db } from "../src/database/db";
import { dailyPollsTable, runsTable } from "../src/database/schema";
import {  eq } from "drizzle-orm";
import { calculateCategoryWeights } from "../src/domains/polls/services/categoryWeight.service";
import { getAllActiveConfigIds } from "../src/domains/runs/api/shop.queries";

const TARGET_DATE = "2026-01-08"; // Use a fresh date!

const main = async () => {
	console.log("\n❄️ DEBUGGING CATEGORY WEIGHTS\n");

	// Step 1: Check active runs and their configs
	const activeRuns = await db
		.select({ id: runsTable.id, configs: runsTable.active_config_ids })
		.from(runsTable)
		.where(eq(runsTable.status, "active"));

	console.log("1. Active runs:");
	console.table(activeRuns);

	// Step 2: Get all config IDs
	const allConfigIds = await getAllActiveConfigIds();
	console.log("\n2. All active config IDs across runs:");
	console.log(allConfigIds);

	// Step 3: Calculate weights
	const weights = calculateCategoryWeights(allConfigIds);
	console.log("\n3. Calculated weights:");
	console.table(weights);

	// Step 4: Check if record already exists for target date
	const [existing] = await db
		.select()
		.from(dailyPollsTable)
		.where(eq(dailyPollsTable.date, TARGET_DATE));

	if (existing) {
		console.log(`\n4. ⚠️  Record ALREADY EXISTS for ${TARGET_DATE}:`);
		console.log("   poll_id:", existing.poll_id);
		console.log("   weights:", existing.category_weights);
		console.log("\n   → Deleting it so we can test fresh...");
		await db.delete(dailyPollsTable).where(eq(dailyPollsTable.date, TARGET_DATE));
	}

	// Step 5: Insert fresh snapshot
	console.log(`\n5. Inserting fresh snapshot for ${TARGET_DATE}...`);
	await db.insert(dailyPollsTable).values({
		date: TARGET_DATE,
		poll_id: null,
		category_weights: weights,
	});

	// Step 6: Verify
	const [verify] = await db
		.select()
		.from(dailyPollsTable)
		.where(eq(dailyPollsTable.date, TARGET_DATE));

	console.log("\n6. Stored in DB:");
	console.log("   poll_id:", verify?.poll_id);
	console.log("   weights:", verify?.category_weights);

	console.log("\n✅ Done! Now set your date to", TARGET_DATE, "and test.\n");
	process.exit(0);
};

main().catch(console.error);
