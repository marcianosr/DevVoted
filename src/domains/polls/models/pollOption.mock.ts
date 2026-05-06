import type { PollOption, PollOptionRecord } from "./pollOption.model";

export const createMockPollOption = (
	overrides: Partial<PollOption> = {}
): PollOption => ({
	id: 1,
	pollId: 1,
	option: "JavaScript",
	correct: true,
	...overrides,
});

export const createMockPollOptionRecord = (
	overrides: Partial<PollOptionRecord> = {}
): PollOptionRecord => ({
	id: 1,
	poll_id: 1,
	option: "JavaScript",
	correct: true,
	...overrides,
});

export const createMockPollOptionArray = (
	pollId: number,
	count: number = 4
): PollOption[] =>
	Array.from({ length: count }, (_, i) =>
		createMockPollOption({ id: i + 1, pollId, correct: i === 0 })
	);
