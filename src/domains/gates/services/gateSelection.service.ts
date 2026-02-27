import { and, eq } from "drizzle-orm";

import { db } from "@/src/database/db";
import { runGateHistoryTable, runsTable } from "@/src/database/schema";
import {
	getAllGateTypes,
	createRunGateHistoryEntry,
	getGateTypeByCode,
	getCurrentGateForRun,
	getRunGateHistoryWithTypes,
	getLatestGateNumber,
} from "~/domains/gates/api/queries";
import { DEFAULT_GATE_TYPE_CODE } from "~/domains/gates/data/gateTypes.seed";
import type { GateType } from "~/domains/gates/models/gateType";
import {
	runGateHistoryToDTO,
	type RunGateHistory,
	type RunGateHistoryWithType,
} from "~/domains/gates/models/runGateHistory";

/**
 * Get available gate types for selection after passing a gate.
 * Returns 2 options: current gate type + 1 random other type.
 */
export const getAvailableGatesForSelection = async (
	currentGateTypeCode: string
): Promise<GateType[]> => {
	const allGateTypes = await getAllGateTypes();

	// Find current gate type
	const currentGateType = allGateTypes.find(
		(g) => g.code === currentGateTypeCode
	);

	// Get other gate types
	const otherGateTypes = allGateTypes.filter(
		(g) => g.code !== currentGateTypeCode
	);

	// Pick 1 random other gate type
	const randomOther =
		otherGateTypes[Math.floor(Math.random() * otherGateTypes.length)];

	// Return current + 1 random (if available)
	const options: GateType[] = [];
	if (currentGateType) {
		options.push(currentGateType);
	}
	if (randomOther) {
		options.push(randomOther);
	}

	return options;
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
 * Always starts with the default gate type (Generalist).
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
