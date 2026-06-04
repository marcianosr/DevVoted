import { creditArchivedStorage } from "~/domains/economy/api/archive.queries";
import { getStorageInfo } from "~/domains/economy/services/configManager.service";
import type { Run } from "~/domains/runs/models/run.model";

// Gate-tiered conversion of leftover in-run storage into persistent archive
// bytes. Anti-farm: a player starts each run with 1MB free, so an early-exit
// (death or manual quit) could otherwise be repeated to harvest meta currency.
// At gate 2 (20%) the best possible quit-farm nets less than one common border,
// so legitimate play strictly dominates.
const GATE_CONVERSION_RATES: Record<number, number> = {
	1: 0, // game rules prevent gate-1 quit/death; defensive 0 anyway
	2: 0.2,
	3: 0.25,
	4: 0.5,
};

export const getConversionRateForGate = (gate: number): number => {
	if (gate >= 5) return 1;
	return GATE_CONVERSION_RATES[gate] ?? 0;
};

export const calculateArchiveCredit = (run: Run, gate: number): number => {
	const { storageAvailable } = getStorageInfo(run);

	if (storageAvailable <= 0) return 0;

	const rate = getConversionRateForGate(gate);
	return Math.floor(storageAvailable * rate);
};

// Credit a finished run's unused storage to the user's persistent archive.
// Non-throwing on purpose — callers in the run-completion flow treat this as
// non-critical (mirrors the leaderboard write pattern).
export const archiveLeftoverStorage = async (
	run: Run,
	gate: number
): Promise<{ credited: number; total: number } | null> => {
	const credited = calculateArchiveCredit(run, gate);

	if (credited === 0) return { credited: 0, total: 0 };

	try {
		const total = await creditArchivedStorage(run.userId, credited);
		return { credited, total };
	} catch (err) {
		console.error("[archiveLeftoverStorage] Credit failed:", err);
		return null;
	}
};
