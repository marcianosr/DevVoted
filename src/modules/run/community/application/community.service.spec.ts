import { beforeEach, describe, expect, it, vi } from "vitest";

import { createMockRunRecord } from "~/domains/runs/models/run.mock";
import { TEST_DATES } from "~/test/kanto";

import * as climbQueries from "~/modules/run/community/infrastructure/climbers.repository";
import { getRunCommunityService } from "~/modules/run/community/application/community.service";
import * as communityQueries from "~/modules/run/community/infrastructure/community.repository";
import type { SessionAnswerRow } from "~/modules/run/community/infrastructure/community.repository";
import * as queries from "~/modules/run/run/infrastructure/run.repository";

vi.mock("~/modules/run/community/infrastructure/community.repository", () => ({
	fetchConsumedPollsForDay: vi.fn(),
	fetchDailySeedCreatedAt: vi.fn(),
	fetchPollsWithOptions: vi.fn(),
	fetchRunProgress: vi.fn(),
	fetchSessionAnswersForDay: vi.fn(),
}));

vi.mock("~/modules/run/run/infrastructure/run.repository", () => ({
	findActiveSessionRun: vi.fn(),
	findSessionRunByDate: vi.fn(),
}));

vi.mock("~/modules/run/community/infrastructure/climbers.repository", () => ({
	fetchActiveClimbers: vi.fn(),
	fetchActiveRunStats: vi.fn(),
	fetchClimbMarker: vi.fn(),
	fetchFallenToday: vi.fn(),
	fetchPersonalBestPosition: vi.fn(),
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

/** Climb map fixture: Red (the usual viewer) mid-Soul, Blue ahead, Green well back. */
const RED_AT = { gate: 6, pollsIntoGate: 3 };
const CLIMBERS = [
	{ userId: RED, displayName: "Red", photoUrl: null, ...RED_AT },
	{
		userId: BLUE,
		displayName: "Blue",
		photoUrl: null,
		gate: 7,
		pollsIntoGate: 1,
	},
	{
		userId: GREEN,
		displayName: "Green",
		photoUrl: null,
		gate: 2,
		pollsIntoGate: 4,
	},
];
const FALLEN = [
	{
		runId: 11,
		userId: "koga",
		displayName: "Koga",
		photoUrl: null,
		gate: 3,
		pollsIntoGate: 2,
	},
	{
		runId: 12,
		userId: "janine",
		displayName: null,
		photoUrl: null,
		gate: 5,
		pollsIntoGate: 0,
	},
];

/** Live-run standings behind the run-scoped awards. Blue is the deepest and widest. */
const RUN_STATS = [
	{
		userId: RED,
		displayName: "Red",
		photoUrl: null,
		gatesCleared: 6,
		coverage: 12.5,
		configCount: 3,
		outcomes: ["correct", "correct", "wrong"] as const,
		streak: 0,
	},
	{
		userId: BLUE,
		displayName: "Blue",
		photoUrl: null,
		gatesCleared: 7,
		coverage: 21.44,
		configCount: 7,
		outcomes: ["correct", "correct", "correct", "correct"] as const,
		streak: 4,
	},
];

const arrangeClimb = () => {
	vi.mocked(climbQueries.fetchActiveRunStats).mockResolvedValue(
		RUN_STATS.map((row) => ({ ...row, outcomes: [...row.outcomes] }))
	);
	vi.mocked(climbQueries.fetchClimbMarker).mockResolvedValue(RED_AT);
	vi.mocked(climbQueries.fetchActiveClimbers).mockResolvedValue(CLIMBERS);
	vi.mocked(climbQueries.fetchFallenToday).mockResolvedValue(FALLEN);
	vi.mocked(climbQueries.fetchPersonalBestPosition).mockResolvedValue(31);
};

const arrange = () => {
	arrangeClimb();
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

describe("getRunCommunityService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns an empty view when the viewer has no run at all", async () => {
		vi.mocked(queries.findActiveSessionRun).mockResolvedValue(null);
		vi.mocked(queries.findSessionRunByDate).mockResolvedValue(null);

		const result = await getRunCommunityService({ userId: RED, date: DATE });

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.polls).toEqual([]);
			expect(result.data.topPercent).toBeNull();
		}
	});

	it("breaks each poll down per option: count, percent, and who picked it", async () => {
		arrange();

		const result = await getRunCommunityService({ userId: RED, date: DATE });

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

		const result = await getRunCommunityService({ userId: RED, date: DATE });

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

		const result = await getRunCommunityService({ userId: GREEN, date: DATE });

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

		const result = await getRunCommunityService({ userId: RED, date: DATE });

		expect(result.success).toBe(true);
		if (!result.success) return;
		const missed = result.data.polls[2];

		expect(missed.outcome).toBe("missed");
		expect(missed.detail).toBeNull();
		expect(JSON.stringify(missed)).not.toContain("Pallet Town");
	});

	it("computes the day percentile against everyone who climbed", async () => {
		arrange();

		const result = await getRunCommunityService({ userId: RED, date: DATE });

		expect(result.success).toBe(true);
		if (!result.success) return;

		expect(result.data.totalPlayers).toBe(3);
		// Blue (2 correct) beats Red (1 correct): ceil(2/3 * 100)
		expect(result.data.topPercent).toBe(67);
	});

	it("crowns the day's awards, today's before the climb's", async () => {
		arrange();

		const result = await getRunCommunityService({ userId: RED, date: DATE });

		expect(result.success).toBe(true);
		if (!result.success) return;
		expect(result.data.standouts.map((standout) => standout.title)).toEqual([
			"fastest answer",
			"first to answer",
			"first good",
			"most TypeScript polls",
			"only one right",
			"deepest gate",
			"longest streak",
			"most coverage",
			"widest pipeline",
		]);
	});

	it("reads the poll-scoped awards off today's answers", async () => {
		arrange();

		const result = await getRunCommunityService({ userId: RED, date: DATE });

		expect(result.success).toBe(true);
		if (!result.success) return;
		const byTitle = new Map(
			result.data.standouts.map((standout) => [standout.title, standout])
		);

		// 9_000ms, the only sub-30s timing.
		expect(byTitle.get("fastest answer")).toMatchObject({
			value: "9s",
			voter: { id: RED, you: true },
		});
		// Red answered 1.75 minutes after the seed dropped, and got it right.
		expect(byTitle.get("first to answer")?.value).toBe("1m45");
		expect(byTitle.get("first good")).toMatchObject({
			value: "1m45",
			voter: { id: RED },
		});
		// Blue answered all three ts-coded polls.
		expect(byTitle.get("most TypeScript polls")?.value).toBe("3");
	});

	it("names the poll only one player got right, from those the viewer has met", async () => {
		arrange();

		const result = await getRunCommunityService({ userId: RED, date: DATE });

		expect(result.success).toBe(true);
		if (!result.success) return;
		const lone = result.data.standouts.find(
			(standout) => standout.title === "only one right"
		);

		// Poll 12: Blue alone got it, and Red has consumed it.
		expect(lone).toMatchObject({
			value: "Which town has no gym?",
			voter: { id: BLUE, you: false },
		});
	});

	it("reads the run-scoped awards off live runs", async () => {
		arrange();

		const result = await getRunCommunityService({ userId: RED, date: DATE });

		expect(result.success).toBe(true);
		if (!result.success) return;
		const byTitle = new Map(
			result.data.standouts.map((standout) => [standout.title, standout])
		);

		expect(byTitle.get("deepest gate")).toMatchObject({
			value: "Marsh", // gate 7
			voter: { id: BLUE },
		});
		// Red's best was 2 before it broke; Blue ran four clean.
		expect(byTitle.get("longest streak")?.value).toBe("4");
		expect(byTitle.get("most coverage")?.value).toBe("+21.4%");
		expect(byTitle.get("widest pipeline")?.value).toBe("7 configs");
	});

	it("keeps the awards on a day the viewer has not answered anything", async () => {
		arrange();
		vi.mocked(communityQueries.fetchConsumedPollsForDay).mockResolvedValue([]);

		const result = await getRunCommunityService({ userId: RED, date: DATE });

		expect(result.success).toBe(true);
		if (!result.success) return;
		expect(result.data.polls).toEqual([]);
		// Run-scoped awards stand on live runs, not on today's answers.
		expect(result.data.standouts.map((standout) => standout.title)).toContain(
			"deepest gate"
		);
		// But nothing may name a poll the viewer has not reached.
		expect(
			result.data.standouts.map((standout) => standout.title)
		).not.toContain("only one right");
	});

	it("skips the fastest-answer award when no answer carries a timing", async () => {
		arrange();
		vi.mocked(communityQueries.fetchSessionAnswersForDay).mockResolvedValue(
			answerRows.map((row) => ({ ...row, answerTimeMs: null }))
		);

		const result = await getRunCommunityService({ userId: RED, date: DATE });

		expect(result.success).toBe(true);
		if (!result.success) return;
		expect(
			result.data.standouts.map((standout) => standout.title)
		).not.toContain("fastest answer");
	});

	it("never exposes raw option correct flags in the payload", async () => {
		arrange();

		const result = await getRunCommunityService({ userId: RED, date: DATE });

		expect(result.success).toBe(true);
		if (!result.success) return;
		expect(JSON.stringify(result.data)).not.toContain('"correct":');
	});
});

