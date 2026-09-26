import { beforeEach, describe, expect, it, vi } from "vitest";

import { getPublicProfileService } from "~/modules/account/profile/application/publicProfile.service";

const {
	fetchPublicProfile,
	fetchPublishedPollsForDex,
	fetchSeenCountsByUser,
	fetchConfigUnlocksByUser,
} = vi.hoisted(() => ({
	fetchPublicProfile: vi.fn(),
	fetchPublishedPollsForDex: vi.fn(),
	fetchSeenCountsByUser: vi.fn(),
	fetchConfigUnlocksByUser: vi.fn(),
}));

vi.mock("~/modules/account/profile/infrastructure/profile.repository", () => ({
	fetchPublicProfile,
}));

vi.mock("~/modules/collection/dex/infrastructure/polldex.repository", () => ({
	fetchPublishedPollsForDex,
	fetchSeenCountsByUser,
}));

vi.mock("~/modules/collection/dex/infrastructure/configdex.repository", () => ({
	fetchConfigUnlocksByUser,
}));

const RED = "red-from-pallet-town";

const PROFILE = {
	id: RED,
	displayName: "marciano_schildmeijer",
	photoUrl: "/editors/misty.png",
	githubUsername: "marciano",
	equippedBorderId: null,
	equippedTitleIds: ["title-summit", "title-completer"],
	archivedStorage: 8_388_608,
	ownedSwatchIds: ["swatch-pallet", "swatch-boulder"],
};

const pollsNumbering = (count: number) =>
	Array.from({ length: count }, (_, index) => ({
		id: index + 1,
		pollNumber: index + 1,
		categoryCode: "js",
		question: `question ${index + 1}`,
	}));

const unwrap = <T>(response: { success: boolean } & Record<string, unknown>) =>
	(response as { success: true; data: T }).data;

describe("getPublicProfileService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		fetchPublicProfile.mockResolvedValue(PROFILE);
		fetchPublishedPollsForDex.mockResolvedValue(pollsNumbering(96));
		fetchSeenCountsByUser.mockResolvedValue([
			{ pollId: 1, timesSeen: 3 },
			{ pollId: 2, timesSeen: 1 },
		]);
		fetchConfigUnlocksByUser.mockResolvedValue([
			{ configId: "stylelint", viaMetric: "polls-correct" },
		]);
	});

	it("names the player and every title they wear", async () => {
		const response = await getPublicProfileService(RED);

		expect(
			unwrap<{ identity: { wornTitles: string[] } }>(response).identity
		).toMatchObject({
			displayName: "marciano_schildmeijer",
			githubUsername: "marciano",
			wornTitles: ["Summit", "Completer"],
		});
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

	it("counts the collections as held of total", async () => {
		const response = await getPublicProfileService(RED);

		expect(
			unwrap<{ totals: Record<string, number> }>(response).totals
		).toMatchObject({
			pollsSeen: 2,
			pollsTotal: 96,
			gatesCleared: 2,
			gatesTotal: 13,
			archivedStorage: 8_388_608,
		});
	});

	it("counts an unlocked config on top of the starters everybody holds", async () => {
		fetchConfigUnlocksByUser.mockResolvedValue([]);
		const starters = unwrap<{ totals: { configsHeld: number } }>(
			await getPublicProfileService(RED)
		).totals.configsHeld;

		fetchConfigUnlocksByUser.mockResolvedValue([
			{ configId: "stylelint", viaMetric: "polls-correct" },
		]);
		const withOne = unwrap<{ totals: { configsHeld: number } }>(
			await getPublicProfileService(RED)
		).totals.configsHeld;

		expect(withOne).toBe(starters + 1);
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

	it("carries exactly two halves, so nothing else can ride along", async () => {
		const response = await getPublicProfileService(RED);

		expect(Object.keys(unwrap(response))).toEqual(["identity", "totals"]);
	});

	it("reads the collections without ever reading the account's answers", async () => {
		await getPublicProfileService(RED);

		expect(fetchSeenCountsByUser).toHaveBeenCalledWith(RED);
		expect(fetchConfigUnlocksByUser).toHaveBeenCalledWith(RED);
	});
});
