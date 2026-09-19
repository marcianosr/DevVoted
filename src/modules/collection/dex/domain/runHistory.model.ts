import {
	bandFor,
	runCoverageOf,
	type CoverageBandId,
} from "~/modules/run/build/domain/coverageRatio.model";
import { swatchForGate } from "~/modules/run/gate/domain/swatch.model";
import { isRunOver, type RunStatus } from "~/modules/run/run/domain/run.model";

/** One climb as the archive stores it, before any reading is taken. */
export type RunHistoryRow = {
	readonly runId: number;
	readonly gatesCleared: number;
	readonly engineStatus: RunStatus;
	readonly coverage: number;
	readonly startedAt: Date | null;
	readonly finishedAt: Date | null;
	readonly swatchGates: readonly number[] | null;
};

export type RunHistoryEntry = {
	readonly runId: number;
	readonly endedAt: Date | null;
	readonly gatesCleared: number;
	/** Gates played clean, so the row can draw the same track the run wore. */
	readonly swatchGates: readonly number[];
	/** A share of every slot the run opened, never the raw units. */
	readonly coverage: number;
	readonly band: CoverageBandId;
	readonly won: boolean;
	/** The gate standing in front when the run ended, or null for a victory. */
	readonly heldBy: string | null;
};

/**
 * `run_states.coverage` counts **units**, not a percentage: reading it as one
 * reports a hundred times the truth at gate 0. `runCoverageOf` is the only
 * honest conversion, and the band must be taken from its result.
 */
const readingOf = (row: RunHistoryRow): number =>
	runCoverageOf(row.coverage, row.gatesCleared);

const heldByFor = (row: RunHistoryRow, won: boolean): string | null =>
	won ? null : (swatchForGate(row.gatesCleared)?.gateName ?? null);

const toEntry = (row: RunHistoryRow): RunHistoryEntry => {
	const coverage = readingOf(row);
	const won = row.engineStatus === "won";

	return {
		runId: row.runId,
		endedAt: row.finishedAt ?? row.startedAt,
		gatesCleared: row.gatesCleared,
		swatchGates: row.swatchGates ?? [],
		coverage,
		band: bandFor(coverage, row.gatesCleared).id,
		won,
		heldBy: heldByFor(row, won),
	};
};

/**
 * The runs worth listing: a climb still under way is not history yet, and has
 * no closing band to read.
 */
export const runHistory = (
	rows: readonly RunHistoryRow[]
): readonly RunHistoryEntry[] =>
	rows.filter((row) => isRunOver(row.engineStatus)).map(toEntry);

export const deepestGateIn = (entries: readonly RunHistoryEntry[]): number =>
	entries.reduce((deepest, entry) => Math.max(deepest, entry.gatesCleared), 0);
