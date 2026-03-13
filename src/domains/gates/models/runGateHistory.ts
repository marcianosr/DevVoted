import { InferSelectModel } from "drizzle-orm";

import { runGateHistoryTable } from "@/src/database/schema";
import type { GateStake } from "~/domains/gates/models/gateType";

export type RunGateHistory = {
	id: number;
	runId: number;
	gateNumber: number;
	gateTypeCode: string;
	passed: boolean | null; // null = in progress
	gateState: Record<string, string | number | boolean | null> | null;
	startedAt: Date;
	completedAt: Date | null;
};

// Extended type with gate type info for display
export type RunGateHistoryWithType = RunGateHistory & {
	gateTypeName: string;
	stake: GateStake;
};

export type CommunityGatePath = {
	userId: string;
	displayName: string | null;
	photoUrl: string | null;
	gatePath: RunGateHistoryWithType[];
	currentGateNumber: number;
};

export type RunGateHistoryRecord = InferSelectModel<typeof runGateHistoryTable>;

export const runGateHistoryToDTO = (
	record: RunGateHistoryRecord
): RunGateHistory => ({
	id: record.id,
	runId: record.run_id,
	gateNumber: record.gate_number,
	gateTypeCode: record.gate_type_code,
	passed: record.passed,
	gateState: record.gate_state as RunGateHistory["gateState"],
	startedAt: record.started_at || new Date(),
	completedAt: record.completed_at,
});

export const runGateHistoryFromDTO = (
	dto: Omit<RunGateHistory, "id" | "startedAt" | "completedAt">
): Omit<RunGateHistoryRecord, "id" | "started_at" | "completed_at"> => ({
	run_id: dto.runId,
	gate_number: dto.gateNumber,
	gate_type_code: dto.gateTypeCode,
	passed: dto.passed,
	gate_state: dto.gateState,
});

export const runGateHistoryToDTOs = (
	records: RunGateHistoryRecord[]
): RunGateHistory[] => records.map(runGateHistoryToDTO);

// Test factory
export const createMockRunGateHistory = (
	overrides: Partial<RunGateHistory> = {}
): RunGateHistory => ({
	id: 1,
	runId: 1,
	gateNumber: 1,
	gateTypeCode: "200-ok",
	passed: null,
	gateState: null,
	startedAt: new Date("2024-12-25T00:00:00Z"),
	completedAt: null,
	...overrides,
});

export const createMockRunGateHistoryRecord = (
	overrides: Partial<RunGateHistoryRecord> = {}
): RunGateHistoryRecord => ({
	id: 1,
	run_id: 1,
	gate_number: 1,
	gate_type_code: "200-ok",
	passed: null,
	gate_state: null,
	started_at: new Date("2024-12-25T00:00:00Z"),
	completed_at: null,
	...overrides,
});

export const runGateHistoryFactory = {
	toDTO: runGateHistoryToDTO,
	fromDTO: runGateHistoryFromDTO,
	toDTOs: runGateHistoryToDTOs,
};
