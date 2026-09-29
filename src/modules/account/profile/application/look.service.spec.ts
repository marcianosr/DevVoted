import { beforeEach, describe, expect, it, vi } from "vitest";

import { saveLookService } from "~/modules/account/profile/application/look.service";

const { fetchUserArchiveState, setEquippedLook, fetchOwnedTitleIds } =
	vi.hoisted(() => ({
		fetchUserArchiveState: vi.fn(),
		setEquippedLook: vi.fn(),
		fetchOwnedTitleIds: vi.fn(),
	}));

vi.mock("~/modules/account/profile/infrastructure/profile.repository", () => ({
	fetchUserArchiveState,
	setEquippedLook,
}));

vi.mock("~/modules/account/profile/infrastructure/title.repository", () => ({
	fetchOwnedTitleIds,
}));

const MISTY = "misty-cerulean-city";
const STARMIE = "border-00b9a62e";
const TESTER = "title-legacy-tester";

const LOOK = { borderId: STARMIE, titleIds: [TESTER] };

const ownerOf = (ownedBorderIds: string[]) => ({
	archivedStorage: 0,
	ownedBorderIds,
	equippedBorderId: null,
	ownedSwatchIds: [],
	equippedSwatchId: null,
});

describe("saveLookService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		fetchOwnedTitleIds.mockResolvedValue([TESTER]);
		setEquippedLook.mockImplementation(async (_userId, look) => look);
	});

	it("wears the border and titles together in one write", async () => {
		fetchUserArchiveState.mockResolvedValueOnce(ownerOf([STARMIE]));

		expect(await saveLookService(MISTY, LOOK)).toEqual({
			success: true,
			data: LOOK,
		});
		expect(setEquippedLook).toHaveBeenCalledExactlyOnceWith(MISTY, LOOK);
	});

	it("refuses a border the player has not bought, writing nothing", async () => {
		fetchUserArchiveState.mockResolvedValueOnce(ownerOf([]));

		const result = await saveLookService(MISTY, LOOK);

		expect(result).toEqual({
			success: false,
			error: "Cannot wear a border you don't own",
		});
		expect(setEquippedLook).not.toHaveBeenCalled();
	});

	it("refuses a player who does not exist", async () => {
		fetchUserArchiveState.mockResolvedValueOnce(null);

		expect(await saveLookService(MISTY, LOOK)).toEqual({
			success: false,
			error: "User not found",
		});
	});
});
