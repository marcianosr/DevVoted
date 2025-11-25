import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import {
	fetchAllPolls,
	fetchPollById,
	fetchPollByIdWithOptions,
	hasUserAnsweredPoll,
	createPollResponse,
} from "~/domains/polls/api/queries";
import { polls, pollsOptions, pollsResponses } from "~/database/schema";

// Create in-memory database for testing
const sqlite = new Database(":memory:");
const testDb = drizzle(sqlite);

// Setup: Run migrations to create schema
beforeEach(async () => {
	// Apply schema (in real app, you'd run migrations)
	await testDb.run(sql`
    CREATE TABLE IF NOT EXISTS polls (
      id INTEGER PRIMARY KEY,
      question TEXT NOT NULL,
      status TEXT NOT NULL,
      answer_type TEXT NOT NULL,
      category_code TEXT NOT NULL
    )
  `);

	await testDb.run(sql`
    CREATE TABLE IF NOT EXISTS polls_options (
      id INTEGER PRIMARY KEY,
      poll_id INTEGER NOT NULL,
      option TEXT NOT NULL,
      is_correct BOOLEAN NOT NULL
    )
  `);

	await testDb.run(sql`
    CREATE TABLE IF NOT EXISTS polls_responses (
      response_id INTEGER PRIMARY KEY,
      poll_id INTEGER NOT NULL,
      user_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

afterAll(() => {
	sqlite.close();
});

describe("Poll Queries - Integration Tests", () => {
	describe("fetchAllPolls", () => {
		it("returns all polls from database", async () => {
			// Insert test data
			await testDb.insert(polls).values([
				{
					id: 1,
					question: "What is React?",
					status: "active",
					answer_type: "single",
					category_code: "react",
				},
				{
					id: 2,
					question: "What is Vue?",
					status: "active",
					answer_type: "single",
					category_code: "vue",
				},
			]);

			// ✅ Test actual database behavior
			const result = await fetchAllPolls();

			expect(result).toHaveLength(2);
			expect(result[0].question).toBe("What is React?");
			expect(result[1].question).toBe("What is Vue?");
		});

		it("returns empty array when no polls exist", async () => {
			const result = await fetchAllPolls();
			expect(result).toEqual([]);
		});
	});

	describe("fetchPollByIdWithOptions", () => {
		it("returns poll with its options", async () => {
			// Insert poll and options
			await testDb.insert(polls).values({
				id: 1,
				question: "What year was JavaScript created?",
				status: "active",
				answer_type: "single",
				category_code: "js",
			});

			await testDb.insert(pollsOptions).values([
				{ poll_id: 1, option: "1995", is_correct: true },
				{ poll_id: 1, option: "1997", is_correct: false },
				{ poll_id: 1, option: "1999", is_correct: false },
			]);

			// ✅ Test real database relationships
			const result = await fetchPollByIdWithOptions(1);

			expect(result.poll.question).toBe("What year was JavaScript created?");
			expect(result.options).toHaveLength(3);
			expect(result.options[0].option).toBe("1995");
			expect(result.options[0].isCorrect).toBe(true);
		});

		it("throws error when poll not found", async () => {
			await expect(fetchPollByIdWithOptions(999)).rejects.toThrow(
				"Poll not found"
			);
		});
	});

	describe("hasUserAnsweredPoll", () => {
		it("returns false when user has not answered", async () => {
			const result = await hasUserAnsweredPoll(1, "pikachu");
			expect(result).toBe(false);
		});

		it("returns true when user answered today", async () => {
			// Insert poll
			await testDb.insert(polls).values({
				id: 25,
				question: "Test poll",
				status: "active",
				answer_type: "single",
				category_code: "js",
			});

			// Insert response from today
			await testDb.insert(pollsResponses).values({
				poll_id: 25,
				user_id: "pikachu",
				created_at: new Date(), // Today
			});

			// ✅ Test real date filtering logic
			const result = await hasUserAnsweredPoll(25, "pikachu");
			expect(result).toBe(true);
		});

		it("returns false when user only answered yesterday", async () => {
			const yesterday = new Date();
			yesterday.setDate(yesterday.getDate() - 1);

			await testDb.insert(polls).values({
				id: 6,
				question: "Old poll",
				status: "active",
				answer_type: "single",
				category_code: "css",
			});

			await testDb.insert(pollsResponses).values({
				poll_id: 6,
				user_id: "charizard",
				created_at: yesterday,
			});

			// ✅ Verifies the "same day" logic actually works
			const result = await hasUserAnsweredPoll(6, "charizard");
			expect(result).toBe(false);
		});
	});

	describe("createPollResponse", () => {
		it("creates response in transaction", async () => {
			await testDb.insert(polls).values({
				id: 1,
				question: "Test",
				status: "active",
				answer_type: "single",
				category_code: "js",
			});

			await testDb.insert(pollsOptions).values([
				{ id: 10, poll_id: 1, option: "A", is_correct: true },
				{ id: 20, poll_id: 1, option: "B", is_correct: false },
			]);

			// ✅ Test actual transaction behavior
			await createPollResponse({
				pollId: 1,
				userId: "banjo",
				selectedOptionIds: [10, 20],
			});

			// Verify data was actually inserted
			const responses = await testDb
				.select()
				.from(pollsResponses)
				.where(eq(pollsResponses.user_id, "banjo"));

			expect(responses).toHaveLength(1);
			expect(responses[0].poll_id).toBe(1);
		});
	});
});
