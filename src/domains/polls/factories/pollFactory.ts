import { createMockDataFactory } from "@/src/test/createMockDataFactory";
import { Poll, PollRecord } from "@/src/domains/polls/api/schema";
import { InferInsertModel } from "drizzle-orm";
import { pollsTable } from "@/src/database/schema";

/**
 * Factory for creating mock Poll DTOs for testing and development
 */
export const createMockPoll = createMockDataFactory<Poll>({
	id: 1,
	question: "What is your favorite programming language?",
	status: "open",
	answerType: "single",
	openingTime: new Date("2025-01-01T00:00:00Z"),
	closingTime: new Date("2025-01-31T23:59:59Z"),
	createdBy: "123e4567-e89b-12d3-a456-426614174000",
	createdAt: new Date("2025-01-01T00:00:00Z"),
	updatedAt: new Date("2025-01-01T00:00:00Z"),
	categoryCode: "js",
});

/**
 * Factory for creating mock PollRecord objects (database format) for testing
 */
export const createMockPollRecord = createMockDataFactory<PollRecord>({
	id: 1,
	question: "What is your favorite programming language?",
	status: "open",
	answer_type: "single",
	opening_time: new Date("2025-01-01T00:00:00Z"),
	closing_time: new Date("2025-01-31T23:59:59Z"),
	created_by: "123e4567-e89b-12d3-a456-426614174000",
	created_at: new Date("2025-01-01T00:00:00Z"),
	updated_at: new Date("2025-01-01T00:00:00Z"),
	category_code: "js",
});

/**
 * Factory for creating database insert model objects for seeding
 */
export const createSeedPoll = createMockDataFactory<
	InferInsertModel<typeof pollsTable>
>({
	question: "What is your favorite programming language?",
	status: "open",
	answer_type: "single",
	opening_time: new Date(),
	closing_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
	created_by: "123e4567-e89b-12d3-a456-426614174000",
	created_at: new Date(),
	updated_at: new Date(),
	category_code: "js",
});

/**
 * Common poll questions that can be used for both testing and seeding
 */
export const pollQuestions = [
	"What is your favorite programming language?",
	"Which frontend framework do you prefer?",
	"Do you use TypeScript?",
	"How often do you write tests?",
	"What is your preferred CSS solution?",
	"What's your approach to responsive design?",
	"How do you handle state management in React?",
	"What's your preferred method for styling components?",
	"How do you optimize web performance?",
	"What testing strategies do you employ?",
	"How do you approach accessibility in your projects?",
	"What's your preferred deployment strategy?",
];

/**
 * Helper to create an array of mock polls with different questions
 */
export const createMockPollArray = (count: number = 3): Poll[] => {
	return Array.from({ length: count }, (_, i) =>
		createMockPoll({
			id: i + 1,
			question: pollQuestions[i % pollQuestions.length],
			categoryCode: i % 2 === 0 ? "js" : "typescript",
		})
	);
};

/**
 * Helper to create an array of mock poll records with different questions
 */
export const createMockPollRecordArray = (count: number = 3): PollRecord[] => {
	return Array.from({ length: count }, (_, i) =>
		createMockPollRecord({
			id: i + 1,
			question: pollQuestions[i % pollQuestions.length],
			category_code: i % 2 === 0 ? "js" : "typescript",
		})
	);
};

/**
 * Helper to create an array of seed poll records with different questions
 * This is specifically designed for database seeding
 */
export const createSeedPollArray = (
	count: number = 3,
	userId: string = "123e4567-e89b-12d3-a456-426614174000"
): Array<InferInsertModel<typeof pollsTable>> => {
	const categories = ["css", "js", "react", "typescript", "general-frontend"];

	return Array.from({ length: count }, (_, i) =>
		createSeedPoll({
			question: pollQuestions[i % pollQuestions.length],
			created_by: userId,
			category_code: categories[i % categories.length],
			answer_type: i % 2 === 0 ? "single" : "multiple",
		})
	);
};
