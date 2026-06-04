import { creditArchivedStorage } from "~/domains/economy/api/archive.queries";
import { getStorageInfo } from "~/domains/economy/services/configManager.service";
import type { Run } from "~/domains/runs/models/run.model";

// Conversion rate from in-run leftover bytes to persistent archive bytes.
// 1.0 = lossless (1:1). Drop below 1 to compress meta-progression pacing
// without touching unlock prices.
export const ARCHIVE_CONVERSION_RATE = 1;

export const calculateArchiveCredit = (run: Run): number => {
	const { storageAvailable } = getStorageInfo(run);

	if (storageAvailable <= 0) return 0;

	return Math.floor(storageAvailable * ARCHIVE_CONVERSION_RATE);
};

// Credit a finished run's unused storage to the user's persistent archive.
// Non-throwing on purpose — callers in the run-completion flow treat this as
// non-critical (mirrors the leaderboard write pattern).
export const archiveLeftoverStorage = async (
	run: Run
): Promise<{ credited: number; total: number } | null> => {
	const credited = calculateArchiveCredit(run);

	if (credited === 0) return { credited: 0, total: 0 };

	try {
		const total = await creditArchivedStorage(run.userId, credited);
		return { credited, total };
	} catch (err) {
		console.error("[archiveLeftoverStorage] Credit failed:", err);
		return null;
	}
};
