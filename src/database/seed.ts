import { db } from "@/src/database/db";
import {
	pollsTable,
	pollCategoriesTable,
	usersTable,
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

		// Generate poll data using our factory
		// We'll create a mix of our standard questions and some domain-specific ones
		const domainSpecificQuestions = [
			'In CSS, the "*" selector does exist, what effects of this selector can you list?',
			"In JS, closures are there, what do you know about it, can you share?",
			"In React, development goes rapid, synthetic events are built-in, do you know why they are added?",
			"In Frontend, content-theft is real, what approach can be used to prevent visitors to steal?",
			"In TS, the type system is very strict, what do you know about it, can you share?",
			"For CSS devs this might be a no-brainer, but what flex property makes sure items are forced on multiple lines when they don't fit their container?",
			"In CSS, for readability it's important to have vertical spacing for text inbetween, what property do you use that make your text look neat and clean?",
			"In CSS, the position property was implemented long ago, which values from below remove the elements out of the document flow?",
		];

		// Create 12 polls using our factory
		const polls = createSeedPollArray(20, DEV_UID);

		// Override some questions with domain-specific ones
		domainSpecificQuestions.forEach((question, index) => {
			if (index < polls.length) {
				polls[index].question = question;
			}
		});

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
			for (const poll of polls) {
				await db.insert(pollsTable).values(poll);
			}
			console.log(`✅ Successfully seeded ${polls.length} polls!`);
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
