import { beforeEach, describe, expect, it, vi } from "vitest";

import { getPlayerCardService } from "~/modules/run/community/application/playerCard.service";
import { ALL_SWATCHES } from "~/modules/run/gate/domain/swatch.model";

const {
	fetchPublicProfile,
	fetchPublishedPollCounts,
	fetchActiveClimberFor,
	fetchBestCategories,
	fetchObjectiveProgressByUser,
} = vi.hoisted(() => ({
	fetchPublicProfile: vi.fn(),
	fetchPublishedPollCounts: vi.fn(),
	fetchActiveClimberFor: vi.fn(),
	fetchBestCategories: vi.fn(),
	fetchObjectiveProgressByUser: vi.fn(),
}));

vi.mock("~/modules/collection/dex/infrastructure/configdex.repository", () => ({
	fetchObjectiveProgressByUser,
}));

vi.mock("~/modules/account/profile/infrastructure/profile.repository", () => ({
	fetchPublicProfile,
	fetchPublishedPollCounts,
}));

vi.mock("~/modules/run/community/infrastructure/climbers.repository", () => ({
	fetchActiveClimberFor,
	fetchBestCategories,
}));

const MISTY = "misty-from-cerulean-city";

const PROFILE = {
	id: MISTY,
	displayName: "misty",
	photoUrl: "/editors/misty.png",
	githubUsername: "misty",
	equippedBorderId: null,
	equippedTitleIds: ["title-ship-it"],
	archivedStorage: 0,
	ownedSwatchIds: [],
	equippedSwatchId: null,
	role: "user",
};

const CLIMBER = {
	userId: MISTY,
	gate: 2,
	coverageUnits: 20,
	streak: 4,
	storageKb: 1_200,
	build: { configs: [] },
};

describe("getPlayerCardService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		fetchPublicProfile.mockResolvedValue(PROFILE);
		fetchPublishedPollCounts.mockResolvedValue({ published: 0, answers: 0 });
		fetchActiveClimberFor.mockResolvedValue(null);
		fetchBestCategories.mockResolvedValue(new Map());
		fetchObjectiveProgressByUser.mockResolvedValue([]);
	});

	it("refuses a player who does not exist", async () => {
		fetchPublicProfile.mockResolvedValue(null);

		expect(await getPlayerCardService(MISTY)).toEqual({
			success: false,
			error: "User not found",
		});
	});

	it("names the player by their in-game name, never GitHub, in pallet when no swatch is worn", async () => {
		const response = await getPlayerCardService(MISTY);

		expect(response).toEqual({
			success: true,
			data: {
				userId: MISTY,
				displayName: "misty",
				photoUrl: "/editors/misty.png",
				titles: ["Ship It"],
				theme: "gate-pallet",
				authorship: { published: 0, answers: 0 },
				pollsAnswered: 0,
				swatchGates: [],
			},
		});
	});

	it("carries the gates whose swatch the player owns", async () => {
		fetchPublicProfile.mockResolvedValue({
			...PROFILE,
			ownedSwatchIds: [ALL_SWATCHES[0].id, ALL_SWATCHES[4].id],
		});

		const response = await getPlayerCardService(MISTY);

		expect(response.success && response.data.swatchGates).toEqual([0, 4]);
	});

	it("credits a poll editor with the polls they published and the answers drawn", async () => {
		fetchPublicProfile.mockResolvedValue({ ...PROFILE, role: "poll-editor" });
		fetchPublishedPollCounts.mockResolvedValue({
			published: 12,
			answers: 1842,
		});

		const response = await getPlayerCardService(MISTY);

		expect(response.success && response.data.authorship).toEqual({
			role: "Poll editor",
			published: 12,
			answers: 1842,
		});
	});

	it("carries every worn title in the order the player wears them", async () => {
		fetchPublicProfile.mockResolvedValue({
			...PROFILE,
			equippedTitleIds: ["title-legacy-tester", "title-ship-it"],
		});

		const response = await getPlayerCardService(MISTY);

		expect(response.success && response.data.titles).toEqual([
			"Legacy Tester",
			"Ship It",
		]);
	});

	it("wears the swatch the player owns and wears", async () => {
		fetchPublicProfile.mockResolvedValue({
			...PROFILE,
			ownedSwatchIds: ["swatch-cerulean"],
			equippedSwatchId: "swatch-cerulean",
		});

		const response = await getPlayerCardService(MISTY);

		expect(response.success && response.data.theme).toBe("gate-cerulean");
	});

	it("falls back to pallet for a worn swatch the player does not own", async () => {
		fetchPublicProfile.mockResolvedValue({
			...PROFILE,
			equippedSwatchId: "swatch-cerulean",
		});

		const response = await getPlayerCardService(MISTY);

		expect(response.success && response.data.theme).toBe("gate-pallet");
	});

	it("carries no run when the player has none open", async () => {
		const response = await getPlayerCardService(MISTY);

		expect(response.success && response.data.run).toBeFalsy();
	});

	it("states an open run's gate, coverage, streak, storage and best category", async () => {
		fetchActiveClimberFor.mockResolvedValue(CLIMBER);
		fetchBestCategories.mockResolvedValue(new Map([[MISTY, "css"]]));

		const response = await getPlayerCardService(MISTY);

		expect(response.success && response.data.run).toMatchObject({
			gate: 2,
			streak: 4,
			storageKb: 1_200,
			bestCategory: "css",
			coveragePercent: expect.any(Number),
		});
	});
});
