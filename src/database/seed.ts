import { db } from "@/src/database/db";
import {
	pollsTable,
	pollCategoriesTable,
	usersTable,
	pollOptionsTable,
} from "@/src/database/schema";
import { eq } from "drizzle-orm";
import { createSeedPollArray } from "@/src/domains/polls/factories/pollFactory";

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

	const categories = [
		{ name: "CSS", code: "css" },
		{ name: "JavaScript", code: "js" },
		{ name: "React", code: "react" },
		{ name: "TypeScript", code: "typescript" },
		{ name: "General Frontend", code: "general-frontend" },
	];

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

		// Create 12 polls using our factory
		const polls = createSeedPollArray(20, DEV_UID);

		// Ensure we have a good mix of categories
		const categoryDistribution = {
			css: 5,
			js: 2,
			react: 2,
			typescript: 2,
			"general-frontend": 1,
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
				const options = generatePollOptions(poll.id, poll.question);
				await db.insert(pollOptionsTable).values(options);
				totalOptionsCreated += options.length;
			}

			console.log(
				`✅ Successfully seeded ${totalOptionsCreated} poll options!`
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
 * @returns An array of poll option objects
 */
function generatePollOptions(pollId: number, question: string) {
	// Default options for generic questions
	let options = [
		{ poll_id: pollId, option: "Option A", is_correct: true },
		{ poll_id: pollId, option: "Option B", is_correct: false },
		{ poll_id: pollId, option: "Option C", is_correct: false },
		{ poll_id: pollId, option: "Option D", is_correct: false },
	];

	// Generate more specific options based on the question content
	if (question.toLowerCase().includes("css")) {
		if (question.includes("*") && question.includes("selector")) {
			options = [
				{
					poll_id: pollId,
					option: "Selects all elements",
					is_correct: true,
				},
				{
					poll_id: pollId,
					option: "Can cause performance issues when overused",
					is_correct: true,
				},
				{
					poll_id: pollId,
					option: "Has the lowest specificity of any selector",
					is_correct: true,
				},
				{
					poll_id: pollId,
					option: "Only works in modern browsers",
					is_correct: false,
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
					is_correct: true,
				},
				{
					poll_id: pollId,
					option: "flex-direction: column",
					is_correct: false,
				},
				{
					poll_id: pollId,
					option: "flex-flow: row",
					is_correct: false,
				},
				{
					poll_id: pollId,
					option: "flex-basis: auto",
					is_correct: false,
				},
			];
		} else if (
			question.includes("vertical spacing") &&
			question.includes("text")
		) {
			options = [
				{ poll_id: pollId, option: "line-height", is_correct: true },
				{
					poll_id: pollId,
					option: "letter-spacing",
					is_correct: false,
				},
				{ poll_id: pollId, option: "text-indent", is_correct: false },
				{
					poll_id: pollId,
					option: "vertical-align",
					is_correct: false,
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
					is_correct: true,
				},
				{
					poll_id: pollId,
					option: "position: fixed",
					is_correct: true,
				},
				{
					poll_id: pollId,
					option: "position: relative",
					is_correct: false,
				},
				{
					poll_id: pollId,
					option: "position: static",
					is_correct: false,
				},
			];
		}
	} else if (
		question.toLowerCase().includes("js") ||
		question.toLowerCase().includes("javascript")
	) {
		if (question.includes("closures")) {
			options = [
				{
					poll_id: pollId,
					option: "They retain access to their outer function's scope",
					is_correct: true,
				},
				{
					poll_id: pollId,
					option: "They help create private variables",
					is_correct: true,
				},
				{
					poll_id: pollId,
					option: "They can lead to memory leaks if not handled properly",
					is_correct: true,
				},
				{
					poll_id: pollId,
					option: "They are only available in ES6 and later",
					is_correct: false,
				},
			];
		}
	} else if (question.toLowerCase().includes("react")) {
		if (question.includes("synthetic events")) {
			options = [
				{
					poll_id: pollId,
					option: "They provide cross-browser compatibility",
					is_correct: true,
				},
				{
					poll_id: pollId,
					option: "They improve performance through event pooling",
					is_correct: true,
				},
				{
					poll_id: pollId,
					option: "They follow the W3C spec",
					is_correct: true,
				},
				{
					poll_id: pollId,
					option: "They only work with functional components",
					is_correct: false,
				},
			];
		}
	} else if (
		question.toLowerCase().includes("typescript") ||
		question.toLowerCase().includes("ts")
	) {
		if (question.includes("type system")) {
			options = [
				{
					poll_id: pollId,
					option: "It provides compile-time type checking",
					is_correct: true,
				},
				{
					poll_id: pollId,
					option: "It supports interfaces and type aliases",
					is_correct: true,
				},
				{
					poll_id: pollId,
					option: "It allows for generic types",
					is_correct: true,
				},
				{
					poll_id: pollId,
					option: "It requires a separate runtime library",
					is_correct: false,
				},
			];
		}
	} else if (
		question.includes("content-theft") ||
		question.toLowerCase().includes("frontend")
	) {
		if (question.includes("prevent visitors to steal")) {
			options = [
				{
					poll_id: pollId,
					option: "Disable right-click context menu",
					is_correct: true,
				},
				{
					poll_id: pollId,
					option: "Add watermarks to images",
					is_correct: true,
				},
				{
					poll_id: pollId,
					option: "Use Content Security Policy headers",
					is_correct: true,
				},
				{
					poll_id: pollId,
					option: "Encrypt HTML content",
					is_correct: false,
				},
			];
		}
	}

	// For questions about preferences, create appropriate options
	if (question.includes("favorite programming language")) {
		options = [
			{ poll_id: pollId, option: "JavaScript", is_correct: false },
			{ poll_id: pollId, option: "TypeScript", is_correct: false },
			{ poll_id: pollId, option: "Python", is_correct: false },
			{ poll_id: pollId, option: "Rust", is_correct: false },
		];
	} else if (question.includes("frontend framework")) {
		options = [
			{ poll_id: pollId, option: "React", is_correct: false },
			{ poll_id: pollId, option: "Vue", is_correct: false },
			{ poll_id: pollId, option: "Angular", is_correct: false },
			{ poll_id: pollId, option: "Svelte", is_correct: false },
		];
	} else if (question.includes("use TypeScript")) {
		options = [
			{
				poll_id: pollId,
				option: "Yes, for all projects",
				is_correct: false,
			},
			{
				poll_id: pollId,
				option: "Yes, for larger projects only",
				is_correct: false,
			},
			{
				poll_id: pollId,
				option: "No, I prefer plain JavaScript",
				is_correct: false,
			},
			{
				poll_id: pollId,
				option: "I'm still learning it",
				is_correct: false,
			},
		];
	} else if (question.includes("write tests")) {
		options = [
			{ poll_id: pollId, option: "For every feature", is_correct: false },
			{
				poll_id: pollId,
				option: "Only for critical functionality",
				is_correct: false,
			},
			{ poll_id: pollId, option: "Rarely", is_correct: false },
			{ poll_id: pollId, option: "Never", is_correct: false },
		];
	} else if (question.includes("CSS solution")) {
		options = [
			{ poll_id: pollId, option: "Plain CSS", is_correct: false },
			{ poll_id: pollId, option: "Tailwind CSS", is_correct: false },
			{ poll_id: pollId, option: "CSS-in-JS", is_correct: false },
			{ poll_id: pollId, option: "SASS/SCSS", is_correct: false },
		];
	}

	return options;
}

// Execute the seed function
seedDatabase();
