import type { Poll, PollRecord } from "./poll.model";

export const createMockPoll = (overrides: Partial<Poll> = {}): Poll => ({
	id: 1,
	question: "What is your favorite programming language?",
	status: "published",
	answerType: "single",
	openingTime: new Date("2025-01-01T00:00:00Z"),
	closingTime: new Date("2025-01-31T23:59:59Z"),
	createdBy: "123e4567-e89b-12d3-a456-426614174000",
	createdAt: new Date("2025-01-01T00:00:00Z"),
	updatedAt: new Date("2025-01-01T00:00:00Z"),
	categoryCode: "js",
	codeBlock: null,
	codeSandboxExample: null,
	pollNumber: null,
	explanation: null,
	...overrides,
});

export const createMockPollRecord = (
	overrides: Partial<PollRecord> = {}
): PollRecord => ({
	id: 1,
	question: "What is your favorite programming language?",
	status: "published",
	answer_type: "single",
	opening_time: new Date("2025-01-01T00:00:00Z"),
	closing_time: new Date("2025-01-31T23:59:59Z"),
	created_by: "123e4567-e89b-12d3-a456-426614174000",
	created_at: new Date("2025-01-01T00:00:00Z"),
	updated_at: new Date("2025-01-01T00:00:00Z"),
	category_code: "js",
	code_sandbox_example: null,
	code_block: null,
	poll_number: null,
	explanation: null,
	...overrides,
});

export const createMockPollArray = (count: number = 3): Poll[] =>
	Array.from({ length: count }, (_, i) => createMockPoll({ id: i + 1 }));
