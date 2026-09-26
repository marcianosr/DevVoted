import { beforeEach, describe, expect, it, vi } from "vitest";

import { createMockRunRecord } from "~/test/runRecord.factory";
import { TEST_DATES } from "~/test/kanto";

import * as climbQueries from "~/modules/run/community/infrastructure/climbers.repository";
import * as leaderQueries from "~/modules/run/run/infrastructure/categoryLeader.repository";
import { getRunCommunityService } from "~/modules/run/community/application/community.service";
import * as communityQueries from "~/modules/run/community/infrastructure/community.repository";
import type { SessionAnswerRow } from "~/modules/run/community/infrastructure/community.repository";
import * as queries from "~/modules/run/run/infrastructure/run.repository";

vi.mock("~/modules/run/community/infrastructure/community.repository", () => ({
	fetchConsumedPollsForDay: vi.fn(),
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
	fetchBestCategories: vi.fn(),
	fetchClimbMarker: vi.fn(),
	fetchFallenToday: vi.fn(),
	fetchPersonalBestPosition: vi.fn(),
}));

vi.mock("~/modules/run/run/infrastructure/categoryLeader.repository", () => ({
	fetchCategoryLeaders: vi.fn(),
}));

const DATE = TEST_DATES.birthday;
const RED = "red";
const BLUE = "blue";
const GREEN = "green";

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

const answerRow = (
	over: Partial<SessionAnswerRow> &
		Pick<
			SessionAnswerRow,
			"responseId" | "pollId" | "userId" | "displayName" | "optionId"
		>
): SessionAnswerRow => ({
	photoUrl: null,
	borderUrl: null,
	mirrored: false,
	...over,
});

