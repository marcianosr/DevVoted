import { and, desc, eq } from "drizzle-orm";

import { db } from "@/src/database/db";
import { gateTypesTable, runGateHistoryTable } from "@/src/database/schema";
import {
	gateTypeToDTO,
	gateTypesToDTOs,
	type GateType,
} from "~/domains/gates/models/gateType";
import {
	runGateHistoryToDTO,
	runGateHistoryToDTOs,
	type RunGateHistory,
	type RunGateHistoryWithType,
} from "~/domains/gates/models/runGateHistory";

// === Gate Types Queries ===

export const getAllGateTypes = async (): Promise<GateType[]> => {
	const records = await db.select().from(gateTypesTable);
	return gateTypesToDTOs(records);
};

export const getGateTypeByCode = async (
	code: string
): Promise<GateType | null> => {
	const [record] = await db
		.select()
		.from(gateTypesTable)
		.where(eq(gateTypesTable.code, code));

	return record ? gateTypeToDTO(record) : null;
};

// === Run Gate History Queries ===

export const getRunGateHistory = async (
	runId: number
): Promise<RunGateHistory[]> => {
	const records = await db
		.select()
		.from(runGateHistoryTable)
		.where(eq(runGateHistoryTable.run_id, runId))
		.orderBy(runGateHistoryTable.gate_number);

	return runGateHistoryToDTOs(records);
};

export const getRunGateHistoryWithTypes = async (
	runId: number
): Promise<RunGateHistoryWithType[]> => {
	const records = await db
		.select({
			id: runGateHistoryTable.id,
			run_id: runGateHistoryTable.run_id,
			gate_number: runGateHistoryTable.gate_number,
			gate_type_code: runGateHistoryTable.gate_type_code,
			passed: runGateHistoryTable.passed,
			started_at: runGateHistoryTable.started_at,
			completed_at: runGateHistoryTable.completed_at,
			gate_type_name: gateTypesTable.name,
			stake: gateTypesTable.stake,
		})
		.from(runGateHistoryTable)
		.innerJoin(
			gateTypesTable,
			eq(runGateHistoryTable.gate_type_code, gateTypesTable.code)
		)
		.where(eq(runGateHistoryTable.run_id, runId))
		.orderBy(runGateHistoryTable.gate_number);

	return records.map((r) => ({
		id: r.id,
		runId: r.run_id,
		gateNumber: r.gate_number,
		gateTypeCode: r.gate_type_code,
		passed: r.passed,
		startedAt: r.started_at || new Date(),
		completedAt: r.completed_at,
		gateTypeName: r.gate_type_name,
		stake: r.stake,
	}));
};

export const getCurrentGateForRun = async (
	runId: number
): Promise<RunGateHistory | null> => {
	const [record] = await db
		.select()
		.from(runGateHistoryTable)
		.where(
			and(
				eq(runGateHistoryTable.run_id, runId),
				eq(runGateHistoryTable.passed, false)
			)
		)
		.orderBy(desc(runGateHistoryTable.gate_number))
		.limit(1);

	// If no in-progress gate, get the latest one
	if (!record) {
		const [latestRecord] = await db
			.select()
			.from(runGateHistoryTable)
			.where(eq(runGateHistoryTable.run_id, runId))
			.orderBy(desc(runGateHistoryTable.gate_number))
			.limit(1);

		return latestRecord ? runGateHistoryToDTO(latestRecord) : null;
	}

	return runGateHistoryToDTO(record);
};

export type CurrentGateInfo = {
	gateNumber: number;
	gateType: GateType;
	passed: boolean | null;
};

/**
 * Gets the current gate for a run along with its gate type info.
 * Returns a default Generalist gate (gate 1) if no gate history exists.
 */
