import { beforeEach, describe, expect, it, vi } from "vitest";

import {
	archiveLeftoverStorage,
	calculateArchiveCredit,
	getConversionRateForGate,
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

	describe("getConversionRateForGate", () => {
		it("gate 1 credits nothing (defensive — game rules prevent gate-1 exit)", () => {
			expect(getConversionRateForGate(1)).toBe(0);
		});

		it("gate 2 credits 20%", () => {
			expect(getConversionRateForGate(2)).toBe(0.2);
		});

		it("gate 3 credits 25%", () => {
			expect(getConversionRateForGate(3)).toBe(0.25);
		});

		it("gate 4 credits 50%", () => {
			expect(getConversionRateForGate(4)).toBe(0.5);
		});

		it("gate 5 credits the full leftover", () => {
			expect(getConversionRateForGate(5)).toBe(1);
		});

		it("gates beyond 5 cap at full credit", () => {
			expect(getConversionRateForGate(12)).toBe(1);
		});

		it("invalid/zero gate falls through to zero", () => {
			expect(getConversionRateForGate(0)).toBe(0);
		});
	});

	describe("calculateArchiveCredit", () => {
		it("gate 5+ credits the full unused storage when no configs installed", () => {
			const run = createMockRun({ storageLimit: STORAGE_UNITS.MB });

			expect(calculateArchiveCredit(run, 5)).toBe(STORAGE_UNITS.MB);
		});

		it("gate 2 credits 20% of leftover (anti-farm tier)", () => {
			const run = createMockRun({ storageLimit: STORAGE_UNITS.MB });

			expect(calculateArchiveCredit(run, 2)).toBe(
				Math.floor(STORAGE_UNITS.MB * 0.2)
			);
		});

		it("gate 4 credits 50% of leftover", () => {
			const run = createMockRun({ storageLimit: STORAGE_UNITS.MB });

			expect(calculateArchiveCredit(run, 4)).toBe(STORAGE_UNITS.MB / 2);
		});

		it("gate 2 leftover after reroll spend still scales at 20%", () => {
			const rerollSpend = 200 * STORAGE_UNITS.KB;
			const run = createMockRun({
				storageLimit: STORAGE_UNITS.MB,
				rerollStorageUsed: rerollSpend,
			});

			expect(calculateArchiveCredit(run, 2)).toBe(
				Math.floor((STORAGE_UNITS.MB - rerollSpend) * 0.2)
			);
		});

		it("returns zero when storage is fully consumed by reroll + junk", () => {
			const run = createMockRun({
				storageLimit: STORAGE_UNITS.MB,
				rerollStorageUsed: STORAGE_UNITS.MB / 2,
				deinstallPenalty: STORAGE_UNITS.MB / 2,
			});

			expect(calculateArchiveCredit(run, 5)).toBe(0);
		});

		it("returns zero (never negative) when overspent", () => {
			const run = createMockRun({
				storageLimit: STORAGE_UNITS.MB,
				rerollStorageUsed: STORAGE_UNITS.MB * 2,
			});

			expect(calculateArchiveCredit(run, 5)).toBe(0);
		});

		it("returns zero at gate 1 even with full leftover (defensive)", () => {
			const run = createMockRun({ storageLimit: STORAGE_UNITS.MB });

			expect(calculateArchiveCredit(run, 1)).toBe(0);
		});
	});

	describe("archiveLeftoverStorage", () => {
		it("credits the gate-scaled leftover to the user's archive", async () => {
			vi.mocked(creditArchivedStorage).mockResolvedValue(STORAGE_UNITS.MB / 2);
			const run = createMockRun({
				userId: "kazooie-uuid",
				storageLimit: STORAGE_UNITS.MB,
			});

			const result = await archiveLeftoverStorage(run, 4);

			expect(creditArchivedStorage).toHaveBeenCalledWith(
				"kazooie-uuid",
				STORAGE_UNITS.MB / 2
			);
			expect(result).toEqual({
				credited: STORAGE_UNITS.MB / 2,
				total: STORAGE_UNITS.MB / 2,
			});
		});

		it("anti-farm in action: gate 2 death with full 1MB leftover yields less than a common border", async () => {
			const expected = Math.floor(STORAGE_UNITS.MB * 0.2);
			vi.mocked(creditArchivedStorage).mockResolvedValue(expected);
			const run = createMockRun({
				userId: "banjo-uuid",
				storageLimit: STORAGE_UNITS.MB,
			});

			const result = await archiveLeftoverStorage(run, 2);

			expect(result?.credited).toBe(expected);
			// Less than a single 256KB common border — the farm is mathematically
			// worse than playing through.
			expect(result?.credited).toBeLessThan(256 * STORAGE_UNITS.KB);
		});

		it("short-circuits without a DB write when there is nothing to credit", async () => {
			const run = createMockRun({
				storageLimit: STORAGE_UNITS.MB,
				rerollStorageUsed: STORAGE_UNITS.MB,
			});

			const result = await archiveLeftoverStorage(run, 5);

			expect(creditArchivedStorage).not.toHaveBeenCalled();
			expect(result).toEqual({ credited: 0, total: 0 });
		});

		it("short-circuits when gate is 1 (zero rate, never hits DB)", async () => {
			const run = createMockRun({ storageLimit: STORAGE_UNITS.MB });

			const result = await archiveLeftoverStorage(run, 1);

			expect(creditArchivedStorage).not.toHaveBeenCalled();
			expect(result).toEqual({ credited: 0, total: 0 });
		});

		it("returns null when the DB write throws (non-critical, swallows error)", async () => {
			vi.mocked(creditArchivedStorage).mockRejectedValue(
				new Error("Mumbo's Mountain is offline")
			);
			const run = createMockRun({ storageLimit: STORAGE_UNITS.MB });

			const result = await archiveLeftoverStorage(run, 5);

			expect(result).toBeNull();
		});
	});
});