const answerRows = [
	answerRow({
		responseId: 1,
		pollId: 10,
		userId: RED,
		displayName: "Red",
		optionId: 101,
	}),
	answerRow({
		responseId: 2,
		pollId: 10,
		userId: BLUE,
		displayName: "Blue",
		optionId: 102,
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

const standing = (
	over: {
		handle?: string;
		title?: string;
		coverageUnits?: number;
		streak?: number;
		storageKb?: number;
	} = {}
) => ({
	handle: null,
	title: null,
	coverageUnits: 0,
	streak: 0,
	storageKb: 0,
	...over,
	...(over.handle === undefined ? {} : { handle: over.handle }),
	...(over.title === undefined ? {} : { title: over.title }),
});

const RED_AT = { gate: 6, pollsIntoGate: 3 };
const RED_BUILD = {
	configs: [{ id: "ts", label: ".ts", slots: 1, level: 3 }],
	vendorLockedConfigId: "ts",
};
const BLUE_BUILD = {
	configs: [
		{ id: "cache", label: "Cache", slots: 4 },
		{ id: "eslint", label: "ESLint", slots: 1, level: 2 },
	],
};
const BARE_BUILD = { configs: [] };
const CLIMBERS = [
	{
		userId: RED,
		displayName: "Red",
		photoUrl: null,
		borderUrl: null,
		...RED_AT,
		build: RED_BUILD,
		closingBand: "shaky" as const,
		startedAtGate: 0,
		...standing({ handle: "red", title: "Completionist", coverageUnits: 24 }),
	},
	{
		userId: BLUE,
		displayName: "Blue",
		photoUrl: null,
		borderUrl: "/borders/x.png",
		gate: 7,
		pollsIntoGate: 1,
		build: BLUE_BUILD,
		closingBand: "perfect" as const,
		startedAtGate: 5,
		...standing({ streak: 6, storageKb: 896 }),
	},
	{
		userId: GREEN,
		displayName: "Green",
		photoUrl: null,
		borderUrl: null,
		gate: 2,
		pollsIntoGate: 4,
		build: BARE_BUILD,
		closingBand: null,
		startedAtGate: 0,
		...standing(),
	},
];
const FALLEN = [
	{
		runId: 11,
		userId: "koga",
		displayName: "Koga",
		photoUrl: null,
		borderUrl: null,
		gate: 3,
		pollsIntoGate: 2,
		build: BLUE_BUILD,
		closingBand: "danger" as const,
		startedAtGate: 0,
		...standing(),
	},
	{
		runId: 12,
		userId: "misty",
		displayName: null,
		photoUrl: null,
		borderUrl: null,
		gate: 5,
		pollsIntoGate: 0,
		build: BARE_BUILD,
		closingBand: null,
		startedAtGate: 3,
		...standing(),
	},
];

const SEATS = [
	{
		category: "js" as const,
		leader: { userId: "blue-id", handle: "@blue", streak: 21, you: false },
	},
	{
		category: "git" as const,
		leader: { userId: "red-id", handle: "@red", streak: 13, you: true },
	},
];

const arrangeClimb = () => {
	vi.mocked(leaderQueries.fetchCategoryLeaders).mockResolvedValue(
		SEATS.map((seat) => ({ ...seat }))
	);
	vi.mocked(climbQueries.fetchClimbMarker).mockResolvedValue(RED_AT);
	vi.mocked(climbQueries.fetchActiveClimbers).mockResolvedValue(CLIMBERS);
	vi.mocked(climbQueries.fetchFallenToday).mockResolvedValue(FALLEN);
	vi.mocked(climbQueries.fetchPersonalBestPosition).mockResolvedValue(31);
	vi.mocked(climbQueries.fetchBestCategories).mockResolvedValue(
		new Map([[RED, "js"]])
	);
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
		expect(first.detail?.gotItRightCount).toBe(2);
		expect(first.detail?.youGotItRight).toBe(true);
		expect(first.detail?.options).toEqual([
			{
				label: "Guild.members",
				isRight: true,
				count: 2,
				percent: 67,
				yours: true,
				voters: [
					{
						id: RED,
						displayName: "Red",
						photoUrl: null,
						borderUrl: null,
						you: true,
					},
					{
						id: GREEN,
						displayName: "Green",
						photoUrl: null,
						borderUrl: null,
						you: false,
					},
				],
			},
			{
				label: "Guild[0]",
				isRight: false,
				count: 1,
				percent: 33,
				yours: false,
				voters: [
					{
						id: BLUE,
						displayName: "Blue",
						photoUrl: null,
						borderUrl: null,
						you: false,
					},
				],
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
		expect(multi.detail?.gotItRightCount).toBe(1);
		expect(multi.detail?.youGotItRight).toBe(false);
		expect(
			multi.detail?.options.map((option) => [option.label, option.count])
		).toEqual([
			["Talon Trot", 2],
			["Beak Barge", 1],
			["Falcon Punch", 1],
		]);
	});

	it("puts the viewer first among an option's voters", async () => {
		arrange();

		const result = await getRunCommunityService({ userId: GREEN, date: DATE });

		expect(result.success).toBe(true);
		if (!result.success) return;
		const [first] = result.data.polls;

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
		expect(result.data.topPercent).toBe(67);
	});

	it("seats all twelve categories, held first", async () => {
		arrange();

		const result = await getRunCommunityService({ userId: RED, date: DATE });

		expect(result.success).toBe(true);
		if (!result.success) return;
		expect(result.data.leaders).toHaveLength(12);
		expect(
			result.data.leaders.slice(0, 2).map(({ category }) => category)
		).toEqual(["js", "git"]);
	});

	it("draws a category nobody leads as an open seat", async () => {
		arrange();

		const result = await getRunCommunityService({ userId: RED, date: DATE });

		expect(result.success).toBe(true);
		if (!result.success) return;
		const open = result.data.leaders.filter(
			({ leader }) => leader === undefined
		);

		expect(open).toHaveLength(10);
	});

	it("marks the seat the viewer holds", async () => {
		arrange();

		const result = await getRunCommunityService({ userId: RED, date: DATE });

		expect(result.success).toBe(true);
		if (!result.success) return;
		const mine = result.data.leaders.find(({ leader }) => leader?.you === true);

		expect(mine?.category).toBe("git");
	});

	it("keeps the seats on a day the viewer has not answered anything", async () => {
		arrange();
		vi.mocked(communityQueries.fetchConsumedPollsForDay).mockResolvedValue([]);

		const result = await getRunCommunityService({ userId: RED, date: DATE });

		expect(result.success).toBe(true);
		if (!result.success) return;
		expect(result.data.polls).toEqual([]);
		expect(result.data.leaders).toHaveLength(12);
	});

	it("never exposes raw option correct flags in the payload", async () => {
		arrange();

		const result = await getRunCommunityService({ userId: RED, date: DATE });

		expect(result.success).toBe(true);
		if (!result.success) return;
		expect(JSON.stringify(result.data)).not.toContain('"correct":');
		expect(JSON.stringify(result.data)).not.toContain('"description":');
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
				borderUrl: null,
				gate: 2,
				pollsIntoGate: 4,
				you: false,
				build: BARE_BUILD,
				startedAtGate: 0,
				coveragePercent: 0,
				streak: 0,
				storageKb: 0,
			},
			{
				id: RED,
				displayName: "Red",
				photoUrl: null,
				borderUrl: null,
				gate: 6,
				pollsIntoGate: 3,
				you: true,
				build: RED_BUILD,
				closingBand: "shaky",
				startedAtGate: 0,
				handle: "red",
				title: "Completionist",
				coveragePercent: 69,
				streak: 0,
				storageKb: 0,
				bestCategory: "js",
			},
			{
				id: BLUE,
				displayName: "Blue",
				photoUrl: null,
				borderUrl: "/borders/x.png",
				gate: 7,
				pollsIntoGate: 1,
				you: false,
				build: BLUE_BUILD,
				closingBand: "perfect",
				startedAtGate: 5,
				coveragePercent: 0,
				streak: 6,
				storageKb: 896,
			},
		]);
	});

	it("keeps a viewer whose run has ended off the build list, their build now on the fallen chip", async () => {
		arrange();
		vi.mocked(climbQueries.fetchActiveClimbers).mockResolvedValue(
			CLIMBERS.filter((climber) => climber.userId !== RED)
		);

		const result = await getRunCommunityService({ userId: RED, date: DATE });

		expect(result.success).toBe(true);
		if (!result.success) return;
		const you = result.data.climb?.climbers.find((climber) => climber.you);
		expect(you).not.toHaveProperty("build");
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
				borderUrl: undefined,
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
				borderUrl: null,
				gate: 1,
				pollsIntoGate: 0,
				build: BARE_BUILD,
				closingBand: null,
				startedAtGate: 0,
				...standing(),
			},
		]);

		const result = await getRunCommunityService({ userId: RED, date: DATE });

		expect(result.success).toBe(true);
		if (!result.success) return;
		const blues = result.data.climb?.climbers.filter(
			(climber) => climber.id === BLUE
		);
		expect(blues).toHaveLength(1);
		expect(blues?.[0].gate).toBe(7);
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
				borderUrl: null,
				gate: 3,
				pollsIntoGate: 2,
				build: BLUE_BUILD,
				closingBand: "danger",
				startedAtGate: 0,
				coveragePercent: 0,
				streak: 0,
				storageKb: 0,
			},
			{
				runId: 12,
				id: "misty",
				displayName: "misty",
				photoUrl: null,
				borderUrl: null,
				gate: 5,
				pollsIntoGate: 0,
				build: BARE_BUILD,
				startedAtGate: 3,
				coveragePercent: 0,
				streak: 0,
				storageKb: 0,
			},
		]);
	});

	it("reads a climber's standing: their handle, title, streak and storage", async () => {
		arrange();

		const result = await getRunCommunityService({ userId: RED, date: DATE });

		expect(result.success).toBe(true);
		if (!result.success) return;
		const blue = result.data.climb?.climbers.find(
			(climber) => climber.id === BLUE
		);
		expect(blue).toMatchObject({ streak: 6, storageKb: 896 });
		const you = result.data.climb?.climbers.find((climber) => climber.you);
		expect(you).toMatchObject({ handle: "red", title: "Completionist" });
	});

	it("states coverage as a percentage of what the gate scores against, not as units", async () => {
		arrange();

		const result = await getRunCommunityService({ userId: RED, date: DATE });

		expect(result.success).toBe(true);
		if (!result.success) return;
		const you = result.data.climb?.climbers.find((climber) => climber.you);
		expect(you?.coveragePercent).toBe(69);
	});

	it("names the category a climber has answered right most often", async () => {
		arrange();

		const result = await getRunCommunityService({ userId: RED, date: DATE });

		expect(result.success).toBe(true);
		if (!result.success) return;
		const you = result.data.climb?.climbers.find((climber) => climber.you);
		expect(you?.bestCategory).toBe("js");
	});

	it("leaves the best category off a player who has never been right", async () => {
		arrange();

		const result = await getRunCommunityService({ userId: RED, date: DATE });

		expect(result.success).toBe(true);
		if (!result.success) return;
		const green = result.data.climb?.climbers.find(
			(climber) => climber.id === GREEN
		);
		expect(green).not.toHaveProperty("bestCategory");
	});

	it("leaves a handle and a title off an account that wears neither", async () => {
		arrange();

		const result = await getRunCommunityService({ userId: RED, date: DATE });

		expect(result.success).toBe(true);
		if (!result.success) return;
		const green = result.data.climb?.climbers.find(
			(climber) => climber.id === GREEN
		);
		expect(green).not.toHaveProperty("handle");
		expect(green).not.toHaveProperty("title");
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

describe("a board that mixes mirrored and plain answers", () => {
	const mirrorRedsAnswer = (optionIds: readonly number[]) => {
		arrange();
		const others = answerRows.filter(
			(row) => !(row.userId === RED && row.pollId === 10)
		);
		const red = answerRows.find(
			(row) => row.userId === RED && row.pollId === 10
		);
		if (!red) throw new Error("fixture lost Red's answer to poll 10");
		vi.mocked(communityQueries.fetchSessionAnswersForDay).mockResolvedValue([
			...optionIds.map((optionId) => ({ ...red, optionId, mirrored: true })),
			...others,
		]);
	};

	it("credits a mirrored answer that named every wrong option", async () => {
		mirrorRedsAnswer([102, 103]);

		const result = await getRunCommunityService({ userId: RED, date: DATE });

		expect(result.success).toBe(true);
		if (!result.success) return;
		const [first] = result.data.polls;
		expect(first.outcome).toBe("correct");
		expect(first.detail?.youGotItRight).toBe(true);
		expect(first.detail?.gotItRightCount).toBe(2);
	});

	it("grades half the wrong options as a partial, mirror or not", async () => {
		mirrorRedsAnswer([102]);

		const result = await getRunCommunityService({ userId: RED, date: DATE });

		expect(result.success).toBe(true);
		if (!result.success) return;
		expect(result.data.polls[0].outcome).toBe("partial");
		expect(result.data.polls[0].detail?.youGotItRight).toBe(false);
	});

	it("keeps the option rows the poll's own truth", async () => {
		mirrorRedsAnswer([102, 103]);

		const result = await getRunCommunityService({ userId: RED, date: DATE });

		expect(result.success).toBe(true);
		if (!result.success) return;
		const rows = result.data.polls[0].detail?.options ?? [];
		expect(rows.map((row) => row.isRight)).toEqual([true, false, false]);
	});
});
