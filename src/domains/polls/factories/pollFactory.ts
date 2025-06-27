import { createMockDataFactory } from "@/src/test/createMockDataFactory";
import { Poll, PollRecord } from "~/domains/polls/dto";
import { InferInsertModel } from "drizzle-orm";
import { pollsTable } from "@/src/database/schema";

const poll: Poll = {
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
};

const pollRecord: PollRecord = {
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
};

// For seeding, we need a version without ID to let the database auto-generate it
const seedPollRecord: Omit<PollRecord, "id"> = {
	question: "What is your favorite programming language?",
	status: "open",
	answer_type: "single",
	opening_time: new Date("2025-01-01T00:00:00Z"),
	closing_time: new Date("2025-01-31T23:59:59Z"),
	created_by: "123e4567-e89b-12d3-a456-426614174000",
	created_at: new Date("2025-01-01T00:00:00Z"),
	updated_at: new Date("2025-01-01T00:00:00Z"),
	category_code: "js",
};

export const createMockPoll = createMockDataFactory<Poll>(poll);

/**
 * Factory for creating mock PollRecord objects (database format) for testing
 */
export const createMockPollRecord =
	createMockDataFactory<PollRecord>(pollRecord);

/**
 * Factory for creating database insert model objects for seeding
 */
export const createSeedPoll =
	createMockDataFactory<Omit<InferInsertModel<typeof pollsTable>, "id">>(
		seedPollRecord
	);

/**
 * Common poll questions that can be used for both testing and seeding
 */
export const pollQuestions = [
	'In CSS, the "*" selector does exist, what effects of this selector can you list?',
	"In JS, closures are there, what do you know about it, can you share?",
	"In React, development goes rapid, synthetic events are built-in, do you know why they are added?",
	"In Frontend, content-theft is real, what approach can be used to prevent visitors to steal?",
	"In TS, the type system is very strict, what do you know about it, can you share?",
	"For CSS devs this might be a no-brainer, but what flex property makes sure items are forced on multiple lines when they don't fit their container?",
	"In CSS, for readability it's important to have vertical spacing for text inbetween, what property do you use that make your text look neat and clean?",
	"In CSS, the position property was implemented long ago, which values from below remove the elements out of the document flow?",
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
): Array<Omit<InferInsertModel<typeof pollsTable>, "id">> => {
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
