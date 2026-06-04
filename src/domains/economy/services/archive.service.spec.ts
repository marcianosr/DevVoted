import { beforeEach, describe, expect, it, vi } from "vitest";

import {
	ARCHIVE_CONVERSION_RATE,
	archiveLeftoverStorage,
	calculateArchiveCredit,
} from "~/domains/economy/services/archive.service";
import { createMockRun } from "~/domains/runs/models/run.mock";
import { STORAGE_UNITS } from "~/lib/storage";

vi.mock("~/domains/economy/api/archive.queries", () => ({
	creditArchivedStorage: vi.fn(),
}));

const { creditArchivedStorage } =
	await import("~/domains/economy/api/archive.queries");

describe("archive.service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("calculateArchiveCredit", () => {
		it("returns the full unused storage when no configs installed", () => {
			const run = createMockRun({ storageLimit: STORAGE_UNITS.MB });

			expect(calculateArchiveCredit(run)).toBe(
				STORAGE_UNITS.MB * ARCHIVE_CONVERSION_RATE
			);
		});

		it("returns leftover after subtracting reroll spend", () => {
			const rerollSpend = 200 * STORAGE_UNITS.KB;
			const run = createMockRun({
				storageLimit: STORAGE_UNITS.MB,
				rerollStorageUsed: rerollSpend,
			});

			expect(calculateArchiveCredit(run)).toBe(STORAGE_UNITS.MB - rerollSpend);
		});

		it("returns leftover after deinstall junk penalty", () => {
			const junk = 128 * STORAGE_UNITS.KB;
			const run = createMockRun({
				storageLimit: STORAGE_UNITS.MB,
				deinstallPenalty: junk,
			});

			expect(calculateArchiveCredit(run)).toBe(STORAGE_UNITS.MB - junk);
		});

		it("returns zero when storage is fully consumed by reroll + junk", () => {
			const run = createMockRun({
				storageLimit: STORAGE_UNITS.MB,
				rerollStorageUsed: STORAGE_UNITS.MB / 2,
				deinstallPenalty: STORAGE_UNITS.MB / 2,
			});

			expect(calculateArchiveCredit(run)).toBe(0);
		});

		it("returns zero (never negative) when overspent", () => {
			const run = createMockRun({
				storageLimit: STORAGE_UNITS.MB,
				rerollStorageUsed: STORAGE_UNITS.MB * 2,
			});

			expect(calculateArchiveCredit(run)).toBe(0);
		});
	});

	describe("archiveLeftoverStorage", () => {
		it("credits the calculated leftover to the user's archive", async () => {
			vi.mocked(creditArchivedStorage).mockResolvedValue(STORAGE_UNITS.MB);
			const run = createMockRun({
				userId: "kazooie-uuid",
				storageLimit: STORAGE_UNITS.MB,
			});

			const result = await archiveLeftoverStorage(run);

			expect(creditArchivedStorage).toHaveBeenCalledWith(
				"kazooie-uuid",
				STORAGE_UNITS.MB
			);
			expect(result).toEqual({
				credited: STORAGE_UNITS.MB,
				total: STORAGE_UNITS.MB,
			});
		});

		it("short-circuits without a DB write when there is nothing to credit", async () => {
			const run = createMockRun({
				storageLimit: STORAGE_UNITS.MB,
				rerollStorageUsed: STORAGE_UNITS.MB,
			});

			const result = await archiveLeftoverStorage(run);

			expect(creditArchivedStorage).not.toHaveBeenCalled();
			expect(result).toEqual({ credited: 0, total: 0 });
		});

		it("returns null when the DB write throws (non-critical, swallows error)", async () => {
			vi.mocked(creditArchivedStorage).mockRejectedValue(
				new Error("Mumbo's Mountain is offline")
			);
			const run = createMockRun({ storageLimit: STORAGE_UNITS.MB });

			const result = await archiveLeftoverStorage(run);

			expect(result).toBeNull();
		});
	});
});
