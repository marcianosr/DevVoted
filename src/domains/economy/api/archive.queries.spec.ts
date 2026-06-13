import { describe, it, expect, vi, beforeEach } from "vitest";

import { db } from "~/database/db";

import { debitArchivedStorageGuarded } from "./archive.queries";

vi.mock("~/database/db", () => {
	const updateMock = vi.fn();
	const selectMock = vi.fn();

	return {
		db: {
			update: updateMock,
			select: selectMock,
		},
	};
});

describe("debitArchivedStorageGuarded", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("subtracts bytes and returns new balance when user has enough archive", async () => {
		const returningMock = vi.fn().mockResolvedValue([{ archivedStorage: 700 }]);
		const whereMock = vi.fn().mockReturnValue({ returning: returningMock });
		const setMock = vi.fn().mockReturnValue({ where: whereMock });

		vi.mocked(db.update).mockReturnValue({ set: setMock } as any);

		const newBalance = await debitArchivedStorageGuarded("banjo-user-id", 300);

		expect(newBalance).toBe(700);
		expect(setMock).toHaveBeenCalledOnce();
		expect(whereMock).toHaveBeenCalledOnce();
	});

	it("returns null when the guarded WHERE matches no rows (insufficient archive)", async () => {
		const returningMock = vi.fn().mockResolvedValue([]);
		const whereMock = vi.fn().mockReturnValue({ returning: returningMock });
		const setMock = vi.fn().mockReturnValue({ where: whereMock });

		vi.mocked(db.update).mockReturnValue({ set: setMock } as any);

		const result = await debitArchivedStorageGuarded(
			"kazooie-user-id",
			999_999
		);

		expect(result).toBeNull();
	});

	it("no-ops on bytes=0 and returns current balance via fetchUserArchiveState", async () => {
		const limitMock = vi.fn().mockResolvedValue([
			{
				archivedStorage: 1234,
				ownedBorderIds: [],
				equippedBorderId: null,
			},
		]);
		const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
		const fromMock = vi.fn().mockReturnValue({ where: whereMock });

		vi.mocked(db.select).mockReturnValue({ from: fromMock } as any);

		const result = await debitArchivedStorageGuarded("mumbo-user-id", 0);

		expect(result).toBe(1234);
		expect(db.update).not.toHaveBeenCalled();
	});

	it("treats negative bytes the same as zero (no-op)", async () => {
		const limitMock = vi.fn().mockResolvedValue([
			{
				archivedStorage: 42,
				ownedBorderIds: [],
				equippedBorderId: null,
			},
		]);
		const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
		const fromMock = vi.fn().mockReturnValue({ where: whereMock });

		vi.mocked(db.select).mockReturnValue({ from: fromMock } as any);

		const result = await debitArchivedStorageGuarded("gruntilda-user-id", -50);

		expect(result).toBe(42);
		expect(db.update).not.toHaveBeenCalled();
	});

	it("returns null when bytes>0 user not found (update affects 0 rows)", async () => {
		const returningMock = vi.fn().mockResolvedValue([]);
		const whereMock = vi.fn().mockReturnValue({ returning: returningMock });
		const setMock = vi.fn().mockReturnValue({ where: whereMock });

		vi.mocked(db.update).mockReturnValue({ set: setMock } as any);

		const result = await debitArchivedStorageGuarded("ghost-user-id", 100);

		expect(result).toBeNull();
	});
});
