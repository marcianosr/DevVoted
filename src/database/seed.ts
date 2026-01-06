import { readFileSync } from "fs";
import { join } from "path";

import { eq } from "drizzle-orm";
import postgres from "postgres";

import { db } from "@/src/database/db";
import {
	pollsTable,
	pollCategoriesTable,
	usersTable,
	runsTable,
	runCategoryCoverageTable,
	seasonsTable,
	leaderboardTable,
} from "@/src/database/schema";
import { getCategories, CATEGORY_CODES } from "~/domains/shared/categories";

const DEV_UID = "f40d940b-9d3b-47f3-a73a-4dfba18b20c2";
const ADMIN_UID = "65ad226e-e3c1-4e7f-a96d-a84156589733";

async function seedDatabase() {
	console.log("🌱 Starting database seeding process...\n");

	// First, create admin user for imported polls
	console.log("👤 Creating admin user for imported polls...");

	const adminUser = {
		id: ADMIN_UID,
		display_name: "Admin",
		email: "admin@devvoted.com",
		roles: "admin" as const,
	};

	const existingAdmin = await db
		.select()
		.from(usersTable)
		.where(eq(usersTable.id, ADMIN_UID));

	if (existingAdmin.length === 0) {
		await db.insert(usersTable).values(adminUser);
		console.log(`✅ Created admin user: ${adminUser.display_name}`);
	} else {
		console.log(`ℹ️ Admin user already exists: ${adminUser.display_name}`);
	}

	// Create test user
	console.log("\n👤 Creating test user if needed...");

	const testUser = {
		id: DEV_UID,
		display_name: "Test User",
		email: "test@example.com",
		role: "user" as const,
	};

	const existingUser = await db
		.select()
		.from(usersTable)
		.where(eq(usersTable.id, DEV_UID));

	if (existingUser.length === 0) {
		await db.insert(usersTable).values(testUser);
		console.log(`✅ Created test user: ${testUser.display_name}`);
	} else {
		console.log(`ℹ️ Test user already exists: ${testUser.display_name}`);
	}

	// Next, ensure we have the necessary categories
	console.log("\n📋 Seeding poll categories...");

	const categories = getCategories();

	try {
		// Insert categories if they don't exist
		for (const category of categories) {
			const existingCategory = await db
				.select()
				.from(pollCategoriesTable)
				.where(eq(pollCategoriesTable.code, category.code));

			if (existingCategory.length === 0) {
				await db.insert(pollCategoriesTable).values(category);
				console.log(`✅ Added category: ${category.name}`);
			} else {
				console.log(`ℹ️ Category already exists: ${category.name}`);
			}
		}

		// Import polls from Firebase backup using TypeScript
		console.log("\n📊 Importing polls from Firebase migration...\n");

		const existingPolls = await db.select().from(pollsTable);

		if (existingPolls.length > 0) {
			console.log(
				`ℹ️ Found ${existingPolls.length} existing polls. Skipping import.`
			);
		} else {
			try {
				// Dynamically import and run the Firebase importer
				const importerPath = join(
					process.cwd(),
					"scripts",
					"import-firebase-polls.ts"
				);
				const { execSync } = await import("child_process");

				console.log("🔄 Running Firebase poll importer...");
				execSync(`tsx ${importerPath}`, {
					stdio: "inherit",
					cwd: process.cwd(),
				});

				const importedPolls = await db.select().from(pollsTable);
				console.log(
					`✅ Successfully imported ${importedPolls.length} polls from Firebase migration!`
				);
			} catch (error) {
				console.error("❌ Error importing polls:", error);
				console.log(
					"⚠️ Continuing without polls. You can manually import using:"
				);
				console.log("   tsx scripts/import-firebase-polls.ts");
			}
		}

		// Seed seasons for testing
		console.log("\n🏆 Seeding test seasons...");

		const existingSeasons = await db.select().from(seasonsTable);

		if (existingSeasons.length === 0) {
			const testSeasons = [
				{
					name: "Season 1: Foundation",
					description:
						"The inaugural season focusing on core frontend technologies",
					status: "active" as const,
					start_date: new Date(Date.now() - 86400000 * 7), // Started 1 week ago
					end_date: new Date(Date.now() + 86400000 * 30), // Ends in 30 days
				},
				{
					name: "Season 2: Advanced Patterns",
					description: "Advanced React patterns and state management",
					status: "upcoming" as const,
					start_date: new Date(Date.now() + 86400000 * 25), // Starts in 25 days
					end_date: new Date(Date.now() + 86400000 * 60), // Ends in 60 days
				},
			];

			await db.insert(seasonsTable).values(testSeasons);
			console.log(`✅ Successfully seeded ${testSeasons.length} test seasons!`);
		} else {
			console.log(
				`ℹ️ Found ${existingSeasons.length} existing seasons. Skipping season seeding.`
			);
		}

		// Seed leaderboard data with random users
		console.log("\n🏆 Seeding leaderboard with random users...");

		const existingLeaderboard = await db.select().from(leaderboardTable);
		const existingRuns = await db.select().from(runsTable);

		// Check if we have polls before seeding leaderboard
		const pollsForLeaderboard = await db.select().from(pollsTable);

		// Only seed leaderboard if we have polls to reference
		if (pollsForLeaderboard.length === 0) {
			console.log("⚠️ Skipping leaderboard seeding - no polls available.");
		} else if (existingLeaderboard.length === 0 && existingRuns.length === 0) {
			// Create 9 users for leaderboard
			const leaderboardUsers = [
				{
					id: "11111111-1111-1111-1111-111111111111",
					display_name: "Sheldon Cooper",
					email: "sheldon@caltech.edu",
					role: "user" as const,
				},
				{
					id: "22222222-2222-2222-2222-222222222222",
					display_name: "Leonard Hofstadter",
					email: "leonard@caltech.edu",
					role: "user" as const,
				},
				{
					id: "33333333-3333-3333-3333-333333333333",
					display_name: "Howard Wolowitz",
					email: "howard@caltech.edu",
					role: "user" as const,
				},
				{
					id: "44444444-4444-4444-4444-444444444444",
					display_name: "Rajesh Koothrapalli",
					email: "rajesh@caltech.edu",
					role: "user" as const,
				},
				{
					id: "55555555-5555-5555-5555-555555555555",
					display_name: "Barry Kripke",
					email: "barry@caltech.edu",
					role: "user" as const,
				},
				{
					id: "66666666-6666-6666-6666-666666666666",
					display_name: "Matthijs Groen",
					email: "matthijs@devvoted.nl",
					role: "user" as const,
				},
				{
					id: "77777777-7777-7777-7777-777777777777",
					display_name: "Sander van Maurik",
					email: "sander@devvoted.nl",
					role: "user" as const,
				},
				{
					id: "88888888-8888-8888-8888-888888888888",
					display_name: "Piet de Vries",
					email: "piet@devvoted.nl",
					role: "user" as const,
				},
				{
					id: "99999999-9999-9999-9999-999999999999",
					display_name: "Tom Schoutens",
					email: "tom@devvoted.nl",
					role: "user" as const,
				},
			];

			// Insert users
			for (const user of leaderboardUsers) {
				const existingUser = await db
					.select()
					.from(usersTable)
					.where(eq(usersTable.id, user.id));
				if (existingUser.length === 0) {
					await db.insert(usersTable).values(user);
					console.log(`✅ Created user: ${user.display_name}`);
				}
			}

			// Get current season for runs
			const currentSeason = await db.select().from(seasonsTable).limit(1);
			const seasonId = currentSeason[0]?.id || null;

			// Generate category-specific data for each user
			// Each user gets different stats per category to create variety in the leaderboard
			const generateCategoryData = (userIndex: number) => {
				const baseValues = {
					css: {
						coverage: 75 + userIndex * 2,
						streak: 8 - userIndex,
						polls: 20 + userIndex,
					},
					js: {
						coverage: 85 - userIndex * 3,
						streak: 12 - userIndex,
						polls: 25 + userIndex,
					},
					react: {
						coverage: 70 + userIndex * 2.5,
						streak: 10 - userIndex,
						polls: 22 + userIndex,
					},
					ts: {
						coverage: 80 - userIndex * 2,
						streak: 9 - userIndex,
						polls: 21 + userIndex,
					},
					html: {
						coverage: 65 + userIndex * 3,
						streak: 7 - userIndex,
						polls: 18 + userIndex,
					},
					git: {
						coverage: 55 + userIndex * 4,
						streak: 6 - userIndex,
						polls: 15 + userIndex,
					},
					"general-frontend": {
						coverage: 60 + userIndex * 2,
						streak: 5 - userIndex,
						polls: 16 + userIndex,
					},
					java: {
						coverage: 45 + userIndex * 3,
						streak: 4 - userIndex,
						polls: 12 + userIndex,
					},
				};
				return baseValues;
			};

			// Create completed runs and leaderboard entries for each user
			for (let i = 0; i < leaderboardUsers.length; i++) {
				const user = leaderboardUsers[i];
				const categoryData = generateCategoryData(i);

				// Calculate total coverage across all categories
				const totalCoverage =
					Object.values(categoryData).reduce(
						(sum, cat) => sum + cat.coverage,
						0
					) / CATEGORY_CODES.length;

				// Create a completed run
				const [run] = await db
					.insert(runsTable)
					.values({
						user_id: user.id,
						season_id: seasonId,
						status: "finished",
						finished_at: new Date(Date.now() - (i + 1) * 86400000), // Finished 1-9 days ago
					})
					.returning();

				// Create run category coverage and leaderboard entries for each category
				for (const categoryCode of CATEGORY_CODES) {
					const catData =
						categoryData[categoryCode as keyof typeof categoryData];

					// Create run category coverage data
					await db.insert(runCategoryCoverageTable).values({
						run_id: run.id,
						category_code: categoryCode,
						current_coverage: catData.coverage,
						final_coverage: catData.coverage,
						current_streak: catData.streak,
						best_streak: catData.streak,
						final_streak: catData.streak,
						polls_answered: catData.polls,
					});

					// Create leaderboard entry for this category
					await db.insert(leaderboardTable).values({
						user_id: user.id,
						run_id: run.id,
						season_id: seasonId,
						category_code: categoryCode,
						category_coverage: catData.coverage,
						total_coverage: totalCoverage,
						best_streak: catData.streak,
						polls_answered: catData.polls,
						completed_at: new Date(Date.now() - (i + 1) * 86400000),
					});
				}

				console.log(
					`✅ Created leaderboard entries for ${user.display_name}: ${Math.round(totalCoverage)}% avg coverage`
				);
			}

			console.log(
				`✅ Successfully seeded leaderboard with ${leaderboardUsers.length} users across all categories!`
			);
		} else {
			console.log(
				`ℹ️ Found ${existingLeaderboard.length} existing leaderboard entries. Skipping leaderboard seeding.`
			);
		}

		console.log("\n✨ Database seeding completed successfully!\n");
	} catch (error) {
		console.error("❌ Error seeding database:", error);
		process.exit(1);
	} finally {
		process.exit(0);
	}
}

// Execute the seed function
seedDatabase();
