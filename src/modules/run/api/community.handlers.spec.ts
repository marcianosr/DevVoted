import { beforeEach, describe, expect, it, vi } from "vitest";

import { createMockRunRecord } from "~/domains/runs/models/run.mock";
import { TEST_DATES } from "~/test/kanto";

import { getRunCommunityHandler } from "./community.handlers";
import * as communityQueries from "./community.queries";
import * as queries from "./queries";

vi.mock("./community.queries", () => ({
	fetchConsumedPollsForDay: vi.fn(),
	fetchPollsWithOptions: vi.fn(),
	fetchRunProgress: vi.fn(),
	fetchSessionAnswersForDay: vi.fn(),
}));

vi.mock("./queries", () => ({
	findActiveSessionRun: vi.fn(),
	findSessionRunByDate: vi.fn(),
}));

const DATE = TEST_DATES.birthday;
const RED = "red";
const BLUE = "blue";
const GREEN = "green";

/**
 * Fixture day: three climbers, three polls.
 * - poll 10 (single, correct 101): red+green right, blue wrong
 * - poll 11 (multi, correct 111+112): blue exact, red partial (111), green wrong
 * - poll 12 (single, correct 121): blue right; red LINTED it (no response)
 */
const POLLS = [
	{
		id: 10,
		question: "What does Pluck<Guild> return?",
		answerType: "single" as const,
		options: [
			{ id: 101, label: "Guild.members", correct: true },
			{ id: 102, label: "Guild[0]", correct: false },
			{ id: 103, label: "Guild.at(0)", correct: false },
		],
	},
	{
		id: 11,
		question: "Which are Banjo-Kazooie moves?",
		answerType: "multiple" as const,
		options: [
			{ id: 111, label: "Talon Trot", correct: true },
			{ id: 112, label: "Beak Barge", correct: true },
			{ id: 113, label: "Falcon Punch", correct: false },
		],
	},
	{
		id: 12,
		question: "Which town has no gym?",
		answerType: "single" as const,
		options: [
			{ id: 121, label: "Pallet Town", correct: true },
			{ id: 122, label: "Cerulean City", correct: false },
		],
	},
];

const answerRows = [
	{ responseId: 1, pollId: 10, userId: RED, displayName: "Red", optionId: 101 },
	{
		responseId: 2,
		pollId: 10,
		userId: BLUE,
		displayName: "Blue",
		optionId: 102,
	},
	{
		responseId: 3,
		pollId: 10,
		userId: GREEN,
		displayName: "Green",
		optionId: 101,
	},
	{ responseId: 4, pollId: 11, userId: RED, displayName: "Red", optionId: 111 },
	{
		responseId: 5,
		pollId: 11,
		userId: BLUE,
		displayName: "Blue",
		optionId: 111,
	},
	{
		responseId: 5,
		pollId: 11,
		userId: BLUE,
		displayName: "Blue",
		optionId: 112,
	},
	{
		responseId: 6,
		pollId: 11,
		userId: GREEN,
		displayName: "Green",
		optionId: 113,
	},
	{
		responseId: 7,
		pollId: 12,
		userId: BLUE,
		displayName: "Blue",
		optionId: 121,
	},
];

const consumedForViewer = [
	{ position: 0, poll_id: 10 },
	{ position: 1, poll_id: 11 },
	{ position: 2, poll_id: 12 },
];

const arrange = () => {
	vi.mocked(queries.findActiveSessionRun).mockResolvedValue(
		createMockRunRecord({ id: 64, mode: "session", seed_date: DATE })
	);
	vi.mocked(communityQueries.fetchRunProgress).mockResolvedValue(3);
	vi.mocked(communityQueries.fetchConsumedPollsForDay).mockResolvedValue(
		consumedForViewer
	);
	vi.mocked(communityQueries.fetchSessionAnswersForDay).mockResolvedValue(
		answerRows
	);
	vi.mocked(communityQueries.fetchPollsWithOptions).mockResolvedValue(POLLS);
};

describe("getRunCommunityHandler", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns an empty view when the viewer has no run at all", async () => {
		vi.mocked(queries.findActiveSessionRun).mockResolvedValue(null);
		vi.mocked(queries.findSessionRunByDate).mockResolvedValue(null);

		const result = await getRunCommunityHandler({ userId: RED, date: DATE });

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.polls).toEqual([]);
			expect(result.data.topPercent).toBeNull();
		}
	});

	it("builds agreement and correctness percentages per consumed poll", async () => {
		arrange();

		const result = await getRunCommunityHandler({ userId: RED, date: DATE });

		expect(result.success).toBe(true);
		if (!result.success) return;
		const [first] = result.data.polls;

		expect(first.outcome).toBe("correct");
		expect(first.detail?.agreedPercent).toBe(67); // red + green of 3
		expect(first.detail?.gotItRightPercent).toBe(67);
		expect(first.detail?.gotItRightVoters.map((voter) => voter.id)).toEqual([
			RED,
			GREEN,
		]);
	});

	it("marks a partial multi-answer and groups voters by exact pick", async () => {
		arrange();

		const result = await getRunCommunityHandler({ userId: RED, date: DATE });

		expect(result.success).toBe(true);
		if (!result.success) return;
		const multi = result.data.polls[1];

		expect(multi.outcome).toBe("partial");
		expect(multi.detail?.gotItRightVoters.map((voter) => voter.id)).toEqual([
			BLUE,
		]);
		expect(multi.detail?.pickedYoursVoters.map((voter) => voter.id)).toEqual([
			RED,
		]);
	});

	it("reveals nothing for a linted poll — it may return in a later seed", async () => {
		arrange();

		const result = await getRunCommunityHandler({ userId: RED, date: DATE });

		expect(result.success).toBe(true);
		if (!result.success) return;
		const missed = result.data.polls[2];

		expect(missed.outcome).toBe("missed");
		expect(missed.detail).toBeNull();
		expect(JSON.stringify(missed)).not.toContain("Pallet Town");
	});

	it("computes the day percentile against everyone who climbed", async () => {
		arrange();

		const result = await getRunCommunityHandler({ userId: RED, date: DATE });

		expect(result.success).toBe(true);
		if (!result.success) return;

		expect(result.data.totalPlayers).toBe(3);
		// Blue (2 correct) beats Red (1 correct): ceil(2/3 * 100)
		expect(result.data.topPercent).toBe(67);
	});

	it("never exposes raw option correct flags in the payload", async () => {
		arrange();

		const result = await getRunCommunityHandler({ userId: RED, date: DATE });

		expect(result.success).toBe(true);
		if (!result.success) return;
		expect(JSON.stringify(result.data)).not.toContain('"correct":');
	});
});