export const getCurrentGateWithType = async (
	runId: number
): Promise<CurrentGateInfo> => {
	const [record] = await db
		.select({
			gateNumber: runGateHistoryTable.gate_number,
			passed: runGateHistoryTable.passed,
			gateTypeId: gateTypesTable.id,
			gateTypeCode: gateTypesTable.code,
			gateTypeName: gateTypesTable.name,
			gateTypeDescription: gateTypesTable.description,
			gateTypeStake: gateTypesTable.stake,
			gateTypePollsPerGate: gateTypesTable.polls_per_gate,
			gateTypeModifierConfig: gateTypesTable.modifier_config,
			gateTypeCreatedAt: gateTypesTable.created_at,
			gateTypeUpdatedAt: gateTypesTable.updated_at,
		})
		.from(runGateHistoryTable)
		.innerJoin(
			gateTypesTable,
			eq(runGateHistoryTable.gate_type_code, gateTypesTable.code)
		)
		.where(eq(runGateHistoryTable.run_id, runId))
		.orderBy(desc(runGateHistoryTable.gate_number))
		.limit(1);

	// If no gate history exists, return default Generalist gate
	if (!record) {
		const generalistType = await getGateTypeByCode("generalist");
		if (!generalistType) {
			throw new Error("Generalist gate type not found in database");
		}
		return {
			gateNumber: 1,
			gateType: generalistType,
			passed: null,
		};
	}

	return {
		gateNumber: record.gateNumber,
		gateType: gateTypeToDTO({
			id: record.gateTypeId,
			code: record.gateTypeCode,
			name: record.gateTypeName,
			description: record.gateTypeDescription,
			stake: record.gateTypeStake,
			polls_per_gate: record.gateTypePollsPerGate,
			modifier_config: record.gateTypeModifierConfig,
			created_at: record.gateTypeCreatedAt,
			updated_at: record.gateTypeUpdatedAt,
		}),
		passed: record.passed,
	};
};

export const createRunGateHistoryEntry = async (
	runId: number,
	gateNumber: number,
	gateTypeCode: string
): Promise<RunGateHistory> => {
	// Check if entry already exists (idempotent operation)
	const existing = await db
		.select()
		.from(runGateHistoryTable)
		.where(
			and(
				eq(runGateHistoryTable.run_id, runId),
				eq(runGateHistoryTable.gate_number, gateNumber)
			)
		)
		.limit(1);

	if (existing[0]) {
		return runGateHistoryToDTO(existing[0]);
	}

	const [record] = await db
		.insert(runGateHistoryTable)
		.values({
			run_id: runId,
			gate_number: gateNumber,
			gate_type_code: gateTypeCode,
			passed: null,
		})
		.returning();

	return runGateHistoryToDTO(record);
};

export const markGateAsPassed = async (
	runId: number,
	gateNumber: number
): Promise<void> => {
	await db
		.update(runGateHistoryTable)
		.set({
			passed: true,
			completed_at: new Date(),
		})
		.where(
			and(
				eq(runGateHistoryTable.run_id, runId),
				eq(runGateHistoryTable.gate_number, gateNumber)
			)
		);
};

export const markGateAsFailed = async (
	runId: number,
	gateNumber: number
): Promise<void> => {
	await db
		.update(runGateHistoryTable)
		.set({
			passed: false,
			completed_at: new Date(),
		})
		.where(
			and(
				eq(runGateHistoryTable.run_id, runId),
				eq(runGateHistoryTable.gate_number, gateNumber)
			)
		);
};

export const getLatestGateNumber = async (runId: number): Promise<number> => {
	const [record] = await db
		.select({ gateNumber: runGateHistoryTable.gate_number })
		.from(runGateHistoryTable)
		.where(eq(runGateHistoryTable.run_id, runId))
		.orderBy(desc(runGateHistoryTable.gate_number))
		.limit(1);

	return record?.gateNumber ?? 0;
};

// === Seed Helpers ===

export const insertGateType = async (gateType: {
	code: string;
	name: string;
	description: string | null;
	stake: "very_easy" | "easy" | "medium" | "hard" | "very_hard";
	pollsPerGate: number;
	modifierConfig: Record<string, unknown>;
}): Promise<GateType> => {
	const [record] = await db
		.insert(gateTypesTable)
		.values({
			code: gateType.code,
			name: gateType.name,
			description: gateType.description,
			stake: gateType.stake,
			polls_per_gate: gateType.pollsPerGate,
			modifier_config: gateType.modifierConfig,
		})
		.returning();

	return gateTypeToDTO(record);
};

export const gateTypeExists = async (code: string): Promise<boolean> => {
	const [record] = await db
		.select({ code: gateTypesTable.code })
		.from(gateTypesTable)
		.where(eq(gateTypesTable.code, code))
		.limit(1);

	return !!record;
};
