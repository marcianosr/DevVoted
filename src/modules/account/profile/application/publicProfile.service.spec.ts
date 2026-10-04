import { beforeEach, describe, expect, it, vi } from "vitest";

import { getPublicProfileService } from "~/modules/account/profile/application/publicProfile.service";

const {
	fetchPublicProfile,
	fetchPublishedPollCounts,
	fetchPublishedPollCategories,
	fetchSeenCountsByUser,
	fetchAnsweredCountsByUser,
	fetchConfigUnlocksByUser,
	fetchObjectiveProgressByUser,
	fetchOwnedTitleIds,
	fetchGateRunsByUser,
	fetchCategoryBoards,
	fetchActiveClimberFor,
	fetchBestCategories,
	fetchBestStreakOf,
} = vi.hoisted(() => ({
	fetchPublicProfile: vi.fn(),
	fetchPublishedPollCounts: vi.fn(),
	fetchPublishedPollCategories: vi.fn(),
	fetchSeenCountsByUser: vi.fn(),
	fetchAnsweredCountsByUser: vi.fn(),
	fetchConfigUnlocksByUser: vi.fn(),
	fetchObjectiveProgressByUser: vi.fn(),
	fetchOwnedTitleIds: vi.fn(),
	fetchGateRunsByUser: vi.fn(),
	fetchCategoryBoards: vi.fn(),
	fetchActiveClimberFor: vi.fn(),
	fetchBestCategories: vi.fn(),
	fetchBestStreakOf: vi.fn(),
}));

vi.mock("~/modules/account/profile/infrastructure/profile.repository", () => ({
	fetchPublicProfile,
	fetchPublishedPollCounts,
}));

vi.mock("~/modules/account/profile/infrastructure/title.repository", () => ({
	fetchOwnedTitleIds,
}));

vi.mock("~/modules/collection/dex/infrastructure/polldex.repository", () => ({
	fetchPublishedPollCategories,
	fetchSeenCountsByUser,
	fetchAnsweredCountsByUser,
}));

vi.mock("~/modules/collection/dex/infrastructure/configdex.repository", () => ({
	fetchConfigUnlocksByUser,
	fetchObjectiveProgressByUser,
}));

vi.mock(
	"~/modules/collection/dex/infrastructure/runHistory.repository",
	() => ({
		fetchGateRunsByUser,
	})
);

vi.mock("~/modules/run/run/infrastructure/categoryLeader.repository", () => ({
	fetchCategoryBoards,
	fetchBestStreakOf,
}));

vi.mock("~/modules/run/community/infrastructure/climbers.repository", () => ({
	fetchActiveClimberFor,
	fetchBestCategories,
}));

const RED = "red-from-pallet-town";

const PROFILE = {
	id: RED,
	displayName: "marciano_schildmeijer",
	photoUrl: "/editors/misty.png",
	githubUsername: "marciano",
	equippedBorderId: null,
	equippedTitleIds: ["title-it-compiles", "title-ship-it"],
	archivedStorage: 8_388_608,
	ownedSwatchIds: ["swatch-pallet", "swatch-pewter"],
	equippedSwatchId: null,
	role: "user",
};

const pollsNumbering = (count: number) =>
	Array.from({ length: count }, (_, index) => ({
		id: index + 1,
		categoryCode: "js",
	}));

const endedRun = (runId: number, gatesCleared: number) => ({
	runId,
	gatesCleared,
	engineStatus: "dead",
	coverage: 12,
	startedAt: new Date("2026-09-24T09:00:00Z"),
	finishedAt: new Date("2026-09-24T10:00:00Z"),
	swatchGates: [0, 1],
});

const CLIMBER = {
	userId: RED,
	gate: 6,
	closingBand: "healthy",
	coverageUnits: 20,
	streak: 7,
	storageKb: 4_300,
	build: { configs: [] },
};

const unwrap = <T>(response: { success: boolean } & Record<string, unknown>) =>
	(response as { success: true; data: T }).data;

