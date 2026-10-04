import {
	bandFor,
	runShareOf,
	type CoverageBandId,
} from "~/modules/run/build/domain/coverageRatio.model";
import { swatchForGate } from "~/modules/run/gate/domain/swatch.model";
import { isRunOver, type RunStatus } from "~/modules/run/run/domain/run.model";

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
	readonly swatchGates: readonly number[];
	readonly coverage: number;
	readonly band: CoverageBandId;
	readonly won: boolean;
	readonly heldBy: string | null;
};

const readingOf = (row: RunHistoryRow): number =>
	runShareOf(row.coverage, row.gatesCleared);

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

export const runHistory = (
	rows: readonly RunHistoryRow[]
): readonly RunHistoryEntry[] =>
	rows.filter((row) => isRunOver(row.engineStatus)).map(toEntry);

export const deepestGateIn = (
	climbs: readonly { readonly gatesCleared: number }[]
): number =>
	climbs.reduce((deepest, climb) => Math.max(deepest, climb.gatesCleared), 0);

const isBetterRun = (
	candidate: RunHistoryEntry,
	best: RunHistoryEntry
): boolean =>
	candidate.gatesCleared === best.gatesCleared
		? candidate.coverage > best.coverage
		: candidate.gatesCleared > best.gatesCleared;

export const bestRunIn = (
	entries: readonly RunHistoryEntry[]
): RunHistoryEntry | null =>
	entries.reduce<RunHistoryEntry | null>(
		(best, entry) => (best === null || isBetterRun(entry, best) ? entry : best),
		null
	);

export const runsWonIn = (entries: readonly RunHistoryEntry[]): number =>
	entries.filter((entry) => entry.won).length;
