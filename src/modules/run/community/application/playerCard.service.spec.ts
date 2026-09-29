import { beforeEach, describe, expect, it, vi } from "vitest";

import { getPlayerCardService } from "~/modules/run/community/application/playerCard.service";

const { fetchPublicProfile, fetchActiveClimberFor, fetchBestCategories } =
	vi.hoisted(() => ({
		fetchPublicProfile: vi.fn(),
		fetchActiveClimberFor: vi.fn(),
		fetchBestCategories: vi.fn(),
	}));

vi.mock("~/modules/account/profile/infrastructure/profile.repository", () => ({
	fetchPublicProfile,
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
		fetchActiveClimberFor.mockResolvedValue(null);
		fetchBestCategories.mockResolvedValue(new Map());
	});

	it("refuses a player who does not exist", async () => {
		fetchPublicProfile.mockResolvedValue(null);

		expect(await getPlayerCardService(MISTY)).toEqual({
			success: false,
			error: "User not found",
		});
	});

	it("names the player by their in-game name and first worn title, never GitHub", async () => {
		const response = await getPlayerCardService(MISTY);

		expect(response).toEqual({
			success: true,
			data: {
				userId: MISTY,
				displayName: "misty",
				photoUrl: "/editors/misty.png",
				title: "Ship It",
			},
		});
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
