import { and, eq } from "drizzle-orm";

import { db } from "@/src/database/db";
import { runGateHistoryTable, runsTable } from "@/src/database/schema";
import {
	getAllGateTypes,
	createRunGateHistoryEntry,
	getGateTypeByCode,
	getRunGateHistoryWithTypes,
	getLatestGateNumber,
	fetchUnlockedGates,
} from "~/domains/gates/api/queries";
import { DEFAULT_GATE_TYPE_CODE } from "~/domains/gates/data/gateTypes.seed";
import {
	STARTER_GATE_CODES,
	type GateType,
} from "~/domains/gates/models/gateType";
import {
	runGateHistoryToDTO,
	type RunGateHistory,
	type RunGateHistoryWithType,
} from "~/domains/gates/models/runGateHistory";

const GATE_SELECTION_COUNT = 3;

/**
 * Picks `count` random elements from an array (Fisher-Yates partial shuffle).
 */
const pickRandom = <T>(items: T[], count: number): T[] => {
	const pool = [...items];
	const result: T[] = [];

	for (let i = 0; i < Math.min(count, pool.length); i++) {
		const randomIndex = Math.floor(Math.random() * (pool.length - i)) + i;
		[pool[i], pool[randomIndex]] = [pool[randomIndex], pool[i]];
		result.push(pool[i]);
	}

	return result;
};

/**
 * Get available gate types for selection after passing a gate.
 * Returns 3 options: current gate type + 2 from unlocked pool.
 *
 * Selection rules:
 * 1. Always offer the current gate type as one option (safety/consistency)
 * 2. Fill remaining slots from the player's unlocked gate pool
 * 3. Starter gates (200-ok, 206-partial, 301-moved, 418-teapot) are always available
 * 4. Other gates require a record in the gate_unlocks table
 */
export const getAvailableGatesForSelection = async (
	currentGateTypeCode: string,
	userId: string
): Promise<GateType[]> => {
	const allGateTypes = await getAllGateTypes();
	const unlockedCodes = await fetchUnlockedGates(userId);
	const unlockedSet = new Set(unlockedCodes);

	// A gate is available if it's a starter gate OR explicitly unlocked
	const isAvailable = (code: string): boolean =>
		STARTER_GATE_CODES.has(code as never) || unlockedSet.has(code);

	const currentGateType = allGateTypes.find(
		(g) => g.code === currentGateTypeCode
	);

	// Pool of other available gates (excluding current)
	const otherAvailable = allGateTypes.filter(
		(g) => g.code !== currentGateTypeCode && isAvailable(g.code)
	);

	// Pick 2 random from available pool
	const randomPicks = pickRandom(otherAvailable, GATE_SELECTION_COUNT - 1);

	const options: GateType[] = [];
	if (currentGateType) {
		options.push(currentGateType);
	}
	options.push(...randomPicks);

	return options;
};

/**
 * Get all gate types for display, annotated with availability info.
 * Used to show locked gates with unlock hints in the UI.
 */
export const getGateTypesWithAvailability = async (
	userId: string
): Promise<Array<GateType & { isUnlocked: boolean }>> => {
	const allGateTypes = await getAllGateTypes();
	const unlockedCodes = await fetchUnlockedGates(userId);
	const unlockedSet = new Set(unlockedCodes);

	return allGateTypes.map((gate) => ({
		...gate,
		isUnlocked:
			STARTER_GATE_CODES.has(gate.code as never) || unlockedSet.has(gate.code),
	}));
};

/**
 * Select the next gate type for a run.
 * Creates a new gate history entry and clears the awaiting_gate_selection flag.
 * Both writes are atomic: if either fails the run stays in its current state.
 */
export const selectNextGate = async (
	runId: number,
	gateTypeCode: string
): Promise<RunGateHistory> => {
	// Validate gate type exists before opening a transaction
	const gateType = await getGateTypeByCode(gateTypeCode);
	if (!gateType) {
		throw new Error(`Invalid gate type: ${gateTypeCode}`);
	}

	const latestGateNumber = await getLatestGateNumber(runId);
	const nextGateNumber = latestGateNumber + 1;

	return db.transaction(async (tx) => {
		const [existing] = await tx
			.select()
			.from(runGateHistoryTable)
			.where(
				and(
					eq(runGateHistoryTable.run_id, runId),
					eq(runGateHistoryTable.gate_number, nextGateNumber)
				)
			)
			.limit(1);

		const newGateEntry = existing
			? runGateHistoryToDTO(existing)
			: runGateHistoryToDTO(
					(
						await tx
							.insert(runGateHistoryTable)
							.values({
								run_id: runId,
								gate_number: nextGateNumber,
								gate_type_code: gateTypeCode,
								passed: null,
							})
							.returning()
					)[0]
				);

		await tx
			.update(runsTable)
			.set({ awaiting_gate_selection: false })
			.where(eq(runsTable.id, runId));

		return newGateEntry;
	});
};

/**
 * Initialize the first gate for a new run.
 * Always starts with 200 OK (the default gate type).
 */
export const initializeFirstGate = async (
	runId: number
): Promise<RunGateHistory> => {
	return createRunGateHistoryEntry(runId, 1, DEFAULT_GATE_TYPE_CODE);
};

/**
 * Complete the current gate and set awaiting_gate_selection flag.
 * Called when a player passes a gate check.
 * Both writes are atomic: if either fails the gate remains in progress.
 */
export const completeCurrentGateAndAwaitSelection = async (
	runId: number,
	gateNumber: number
): Promise<void> => {
	await db.transaction(async (tx) => {
		await tx
			.update(runGateHistoryTable)
			.set({ passed: true, completed_at: new Date() })
			.where(
				and(
					eq(runGateHistoryTable.run_id, runId),
					eq(runGateHistoryTable.gate_number, gateNumber)
				)
			);

		await tx
			.update(runsTable)
			.set({ awaiting_gate_selection: true })
			.where(eq(runsTable.id, runId));
	});
};

/**
 * Get the current gate info for a run, including gate type details.
 */
export const getCurrentGateInfo = async (
	runId: number
): Promise<{
	gateHistory: RunGateHistory | null;
	gateType: GateType | null;
}> => {
	const { getCurrentGateForRun } = await import("~/domains/gates/api/queries");
	const gateHistory = await getCurrentGateForRun(runId);
	if (!gateHistory) {
		return { gateHistory: null, gateType: null };
	}

	const gateType = await getGateTypeByCode(gateHistory.gateTypeCode);
	return { gateHistory, gateType };
};

/**
 * Get the full gate path for a run (for visualization).
 */
export const getRunGatePath = async (
	runId: number
): Promise<RunGateHistoryWithType[]> => {
	return getRunGateHistoryWithTypes(runId);
};

/**
 * Check if a run is awaiting gate selection.
 */
export const isAwaitingGateSelection = async (
	runId: number
): Promise<boolean> => {
	const [run] = await db
		.select({ awaiting: runsTable.awaiting_gate_selection })
		.from(runsTable)
		.where(eq(runsTable.id, runId))
		.limit(1);

	return run?.awaiting ?? false;
};
