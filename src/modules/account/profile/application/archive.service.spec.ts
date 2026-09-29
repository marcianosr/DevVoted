import { beforeEach, describe, expect, it, vi } from "vitest";

import { equipSwatchService } from "~/modules/account/profile/application/archive.service";

const { fetchUserArchiveState, setEquippedSwatch } = vi.hoisted(() => ({
	fetchUserArchiveState: vi.fn(),
	setEquippedSwatch: vi.fn(),
}));

vi.mock("~/modules/account/profile/infrastructure/profile.repository", () => ({
	fetchUserArchiveState,
	setEquippedSwatch,
	purchaseBorderTx: vi.fn(),
	setEquippedBorder: vi.fn(),
}));

const RED = "red-from-pallet-town";
const VOLCANO = "swatch-volcano";

const archiveOwning = (ownedSwatchIds: string[]) => ({
	archivedStorage: 0,
	ownedBorderIds: [],
	equippedBorderId: null,
	ownedSwatchIds,
	equippedSwatchId: null,
});

describe("equipSwatchService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("wears a swatch the player earned", async () => {
		fetchUserArchiveState.mockResolvedValueOnce(archiveOwning([VOLCANO]));
		setEquippedSwatch.mockResolvedValueOnce({
			...archiveOwning([VOLCANO]),
			equippedSwatchId: VOLCANO,
		});

		const response = await equipSwatchService(RED, VOLCANO);

		expect(response.success).toBe(true);
		expect(setEquippedSwatch).toHaveBeenCalledWith(RED, VOLCANO);
	});

	it("refuses a swatch the player has not earned and writes nothing", async () => {
		fetchUserArchiveState.mockResolvedValueOnce(archiveOwning([]));

		const response = await equipSwatchService(RED, VOLCANO);

		expect(response.success).toBe(false);
		expect(setEquippedSwatch).not.toHaveBeenCalled();
	});

	it("stores pallet as nothing worn", async () => {
		fetchUserArchiveState.mockResolvedValueOnce(archiveOwning([]));
		setEquippedSwatch.mockResolvedValueOnce(archiveOwning([]));

		await equipSwatchService(RED, "swatch-pallet");

		expect(setEquippedSwatch).toHaveBeenCalledWith(RED, null);
	});
});
