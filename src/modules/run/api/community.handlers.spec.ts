import { beforeEach, describe, expect, it, vi } from "vitest";

import { createMockRunRecord } from "~/domains/runs/models/run.mock";
import { TEST_DATES } from "~/test/kanto";

import { getRunCommunityHandler } from "./community.handlers";
import * as communityQueries from "./community.queries";
import type { SessionAnswerRow } from "./community.queries";
import * as queries from "./queries";

vi.mock("./community.queries", () => ({
	fetchConsumedPollsForDay: vi.fn(),
	fetchDailySeedCreatedAt: vi.fn(),
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
		categoryCode: "ts",
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
		categoryCode: "ts",
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
		categoryCode: "ts",
		answerType: "single" as const,
		options: [
			{ id: 121, label: "Pallet Town", correct: true },
			{ id: 122, label: "Cerulean City", correct: false },
		],
	},
];

/** Today's seed dropped at 09:00; answer times build on it. */
const SEED_DROP = new Date(`${TEST_DATES.birthday}T09:00:00Z`);
const minutesAfterDrop = (minutes: number): Date =>
	new Date(SEED_DROP.getTime() + minutes * 60_000);

const answerRow = (
	over: Partial<SessionAnswerRow> &
		Pick<
			SessionAnswerRow,
			"responseId" | "pollId" | "userId" | "displayName" | "optionId"
		>
): SessionAnswerRow => ({
	categoryCode: "ts",
	answeredAt: minutesAfterDrop(30),
	answerTimeMs: null,
	photoUrl: null,
	...over,
});

const answerRows = [
	// Red answered poll 10 first (1m45 after the drop) and fastest (9s).
	answerRow({
		responseId: 1,
		pollId: 10,
		userId: RED,
		displayName: "Red",
		optionId: 101,
		answeredAt: minutesAfterDrop(1.75),
		answerTimeMs: 9_000,
	}),
	answerRow({
		responseId: 2,
		pollId: 10,
		userId: BLUE,
		displayName: "Blue",
		optionId: 102,
		answerTimeMs: 30_000,
	}),
	answerRow({
		responseId: 3,
		pollId: 10,
		userId: GREEN,
		displayName: "Green",
		optionId: 101,
	}),
	answerRow({
		responseId: 4,
		pollId: 11,
		userId: RED,
		displayName: "Red",
		optionId: 111,
	}),
	answerRow({
		responseId: 5,
		pollId: 11,
		userId: BLUE,
		displayName: "Blue",
		optionId: 111,
	}),
	answerRow({
		responseId: 5,
		pollId: 11,
		userId: BLUE,
		displayName: "Blue",
		optionId: 112,
	}),
	answerRow({
		responseId: 6,
		pollId: 11,
		userId: GREEN,
		displayName: "Green",
		optionId: 113,
	}),
	answerRow({
		responseId: 7,
		pollId: 12,
		userId: BLUE,
		displayName: "Blue",
		optionId: 121,
	}),
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
	vi.mocked(communityQueries.fetchDailySeedCreatedAt).mockResolvedValue(
		SEED_DROP
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

	it("breaks each poll down per option: count, percent, and who picked it", async () => {
		arrange();

		const result = await getRunCommunityHandler({ userId: RED, date: DATE });

		expect(result.success).toBe(true);
		if (!result.success) return;
		const [first] = result.data.polls;

		expect(first.outcome).toBe("correct");
		expect(first.detail?.answeredCount).toBe(3);
		expect(first.detail?.gotItRightCount).toBe(2); // red + green
		expect(first.detail?.youGotItRight).toBe(true);
		expect(first.detail?.options).toEqual([
			{
				label: "Guild.members",
				isRight: true,
				count: 2,
				percent: 67,
				yours: true,
				voters: [
					{ id: RED, displayName: "Red", photoUrl: null, you: true },
					{ id: GREEN, displayName: "Green", photoUrl: null, you: false },
				],
			},
			{
				label: "Guild[0]",
				isRight: false,
				count: 1,
				percent: 33,
				yours: false,
				voters: [{ id: BLUE, displayName: "Blue", photoUrl: null, you: false }],
			},
			{
				label: "Guild.at(0)",
				isRight: false,
				count: 0,
				percent: 0,
				yours: false,
				voters: [],
			},
		]);
	});

	it("marks a partial multi-answer; each picked option counts its own voters", async () => {
		arrange();

		const result = await getRunCommunityHandler({ userId: RED, date: DATE });

		expect(result.success).toBe(true);
		if (!result.success) return;
		const multi = result.data.polls[1];

		expect(multi.outcome).toBe("partial");
		expect(multi.detail?.gotItRightCount).toBe(1); // only Blue's exact set
		expect(multi.detail?.youGotItRight).toBe(false);
		expect(
			multi.detail?.options.map((option) => [option.label, option.count])
		).toEqual([
			["Talon Trot", 2], // red + blue
			["Beak Barge", 1], // blue
			["Falcon Punch", 1], // green
		]);
	});

	it("puts the viewer first among an option's voters", async () => {
		arrange();

		const result = await getRunCommunityHandler({ userId: GREEN, date: DATE });

		expect(result.success).toBe(true);
		if (!result.success) return;
		const [first] = result.data.polls;

		// Red answered before Green, but Green is the viewer here.
		expect(first.detail?.options[0].voters.map((voter) => voter.id)).toEqual([
			GREEN,
			RED,
		]);
		expect(first.detail?.options[0].voters[0].you).toBe(true);
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

	it("crowns the day's standouts: fastest answer, first to answer, most-category polls", async () => {
		arrange();

		const result = await getRunCommunityHandler({ userId: RED, date: DATE });

		expect(result.success).toBe(true);
		if (!result.success) return;

		expect(result.data.standouts).toEqual([
			{
				voter: { id: RED, displayName: "Red", photoUrl: null, you: true },
				title: "fastest answer",
				value: "9s", // 9_000ms, the only sub-30s timing
			},
			{
				voter: { id: RED, displayName: "Red", photoUrl: null, you: true },
				title: "first to answer",
				value: "1m45", // answered 1.75 minutes after the seed dropped
			},
			{
				voter: { id: BLUE, displayName: "Blue", photoUrl: null, you: false },
				title: "most TypeScript polls",
				value: "3", // Blue answered all three ts-coded polls
			},
		]);
	});

	it("skips the fastest-answer standout when no answer carries a timing", async () => {
		arrange();
		vi.mocked(communityQueries.fetchSessionAnswersForDay).mockResolvedValue(
			answerRows.map((row) => ({ ...row, answerTimeMs: null }))
		);

		const result = await getRunCommunityHandler({ userId: RED, date: DATE });

		expect(result.success).toBe(true);
		if (!result.success) return;
		expect(result.data.standouts.map((standout) => standout.title)).toEqual([
			"first to answer",
			"most TypeScript polls",
		]);
	});

	it("never exposes raw option correct flags in the payload", async () => {
		arrange();

		const result = await getRunCommunityHandler({ userId: RED, date: DATE });

		expect(result.success).toBe(true);
		if (!result.success) return;
		expect(JSON.stringify(result.data)).not.toContain('"correct":');
	});
});
