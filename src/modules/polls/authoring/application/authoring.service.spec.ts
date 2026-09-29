import { beforeEach, describe, expect, it, vi } from "vitest";

import * as authoringRepository from "~/modules/polls/authoring/infrastructure/authoring.repository";
import { createMockPoll } from "~/modules/polls/poll/domain/poll.factory";

import { createPollService } from "./authoring.service";

vi.mock(
	"~/modules/polls/authoring/infrastructure/authoring.repository",
	() => ({
		createPollWithOptions: vi.fn(),
		updatePollWithOptions: vi.fn(),
	})
);

const BROCK = "123e4567-e89b-12d3-a456-426614174000";

const suggestion = {
	poll: {
		question: "What does `flex: 1` expand to?",
		status: "draft" as const,
		answerType: "single" as const,
		categoryCode: "css",
		explanation: "`flex: 1` is `1 1 0%`.",
	},
	options: [
		{ option: "1 1 0%", correct: true },
		{ option: "1 1 auto", correct: false },
		{ option: "1 0 0%", correct: false },
	],
};

beforeEach(() => {
	vi.clearAllMocks();
	vi.mocked(authoringRepository.createPollWithOptions).mockResolvedValue(
		createMockPoll()
	);
});

describe("createPollService", () => {
	it("hands the explanation to the repository", async () => {
		await createPollService({ ...suggestion, createdBy: BROCK });

		expect(authoringRepository.createPollWithOptions).toHaveBeenCalledWith(
			expect.objectContaining({
				explanation: "`flex: 1` is `1 1 0%`.",
				createdBy: BROCK,
			}),
			suggestion.options
		);
	});

	it("writes no explanation as null", async () => {
		await createPollService({
			...suggestion,
			poll: { ...suggestion.poll, explanation: undefined },
			createdBy: BROCK,
		});

		expect(authoringRepository.createPollWithOptions).toHaveBeenCalledWith(
			expect.objectContaining({ explanation: null }),
			suggestion.options
		);
	});

	it("refuses a suggestion with no right answer before the repository sees it", async () => {
		const result = await createPollService({
			...suggestion,
			options: suggestion.options.map((option) => ({
				...option,
				correct: false,
			})),
			createdBy: BROCK,
		});

		expect(result.success).toBe(false);
		expect(authoringRepository.createPollWithOptions).not.toHaveBeenCalled();
	});
});
