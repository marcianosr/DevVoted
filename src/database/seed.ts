import { db } from "@/src/database/db";
import {
	pollsTable,
	pollCategoriesTable,
	usersTable,
	pollOptionsTable,
	runsTable,
	runCategoryCoverageTable,
	seasonsTable,
	leaderboardTable,
} from "@/src/database/schema";
import { eq } from "drizzle-orm";
import { createSeedPollArray } from "~/domains/polls/factories/poll";
import { getCategories, CATEGORY_CODES } from "~/domains/shared/categories";

const DEV_UID = "f40d940b-9d3b-47f3-a73a-4dfba18b20c2";

async function seedDatabase() {
	console.log("🌱 Starting database seeding process...\n");

	// First, ensure we have a test user
	console.log("👤 Creating test user if needed...");

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

		// Now seed the polls
		console.log("\n📊 Seeding polls...\n");

		// Create 70 polls using our factory for extended gameplay
		const polls = createSeedPollArray(70, DEV_UID);

		// Ensure we have a good mix of categories across all polls
		const categoryDistribution = {
			css: 15,
			js: 15,
			react: 12,
			ts: 12,
			html: 8,
			git: 5,
			"general-frontend": 3,
		};

		let categoryIndex = 0;
		for (const [category, count] of Object.entries(categoryDistribution)) {
			for (let i = 0; i < count && categoryIndex < polls.length; i++) {
				polls[categoryIndex].category_code = category;
				categoryIndex++;
			}
		}

		// Check if polls already exist to avoid duplicates
		const existingPolls = await db.select().from(pollsTable);

		if (existingPolls.length > 0) {
			console.log(
				`ℹ️ Found ${existingPolls.length} existing polls. Skipping poll seeding to avoid duplicates.`
			);
			console.log(
				"ℹ️ If you want to re-seed polls, run the db:reset script first."
			);
		} else {
			// Insert polls one by one to ensure proper typing
			const insertedPollIds: number[] = [];

			for (const poll of polls) {
				const result = await db
					.insert(pollsTable)
					.values(poll)
					.returning({ id: pollsTable.id });
				if (result[0]) {
					insertedPollIds.push(result[0].id);
				}
			}
			console.log(
				`✅ Successfully seeded ${insertedPollIds.length} polls!`
			);

			// Now seed poll options for each poll
			console.log("\n🔤 Seeding poll options...");

			// Get all polls to create options for
			const allPolls = await db.select().from(pollsTable);

			// Create and insert options for each poll
			let totalOptionsCreated = 0;
			for (const poll of allPolls) {
				const options = generatePollOptions(
					poll.id,
					poll.question,
					poll.answer_type
				);
				await db.insert(pollOptionsTable).values(options);
				totalOptionsCreated += options.length;
			}

			console.log(
				`✅ Successfully seeded ${totalOptionsCreated} poll options!`
			);
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
			console.log(
				`✅ Successfully seeded ${testSeasons.length} test seasons!`
			);
		} else {
			console.log(
				`ℹ️ Found ${existingSeasons.length} existing seasons. Skipping season seeding.`
			);
		}

		// Seed leaderboard data with random users
		console.log("\n🏆 Seeding leaderboard with random users...");

		const existingLeaderboard = await db.select().from(leaderboardTable);
		const existingRuns = await db.select().from(runsTable);

		if (existingLeaderboard.length === 0 && existingRuns.length === 0) {
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
					css: { coverage: 75 + userIndex * 2, streak: 8 - userIndex, polls: 20 + userIndex },
					js: { coverage: 85 - userIndex * 3, streak: 12 - userIndex, polls: 25 + userIndex },
					react: { coverage: 70 + userIndex * 2.5, streak: 10 - userIndex, polls: 22 + userIndex },
					ts: { coverage: 80 - userIndex * 2, streak: 9 - userIndex, polls: 21 + userIndex },
					html: { coverage: 65 + userIndex * 3, streak: 7 - userIndex, polls: 18 + userIndex },
					git: { coverage: 55 + userIndex * 4, streak: 6 - userIndex, polls: 15 + userIndex },
					"general-frontend": { coverage: 60 + userIndex * 2, streak: 5 - userIndex, polls: 16 + userIndex },
				};
				return baseValues;
			};

			// Create completed runs and leaderboard entries for each user
			for (let i = 0; i < leaderboardUsers.length; i++) {
				const user = leaderboardUsers[i];
				const categoryData = generateCategoryData(i);

				// Calculate total coverage across all categories
				const totalCoverage =
					Object.values(categoryData).reduce((sum, cat) => sum + cat.coverage, 0) /
					CATEGORY_CODES.length;

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
					const catData = categoryData[categoryCode as keyof typeof categoryData];

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

/**
 * Generate appropriate options for a poll based on its question
 * @param pollId The ID of the poll to generate options for
 * @param question The poll question text
 * @param answerType Whether this is a single or multiple choice poll
 * @returns An array of poll option objects
 */
function generatePollOptions(
	pollId: number,
	question: string,
	answerType: "single" | "multiple"
) {
	// Default options for generic questions
	let options = [
		{ poll_id: pollId, option: "Option A", correct: true },
		{ poll_id: pollId, option: "Option B", correct: false },
		{ poll_id: pollId, option: "Option C", correct: false },
		{ poll_id: pollId, option: "Option D", correct: false },
	];

	// For multiple choice polls, ensure we have multiple correct answers
	if (answerType === "multiple") {
		options[1].correct = true; // Make Option B also correct
	}

	// Generate more specific options based on the question content
	if (question.toLowerCase().includes("css")) {
		if (question.includes("*") && question.includes("selector")) {
			options = [
				{
					poll_id: pollId,
					option: "Selects all elements",
					correct: true,
				},
				{
					poll_id: pollId,
					option: "Can cause performance issues when overused",
					correct: true,
				},
				{
					poll_id: pollId,
					option: "Has the lowest specificity of any selector",
					correct: true,
				},
				{
					poll_id: pollId,
					option: "Only works in modern browsers",
					correct: false,
				},
			];
		} else if (
			question.includes("flex") &&
			question.includes("multiple lines")
		) {
			options = [
				{
					poll_id: pollId,
					option: "flex-wrap: wrap",
					correct: true,
				},
				{
					poll_id: pollId,
					option: "flex-direction: column",
					correct: false,
				},
				{
					poll_id: pollId,
					option: "flex-flow: row",
					correct: false,
				},
				{
					poll_id: pollId,
					option: "flex-basis: auto",
					correct: false,
				},
			];
		} else if (
			question.includes("vertical spacing") &&
			question.includes("text")
		) {
			options = [
				{ poll_id: pollId, option: "line-height", correct: true },
				{
					poll_id: pollId,
					option: "letter-spacing",
					correct: false,
				},
				{ poll_id: pollId, option: "text-indent", correct: false },
				{
					poll_id: pollId,
					option: "vertical-align",
					correct: false,
				},
			];
		} else if (
			question.includes("position") &&
			question.includes("document flow")
		) {
			options = [
				{
					poll_id: pollId,
					option: "position: absolute",
					correct: true,
				},
				{
					poll_id: pollId,
					option: "position: fixed",
					correct: false,
				},
				{
					poll_id: pollId,
					option: "position: relative",
					correct: false,
				},
				{
					poll_id: pollId,
					option: "position: static",
					correct: false,
				},
			];
		}
	} else if (question.toLowerCase().includes("js")) {
		if (question.includes("closures")) {
			options = [
				{
					poll_id: pollId,
					option: "They retain access to their outer function's scope",
					correct: true,
				},
				{
					poll_id: pollId,
					option: "They help create private variables",
					correct: false,
				},
				{
					poll_id: pollId,
					option: "They can lead to memory leaks if not handled properly",
					correct: false,
				},
				{
					poll_id: pollId,
					option: "They are only available in ES6 and later",
					correct: false,
				},
			];
		}
	} else if (question.toLowerCase().includes("react")) {
		if (question.includes("synthetic events")) {
			options = [
				{
					poll_id: pollId,
					option: "They provide cross-browser compatibility",
					correct: true,
				},
				{
					poll_id: pollId,
					option: "They improve performance through event pooling",
					correct: false,
				},
				{
					poll_id: pollId,
					option: "They follow the W3C spec",
					correct: false,
				},
				{
					poll_id: pollId,
					option: "They only work with functional components",
					correct: false,
				},
			];
		}
	} else if (question.toLowerCase().includes("ts")) {
		if (question.includes("type system")) {
			options = [
				{
					poll_id: pollId,
					option: "It provides compile-time type checking",
					correct: true,
				},
				{
					poll_id: pollId,
					option: "It supports interfaces and type aliases",
					correct: false,
				},
				{
					poll_id: pollId,
					option: "It allows for generic types",
					correct: false,
				},
				{
					poll_id: pollId,
					option: "It requires a separate runtime library",
					correct: false,
				},
			];
		}
	} else if (
		question.includes("content-theft") ||
		question.toLowerCase().includes("general-frontend")
	) {
		if (question.includes("prevent visitors to steal")) {
			options = [
				{
					poll_id: pollId,
					option: "Disable right-click context menu",
					correct: true,
				},
				{
					poll_id: pollId,
					option: "Add watermarks to images",
					correct: false,
				},
				{
					poll_id: pollId,
					option: "Use Content Security Policy headers",
					correct: false,
				},
				{
					poll_id: pollId,
					option: "Encrypt HTML content",
					correct: false,
				},
			];
		}
	}

	// For questions about preferences, create appropriate options
	if (question.includes("favorite programming language")) {
		options = [
			{
				poll_id: pollId,
				option: "JavaScript",
				correct: answerType === "multiple",
			},
			{
				poll_id: pollId,
				option: "TypeScript",
				correct: answerType === "multiple",
			},
			{ poll_id: pollId, option: "Python", correct: false },
			{ poll_id: pollId, option: "Rust", correct: false },
		];
	} else if (question.includes("frontend framework")) {
		options = [
			{
				poll_id: pollId,
				option: "React",
				correct: answerType === "multiple",
			},
			{
				poll_id: pollId,
				option: "Vue",
				correct: answerType === "multiple",
			},
			{ poll_id: pollId, option: "Angular", correct: false },
			{ poll_id: pollId, option: "Svelte", correct: false },
		];
	} else if (question.includes("use TypeScript")) {
		options = [
			{
				poll_id: pollId,
				option: "Yes, for all projects",
				correct: answerType === "multiple",
			},
			{
				poll_id: pollId,
				option: "Yes, for larger projects only",
				correct: answerType === "multiple",
			},
			{
				poll_id: pollId,
				option: "No, I prefer plain JavaScript",
				correct: false,
			},
			{
				poll_id: pollId,
				option: "I'm still learning it",
				correct: false,
			},
		];
	} else if (question.includes("write tests")) {
		options = [
			{
				poll_id: pollId,
				option: "For every feature",
				correct: answerType === "multiple",
			},
			{
				poll_id: pollId,
				option: "Only for critical functionality",
				correct: answerType === "multiple",
			},
			{ poll_id: pollId, option: "Rarely", correct: false },
			{ poll_id: pollId, option: "Never", correct: false },
		];
	} else if (question.includes("CSS solution")) {
		options = [
			{
				poll_id: pollId,
				option: "Plain CSS",
				correct: answerType === "multiple",
			},
			{
				poll_id: pollId,
				option: "Tailwind CSS",
				correct: answerType === "multiple",
			},
			{ poll_id: pollId, option: "CSS-in-JS", correct: false },
			{ poll_id: pollId, option: "SASS/SCSS", correct: false },
		];
	}

	return options;
}

// Execute the seed function
seedDatabase();