describe("getRunCommunityService climb map", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("places every live run on the map, ordered from the back of the field", async () => {
		arrange();

		const result = await getRunCommunityService({ userId: RED, date: DATE });

		expect(result.success).toBe(true);
		if (!result.success) return;
		expect(result.data.climb?.climbers).toEqual([
			{
				id: GREEN,
				displayName: "Green",
				photoUrl: null,
				gate: 2,
				pollsIntoGate: 4,
				you: false,
			},
			{
				id: RED,
				displayName: "Red",
				photoUrl: null,
				gate: 6,
				pollsIntoGate: 3,
				you: true,
			},
			{
				id: BLUE,
				displayName: "Blue",
				photoUrl: null,
				gate: 7,
				pollsIntoGate: 1,
				you: false,
			},
		]);
	});

	it("keeps the viewer on the map after their own run has died", async () => {
		arrange();
		vi.mocked(climbQueries.fetchActiveClimbers).mockResolvedValue(
			CLIMBERS.filter((climber) => climber.userId !== RED)
		);

		const result = await getRunCommunityService({ userId: RED, date: DATE });

		expect(result.success).toBe(true);
		if (!result.success) return;
		const you = result.data.climb?.climbers.filter((climber) => climber.you);
		expect(you).toEqual([
			{
				id: RED,
				displayName: "you",
				photoUrl: undefined,
				gate: 6,
				pollsIntoGate: 3,
				you: true,
			},
		]);
	});

	it("draws one marker per player when a user holds two live runs", async () => {
		arrange();
		vi.mocked(climbQueries.fetchActiveClimbers).mockResolvedValue([
			...CLIMBERS,
			{
				userId: BLUE,
				displayName: "Blue",
				photoUrl: null,
				gate: 1,
				pollsIntoGate: 0,
			},
		]);

		const result = await getRunCommunityService({ userId: RED, date: DATE });

		expect(result.success).toBe(true);
		if (!result.success) return;
		const blues = result.data.climb?.climbers.filter(
			(climber) => climber.id === BLUE
		);
		expect(blues).toHaveLength(1);
		expect(blues?.[0].gate).toBe(7); // the deeper of the two
	});

	it("marks where runs the gate killed today came to a stop, with who fell", async () => {
		arrange();

		const result = await getRunCommunityService({ userId: RED, date: DATE });

		expect(result.success).toBe(true);
		if (!result.success) return;
		expect(result.data.climb?.fallen).toEqual([
			{
				runId: 11,
				id: "koga",
				displayName: "Koga",
				photoUrl: null,
				gate: 3,
				pollsIntoGate: 2,
			},
			// A nameless account falls back to its id, so the avatar still draws.
			{
				runId: 12,
				id: "janine",
				displayName: "janine",
				photoUrl: null,
				gate: 5,
				pollsIntoGate: 0,
			},
		]);
	});

	it("carries the viewer's deepest finished run as their best", async () => {
		arrange();

		const result = await getRunCommunityService({ userId: RED, date: DATE });

		expect(result.success).toBe(true);
		if (!result.success) return;
		expect(result.data.climb?.bestPosition).toBe(31);
	});

	it("builds the map on a day with nothing answered yet", async () => {
		arrange();
		vi.mocked(communityQueries.fetchConsumedPollsForDay).mockResolvedValue([]);

		const result = await getRunCommunityService({ userId: RED, date: DATE });

		expect(result.success).toBe(true);
		if (!result.success) return;
		expect(result.data.polls).toEqual([]);
		expect(result.data.climb?.climbers).toHaveLength(3);
	});

	it("leaves the map off when the viewer has no run to stand on", async () => {
		vi.mocked(queries.findActiveSessionRun).mockResolvedValue(null);
		vi.mocked(queries.findSessionRunByDate).mockResolvedValue(null);

		const result = await getRunCommunityService({ userId: RED, date: DATE });

		expect(result.success).toBe(true);
		if (!result.success) return;
		expect(result.data.climb).toBeNull();
	});
});
