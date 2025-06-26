import { createMockDataFactory } from "@/src/test/createMockDataFactory";
import {
	PollOption,
	PollOptionsRecord,
} from "@/src/domains/polls/pollOptionsDto";
import { InferInsertModel } from "drizzle-orm";
import { pollOptionsTable } from "@/src/database/schema";

const pollOption: PollOption = {
	id: 1,
	pollId: 1,
	option: "JavaScript",
	isCorrect: true,
};

const pollOptionRecord: PollOptionsRecord = {
	id: 1,
	poll_id: 1,
	option: "JavaScript",
	is_correct: true,
};

export const createMockPollOption =
	createMockDataFactory<PollOption>(pollOption);

/**
 * Factory for creating mock PollOptionsRecord objects (database format) for testing
 */
export const createMockPollOptionRecord =
	createMockDataFactory<PollOptionsRecord>(pollOptionRecord);

/**
 * Factory for creating database insert model objects for seeding
 */
export const createSeedPollOption =
	createMockDataFactory<InferInsertModel<typeof pollOptionsTable>>(
		pollOptionRecord
	);

/**
 * Common poll options that can be used for both testing and seeding
 */
export const pollOptionsForLanguages = [
	"JavaScript",
	"TypeScript",
	"Python",
	"Java",
	"C#",
	"Go",
	"Rust",
	"PHP",
	"Ruby",
	"Swift",
];
export const pollOptionsForCSSProperties = [
	"flex-wrap",
	"line-height",
	"position",
	"display",
	"margin",
	"padding",
	"border",
	"box-sizing",
	"transform",
	"transition",
];

/**
 * Helper to create an array of mock poll options for a specific poll
 */
export const createMockPollOptionArray = (
	pollId: number,
	count: number = 4
): PollOption[] => {
	const options = pollOptionsForLanguages.slice(0, count);

	return options.map((option, i) =>
		createMockPollOption({
			id: i + 1,
			pollId,
			option,
			isCorrect: i === 0, // First option is correct by default
		})
	);
};

/**
 * Helper to create an array of mock poll option records for a specific poll
 */
export const createMockPollOptionRecordArray = (
	pollId: number,
	count: number = 4
): PollOptionsRecord[] => {
	const options = pollOptionsForLanguages.slice(0, count);

	return options.map((option, i) =>
		createMockPollOptionRecord({
			id: i + 1,
			poll_id: pollId,
			option,
			is_correct: i === 0, // First option is correct by default
		})
	);
};

/**
 * Helper to create an array of seed poll option records for a specific poll
 * This is specifically designed for database seeding
 */
export const createSeedPollOptionArray = (
	pollId: number,
	count: number = 4
): Array<InferInsertModel<typeof pollOptionsTable>> => {
	// Get appropriate options based on the question
	const options = pollOptionsForLanguages.slice(0, count);

	return options.map((option, i) =>
		createSeedPollOption({
			poll_id: pollId,
			option,
			is_correct: i === 0, // First option is correct by default
		})
	);
};
