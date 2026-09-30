import { beforeEach, describe, expect, it, vi } from "vitest";

import { createMockRunRecord } from "~/test/runRecord.factory";
import { createMockRunView } from "~/test/runView.factory";

import { dispatchRunActionService } from "~/modules/run/run/application/run.service";
import {
	ARCHIVE_SHORT,
	warmBootRunService,
} from "~/modules/run/run/application/warmBoot.service";
import {
	EXTEND_CARRY_BYTES,
	PIN_CARRY_BYTES,
} from "~/modules/run/run/domain/rules.model";
import { createRun, type RunState } from "~/modules/run/run/domain/run.model";
import { handed, pool, started } from "~/modules/run/run/domain/run.factory";
import { bootRun } from "~/modules/run/run/domain/warmBoot.model";
import * as runs from "~/modules/run/run/infrastructure/run.repository";
import type { RunTx } from "~/modules/run/run/infrastructure/run.repository";
import * as services from "~/modules/run/shop/infrastructure/serviceUnlock.repository";
import { STORAGE_UNITS } from "~/shared/lib/storage";

vi.mock("~/modules/run/run/infrastructure/run.repository", () => ({
	findActiveSessionRun: vi.fn(),
	loadRunState: vi.fn(),
	debitArchivedStorage: vi.fn(),
}));

vi.mock("~/modules/run/shop/infrastructure/serviceUnlock.repository", () => ({
	fetchUnlockedServiceIds: vi.fn(),
}));

vi.mock("~/modules/run/run/application/run.service", () => ({
	dispatchRunActionService: vi.fn(),
}));

vi.mock(
	"~/modules/run/incident/application/incidentSettlement.service",
	() => ({
		settleIncidents: vi.fn(
			() => async (_tx: unknown, _before: RunState, after: RunState) => after
		),
	})
);

const MISTY = "misty";
const DATE = "2026-09-29";
const LIVE_RUN = createMockRunRecord({ id: 64, user_id: MISTY });
const EVERYTHING = ["bootCache", "extend", "pin"];
const RUNG_ONE_BYTES = 256 * STORAGE_UNITS.KB;

const tx = {} as unknown as RunTx;

const configuring = (): RunState => createRun(pool(5), handed);

const boot = (pick: Parameters<typeof warmBootRunService>[0]["pick"]) =>
	warmBootRunService({ userId: MISTY, date: DATE, pick });

const refusalOf = async (
	pick: Parameters<typeof warmBootRunService>[0]["pick"]
) => {
	const result = await boot(pick);
	expect(result.success).toBe(false);
	return result.success ? "" : result.error;
};

const settleOf = () =>
	vi.mocked(dispatchRunActionService).mock.calls[0][0].settle?.(LIVE_RUN.id);

describe("warmBootRunService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(runs.findActiveSessionRun).mockResolvedValue(LIVE_RUN);
		vi.mocked(runs.loadRunState).mockResolvedValue(configuring());
		vi.mocked(services.fetchUnlockedServiceIds).mockResolvedValue(EVERYTHING);
		vi.mocked(dispatchRunActionService).mockResolvedValue({
			success: true,
			data: createMockRunView(),
		});
	});

	it("mints the boot from the pick, priced by the roster and the rung, never by the client", async () => {
		const result = await boot({ bootCacheRung: 1, serviceIds: ["pin"] });

		expect(result.success).toBe(true);
		expect(dispatchRunActionService).toHaveBeenCalledWith(
			expect.objectContaining({
				userId: MISTY,
				date: DATE,
				action: {
					type: "warm-boot",
					storageKb: 128,
					serviceIds: ["pin"],
					archiveBytes: RUNG_ONE_BYTES + PIN_CARRY_BYTES,
				},
			})
		);
	});

	it("refuses an account with no run to boot", async () => {
		vi.mocked(runs.findActiveSessionRun).mockResolvedValue(null);

		expect(await refusalOf({ bootCacheRung: 0, serviceIds: [] })).toContain(
			"Start a run"
		);
		expect(dispatchRunActionService).not.toHaveBeenCalled();
	});

	it("refuses a run that has already started", async () => {
		vi.mocked(runs.loadRunState).mockResolvedValue(started(["js"]));

		expect(await refusalOf({ bootCacheRung: 0, serviceIds: [] })).toContain(
			"already started"
		);
		expect(dispatchRunActionService).not.toHaveBeenCalled();
	});

	it("refuses a second boot", async () => {
		vi.mocked(runs.loadRunState).mockResolvedValue(
			bootRun(configuring(), {
				storageKb: 64,
				serviceIds: [],
				archiveBytes: 128 * STORAGE_UNITS.KB,
			})
		);

		expect(await refusalOf({ serviceIds: ["extend"] })).toContain(
			"already booted"
		);
		expect(dispatchRunActionService).not.toHaveBeenCalled();
	});

	it("refuses a service the account has not unlocked, and an empty pick", async () => {
		vi.mocked(services.fetchUnlockedServiceIds).mockResolvedValue([]);

		expect(await refusalOf({ serviceIds: ["extend"] })).toContain(
			"not unlocked"
		);
		expect(await refusalOf({ serviceIds: [] })).toContain("Pick something");
		expect(dispatchRunActionService).not.toHaveBeenCalled();
	});

	it("debits the archive inside the run's own transaction, for the bytes the order priced", async () => {
		vi.mocked(runs.debitArchivedStorage).mockResolvedValue(0);
		await boot({ serviceIds: ["extend", "pin"] });
		const settle = settleOf();
		const before = configuring();
		const after = bootRun(before, {
			storageKb: 0,
			serviceIds: ["extend", "pin"],
			archiveBytes: EXTEND_CARRY_BYTES + PIN_CARRY_BYTES,
		});

		await expect(settle?.(tx, before, after)).resolves.toBe(after);

		expect(runs.debitArchivedStorage).toHaveBeenCalledWith(
			tx,
			MISTY,
			EXTEND_CARRY_BYTES + PIN_CARRY_BYTES
		);
	});

	it("rolls the boot back when the archive cannot cover it", async () => {
		vi.mocked(runs.debitArchivedStorage).mockResolvedValue(null);
		await boot({ bootCacheRung: 2, serviceIds: [] });
		const before = configuring();
		const after = bootRun(before, {
			storageKb: 256,
			serviceIds: [],
			archiveBytes: 512 * STORAGE_UNITS.KB,
		});

		await expect(settleOf()?.(tx, before, after)).rejects.toThrow(
			ARCHIVE_SHORT
		);
	});

	it("debits nothing when the reducer left the run unbooted", async () => {
		await boot({ bootCacheRung: 0, serviceIds: [] });
		const before = configuring();

		await expect(settleOf()?.(tx, before, before)).resolves.toBe(before);

		expect(runs.debitArchivedStorage).not.toHaveBeenCalled();
	});
});
