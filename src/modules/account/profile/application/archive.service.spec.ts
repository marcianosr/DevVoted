import { beforeEach, describe, expect, it, vi } from "vitest";

import {
	getArchiveStateService,
	purchaseBorderService,
} from "~/modules/account/profile/application/archive.service";

const { fetchUserArchiveState, purchaseBorderTx } = vi.hoisted(() => ({
	fetchUserArchiveState: vi.fn(),
	purchaseBorderTx: vi.fn(),
}));

vi.mock("~/modules/account/profile/infrastructure/profile.repository", () => ({
	fetchUserArchiveState,
	purchaseBorderTx,
}));

const RED = "red-from-pallet-town";
const GREEN_BUILD = "border-00b9a62e";

const archiveOwning = (ownedBorderIds: string[]) => ({
	archivedStorage: 0,
	ownedBorderIds,
	equippedBorderId: null,
	ownedSwatchIds: [],
	equippedSwatchId: null,
});

describe("purchaseBorderService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("buys a catalogue border at the cost the catalogue lists", async () => {
		purchaseBorderTx.mockResolvedValueOnce(archiveOwning([GREEN_BUILD]));

		expect(await purchaseBorderService(RED, GREEN_BUILD)).toEqual({
			success: true,
			data: archiveOwning([GREEN_BUILD]),
		});
		expect(purchaseBorderTx).toHaveBeenCalledExactlyOnceWith(
			RED,
			GREEN_BUILD,
			expect.any(Number)
		);
	});

	it("refuses a border the catalogue does not list, writing nothing", async () => {
		expect(await purchaseBorderService(RED, "border-nope")).toEqual({
			success: false,
			error: "Border border-nope not found",
		});
		expect(purchaseBorderTx).not.toHaveBeenCalled();
	});

	it("reports a purchase the archive could not cover or already holds", async () => {
		purchaseBorderTx.mockResolvedValueOnce(null);

		expect(await purchaseBorderService(RED, GREEN_BUILD)).toEqual({
			success: false,
			error: "Purchase failed: insufficient archive or already owned",
		});
	});
});

describe("getArchiveStateService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("hands back the archive it read", async () => {
		fetchUserArchiveState.mockResolvedValueOnce(archiveOwning([GREEN_BUILD]));

		expect(await getArchiveStateService(RED)).toEqual({
			success: true,
			data: archiveOwning([GREEN_BUILD]),
		});
	});

	it("refuses a player who does not exist", async () => {
		fetchUserArchiveState.mockResolvedValueOnce(null);

		expect(await getArchiveStateService(RED)).toEqual({
			success: false,
			error: "User not found",
		});
	});
});
