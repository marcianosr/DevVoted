import { InferSelectModel } from "drizzle-orm";

import { gateTypesTable } from "@/src/database/schema";

export type GateStake = "very_easy" | "easy" | "medium" | "hard" | "very_hard";

export type GateModifierConfig = {
	wrongAnswerCoverageRate: number; // Multiplier for wrong answer penalty (0 = neutral, 1 = normal)
};

export type GateType = {
	id: number;
	code: string;
	name: string;
	description: string | null;
	stake: GateStake;
	pollsPerGate: number;
	modifierConfig: GateModifierConfig;
	createdAt: Date;
	updatedAt: Date | null;
};

export type GateTypeRecord = InferSelectModel<typeof gateTypesTable>;

export const gateTypeToDTO = (record: GateTypeRecord): GateType => ({
	id: record.id,
	code: record.code,
	name: record.name,
	description: record.description,
	stake: record.stake,
	pollsPerGate: record.polls_per_gate,
	modifierConfig: (record.modifier_config as GateModifierConfig) ?? {
		wrongAnswerCoverageRate: 1,
	},
	createdAt: record.created_at || new Date(),
	updatedAt: record.updated_at,
});

export const gateTypeFromDTO = (
	dto: Omit<GateType, "id" | "createdAt" | "updatedAt">
): Omit<GateTypeRecord, "id" | "created_at" | "updated_at"> => ({
	code: dto.code,
	name: dto.name,
	description: dto.description,
	stake: dto.stake,
	polls_per_gate: dto.pollsPerGate,
	modifier_config: dto.modifierConfig,
});

export const gateTypesToDTOs = (records: GateTypeRecord[]): GateType[] =>
	records.map(gateTypeToDTO);

// Stake to color mapping for UI
export const STAKE_COLORS: Record<GateStake, string> = {
	very_easy: "green",
	easy: "green",
	medium: "orange",
	hard: "red",
	very_hard: "red",
};

// Stake to display label mapping
export const STAKE_LABELS: Record<GateStake, string> = {
	very_easy: "Very Easy",
	easy: "Easy",
	medium: "Medium",
	hard: "Hard",
	very_hard: "Very Hard",
};

// Test factory
export const createMockGateType = (
	overrides: Partial<GateType> = {}
): GateType => ({
	id: 1,
	code: "generalist",
	name: "Generalist",
	description: "Standard gate with balanced requirements",
	stake: "easy",
	pollsPerGate: 5,
	modifierConfig: { wrongAnswerCoverageRate: 1 },
	createdAt: new Date("2024-12-25T00:00:00Z"),
	updatedAt: new Date("2024-12-25T00:00:00Z"),
	...overrides,
});

export const createMockGateTypeRecord = (
	overrides: Partial<GateTypeRecord> = {}
): GateTypeRecord => ({
	id: 1,
	code: "generalist",
	name: "Generalist",
	description: "Standard gate with balanced requirements",
	stake: "easy",
	polls_per_gate: 5,
	modifier_config: { wrongAnswerCoverageRate: 1 },
	created_at: new Date("2024-12-25T00:00:00Z"),
	updated_at: new Date("2024-12-25T00:00:00Z"),
	...overrides,
});

export const gateTypeFactory = {
	toDTO: gateTypeToDTO,
	fromDTO: gateTypeFromDTO,
	toDTOs: gateTypesToDTOs,
};