describe("getPublicProfileService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		fetchPublicProfile.mockResolvedValue(PROFILE);
		fetchPublishedPollCounts.mockResolvedValue({ published: 0 });
		fetchObjectiveProgressByUser.mockResolvedValue([
			{ metric: "polls-answered", count: 120 },
		]);
		fetchPublishedPollCategories.mockResolvedValue(pollsNumbering(96));
		fetchSeenCountsByUser.mockResolvedValue([
			{ pollId: 1, timesSeen: 3 },
			{ pollId: 2, timesSeen: 1 },
		]);
		fetchAnsweredCountsByUser.mockResolvedValue([]);
		fetchConfigUnlocksByUser.mockResolvedValue([
			{ configId: "telemetry", viaMetric: "polls-correct" },
		]);
		fetchOwnedTitleIds.mockResolvedValue([
			"title-it-compiles",
			"title-ship-it",
		]);
		fetchGateRunsByUser.mockResolvedValue([
			endedRun(3, 4),
			endedRun(2, 9),
			endedRun(1, 2),
		]);
		fetchCategoryBoards.mockResolvedValue({
			streak: [
				{ category: "css", leader: { userId: RED, handle: "red", best: 21 } },
				{
					category: "js",
					leader: { userId: "blue-from-pallet-town", handle: "blue", best: 8 },
				},
				{ category: "html" },
			],
			correct: [
				{ category: "ts", leader: { userId: RED, handle: "red", best: 58 } },
			],
		});
		fetchActiveClimberFor.mockResolvedValue(null);
		fetchBestCategories.mockResolvedValue(new Map([[RED, "css"]]));
		fetchBestStreakOf.mockResolvedValue(21);
	});

	it("carries the player's best streak and best category on the record", async () => {
		const response = await getPublicProfileService(RED);

		expect(
			unwrap<{ record: { bestStreak: number; bestCategory: string | null } }>(
				response
			).record
		).toMatchObject({ bestStreak: 21, bestCategory: "css" });
	});

	it("names the player and every title they wear", async () => {
		const response = await getPublicProfileService(RED);

		expect(
			unwrap<{ identity: { wornTitles: string[] } }>(response).identity
		).toMatchObject({
			displayName: "marciano_schildmeijer",
			githubUsername: "marciano",
			wornTitles: ["It Compiles", "Ship It"],
		});
	});

	it("credits an admin with the polls they published and the answers drawn", async () => {
		fetchPublicProfile.mockResolvedValue({ ...PROFILE, role: "admin" });
		fetchPublishedPollCounts.mockResolvedValue({ published: 3 });

		const response = await getPublicProfileService(RED);

		expect(
			unwrap<{ identity: { authorship: unknown } }>(response).identity
				.authorship
		).toEqual({ role: "Admin", published: 3 });
	});

	it("resolves the equipped border to a picture the card can draw", async () => {
		fetchPublicProfile.mockResolvedValue({
			...PROFILE,
			equippedBorderId: "border-retired",
		});

		const response = await getPublicProfileService(RED);

		expect(
			unwrap<{ identity: { borderUrl: string | null } }>(response).identity
				.borderUrl
		).toBeNull();
	});

	it("wears pallet on the page when the player wears no swatch", async () => {
		const response = await getPublicProfileService(RED);

		expect(unwrap<{ theme: string }>(response).theme).toBe("gate-pallet");
	});

	it("wears the theme of the swatch the player wears", async () => {
		fetchPublicProfile.mockResolvedValue({
			...PROFILE,
			equippedSwatchId: "swatch-pewter",
		});

		const response = await getPublicProfileService(RED);

		expect(unwrap<{ theme: string }>(response).theme).toBe("gate-pewter");
	});

	describe("the collection", () => {
		type Tally = { held: number; total: number };
		const totals = async () =>
			unwrap<{
				totals: {
					polls: Tally;
					configs: Tally;
					titles: Tally;
					archivedStorage: number;
				};
			}>(await getPublicProfileService(RED)).totals;

		it("counts polls seen against the polls the Dex lists, with the archive beside them", async () => {
			expect(await totals()).toMatchObject({
				polls: { held: 2, total: 96 },
				archivedStorage: 8_388_608,
			});
		});

		it("sees a poll the account answered though nothing recorded it being dealt", async () => {
			fetchAnsweredCountsByUser.mockResolvedValue([
				{ pollId: 3, answeredCount: 1 },
			]);

			expect((await totals()).polls).toEqual({ held: 3, total: 96 });
		});

		it("counts a seen poll once however often history and answers both name it", async () => {
			fetchAnsweredCountsByUser.mockResolvedValue([
				{ pollId: 1, answeredCount: 2 },
			]);

			expect((await totals()).polls.held).toBe(2);
		});

		it("leaves out history for a poll no longer published, so held never passes the total", async () => {
			fetchSeenCountsByUser.mockResolvedValue([
				{ pollId: 1, timesSeen: 1 },
				{ pollId: 999, timesSeen: 4 },
			]);

			expect((await totals()).polls).toEqual({ held: 1, total: 96 });
		});

		it("leaves a poll outside every Dex category out of both sides", async () => {
			fetchPublishedPollCategories.mockResolvedValue([
				{ id: 1, categoryCode: "js" },
				{ id: 2, categoryCode: "cobol" },
			]);

			expect((await totals()).polls).toEqual({ held: 1, total: 1 });
		});

		it("never counts a retired title id as held", async () => {
			fetchOwnedTitleIds.mockResolvedValue([
				"title-it-compiles",
				"title-retired-long-ago",
			]);
			const { titles } = await totals();

			expect(titles.held).toBe(1);
			expect(titles.held).toBeLessThanOrEqual(titles.total);
		});

		it("counts an unlocked config on top of the starters everybody holds", async () => {
			fetchConfigUnlocksByUser.mockResolvedValue([]);
			const starters = (await totals()).configs.held;

			fetchConfigUnlocksByUser.mockResolvedValue([
				{ configId: "telemetry", viaMetric: "polls-correct" },
			]);

			expect((await totals()).configs.held).toBe(starters + 1);
		});
	});

	it("reports nothing for an account that does not exist", async () => {
		fetchPublicProfile.mockResolvedValue(null);

		const response = await getPublicProfileService(RED);

		expect(response.success).toBe(false);
	});

	it("gives a visitor counts only, never the questions behind them", async () => {
		const response = await getPublicProfileService(RED);
		const serialised = JSON.stringify(unwrap(response));

		expect(serialised).not.toContain("question 1");
		expect(serialised).not.toContain("pollId");
		expect(serialised).not.toContain("configId");
	});

	it("carries exactly five parts, so nothing else can ride along", async () => {
		const response = await getPublicProfileService(RED);

		expect(Object.keys(unwrap(response))).toEqual([
			"identity",
			"theme",
			"record",
			"standing",
			"totals",
		]);
	});

	it("reads the collections without ever reading the account's answers", async () => {
		await getPublicProfileService(RED);

		expect(fetchSeenCountsByUser).toHaveBeenCalledWith(RED);
		expect(fetchConfigUnlocksByUser).toHaveBeenCalledWith(RED);
	});

	describe("the record", () => {
		const record = async () =>
			unwrap<{ record: Record<string, unknown> }>(
				await getPublicProfileService(RED)
			).record;

		it("reads depth off the deepest run, not off the most recent one", async () => {
			expect(await record()).toMatchObject({ deepestGate: 9 });
		});

		it("counts a swatch per gate swept, which depth does not imply", async () => {
			expect(await record()).toMatchObject({
				clearedGates: [0, 1],
				gatesTotal: 13,
			});
		});

		it("lets an open run set the depth when it has gone further than any finished one", async () => {
			fetchActiveClimberFor.mockResolvedValue({ ...CLIMBER, gate: 11 });

			expect(await record()).toMatchObject({ deepestGate: 11 });
		});

		it("counts every finished run, and lists only the most recent few", async () => {
			const held = await record();

			expect(held.runsFinished).toBe(3);
			expect(held.recentRuns).toHaveLength(3);
		});

		it("names the best run from every finished run, even one older than the recent few", async () => {
			fetchGateRunsByUser.mockResolvedValueOnce([
				...[7, 6, 5, 4, 3].map((runId) => endedRun(runId, 2)),
				endedRun(1, 10),
			]);

			const held = await record();

			expect(held.bestRun).toMatchObject({ runId: 1, gatesCleared: 10 });
		});

		it("counts the runs that took the Champion", async () => {
			fetchGateRunsByUser.mockResolvedValueOnce([
				{ ...endedRun(2, 13), engineStatus: "won" },
				endedRun(1, 4),
			]);

			expect(await record()).toMatchObject({ runsWon: 1 });
		});

		it("keeps only the seats this player holds, never the whole board", async () => {
			expect(await record()).toMatchObject({
				seats: [{ category: "css", streak: 21 }],
			});
		});

		it("holds no seat for a player who leads nothing", async () => {
			fetchCategoryBoards.mockResolvedValue({
				streak: [{ category: "html" }],
				correct: [],
			});

			expect(await record()).toMatchObject({ seats: [] });
		});

		it("reads the streak board, so a correct-board seat never shows here", async () => {
			fetchCategoryBoards.mockResolvedValue({
				streak: [],
				correct: [
					{ category: "ts", leader: { userId: RED, handle: "red", best: 58 } },
				],
			});

			expect(await record()).toMatchObject({ seats: [] });
		});
	});

	describe("the standing", () => {
		const standing = async () =>
			unwrap<{ standing: Record<string, unknown> | null }>(
				await getPublicProfileService(RED)
			).standing;

		it("is nothing at all when the player has no run open", async () => {
			expect(await standing()).toBeNull();
		});

		it("states where an open run stands and what it carries", async () => {
			fetchActiveClimberFor.mockResolvedValue(CLIMBER);

			expect(await standing()).toMatchObject({
				gate: 6,
				streak: 7,
				storageKb: 4_300,
			});
		});

		it("carries the category the player answers best", async () => {
			fetchActiveClimberFor.mockResolvedValue(CLIMBER);
			fetchBestCategories.mockResolvedValue(new Map([[RED, "css"]]));

			expect(await standing()).toMatchObject({ bestCategory: "css" });
		});

		it("turns banked units into a percentage here, never in SQL", async () => {
			fetchActiveClimberFor.mockResolvedValue(CLIMBER);
			const held = await standing();

			expect(held?.coveragePercent).toEqual(expect.any(Number));
			expect(held?.coveragePercent).not.toBe(CLIMBER.coverageUnits);
		});
	});
});
