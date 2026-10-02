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

const CASCADE = "swatch-cascade";
const PALLET = "swatch-pallet";

const LOOK = { borderId: STARMIE, titleIds: [TESTER], swatchId: CASCADE };

const ownerOf = (
	ownedBorderIds: string[],
	ownedSwatchIds: string[] = [CASCADE]
) => ({
	archivedStorage: 0,
	ownedBorderIds,
	equippedBorderId: null,
	ownedSwatchIds,
	equippedSwatchId: null,
});

describe("saveLookService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		fetchOwnedTitleIds.mockResolvedValue([TESTER]);
		setEquippedLook.mockImplementation(async (_userId, look) => look);
	});

	it("refuses a swatch the player has not earned, writing nothing", async () => {
		fetchUserArchiveState.mockResolvedValueOnce(ownerOf([STARMIE], []));

		expect(await saveLookService(MISTY, LOOK)).toEqual({
			success: false,
			error: "Cannot wear a swatch you have not earned",
		});
		expect(setEquippedLook).not.toHaveBeenCalled();
	});

	it("stores the pallet swatch as nothing worn", async () => {
		fetchUserArchiveState.mockResolvedValueOnce(ownerOf([STARMIE]));

		await saveLookService(MISTY, { ...LOOK, swatchId: PALLET });

		expect(setEquippedLook).toHaveBeenCalledExactlyOnceWith(MISTY, {
			...LOOK,
			swatchId: null,
		});
	});

	it("wears the border, titles and swatch together in one write", async () => {
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

	it("refuses a title the player has not earned, writing nothing", async () => {
		fetchUserArchiveState.mockResolvedValueOnce(ownerOf([STARMIE]));
		fetchOwnedTitleIds.mockResolvedValueOnce([]);

		expect(await saveLookService(MISTY, LOOK)).toEqual({
			success: false,
			error: "Cannot wear a title you have not earned",
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
