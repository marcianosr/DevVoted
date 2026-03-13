import { InferSelectModel } from "drizzle-orm";

import { gateTypesTable } from "@/src/database/schema";

export type GateStake = "very_easy" | "easy" | "medium" | "hard" | "very_hard";

export type GateModifierConfig = {
	// === SCORE CALCULATION (evaluated every poll answer) ===
	wrongAnswerCoverageRate: number; // 0 = no penalty, 1 = normal, 2 = double
	correctAnswerCoverageMult?: number; // e.g., 1.1 = +10% on correct answers
	correctAnswerStorageRefund?: number; // KB refunded per correct answer
	extendedStreakThreshold?: number; // Streak length for bonus (e.g., 3)
	extendedStreakBonus?: number; // Extra coverage per answer above threshold

	// === SHOP SYSTEM (evaluated when shop loads) ===
	shopPriceMult?: number; // e.g., 1.5 = +50% costs
	shopLockedForGates?: number; // Number of gates where shop is unavailable
	shopAvailabilityChance?: number; // 0-1 probability shop is available
	shopBonusSlotOnAvailable?: boolean; // +1 slot when shop fires
	shopRarityBumpOnAvailable?: number; // Tier bump when shop fires
	shopSlotCount?: number; // Override total slots
	rerollsDisabled?: boolean; // No rerolls allowed

	// === CATEGORY / PROGRESSION (evaluated at gate check) ===
	categoryWhitelist?: string[]; // Only these categories earn coverage
	categoryFilter?: "top2" | "top3"; // Only top N count for threshold
	coverageMultForFilteredCategories?: number; // Bonus for categories that count
	configCategoryEffectMult?: number; // Buff installed config category effects

	// === RUN INITIALIZATION (evaluated once at gate start) ===
	startingStorageMult?: number; // e.g., 0.25 = 25% normal storage
	weakestCategoryBoost?: number; // Free coverage on weakest category
	weakestCategoryWeightMult?: number; // Poll weight multiplier for weakest
};

export const GATE_TYPE_CODES = [
	"200-ok",
	"206-partial",
	"301-moved",
	"418-teapot",
	"401-unauthorized",
	"402-payment",
	"503-unavailable",
	"507-storage",
	"429-too-many",
	"500-error",
] as const;

export type GateTypeCode = (typeof GATE_TYPE_CODES)[number];

export const STARTER_GATE_CODES: ReadonlySet<GateTypeCode> = new Set([
	"200-ok",
	"206-partial",
	"301-moved",
	"418-teapot",
]);

export type GateType = {
	id: number;
	code: string;
	name: string;
	description: string | null;
	stake: GateStake;
	pollsPerGate: number;
	modifierConfig: GateModifierConfig;
	unlockCondition: string | null;
	constraint: string | null;
	reward: string | null;
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
	unlockCondition: record.unlock_condition,
	constraint: record.constraint_text,
	reward: record.reward_text,
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
	unlock_condition: dto.unlockCondition,
	constraint_text: dto.constraint,
	reward_text: dto.reward,
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
	code: "200-ok",
	name: "200 OK",
	description: "Normal rules, no modifiers. The baseline safe choice.",
	stake: "easy",
	pollsPerGate: 5,
	modifierConfig: { wrongAnswerCoverageRate: 1 },
	unlockCondition: null,
	constraint: null,
	reward: null,
	createdAt: new Date("2024-12-25T00:00:00Z"),
	updatedAt: new Date("2024-12-25T00:00:00Z"),
	...overrides,
});

export const createMockGateTypeRecord = (
	overrides: Partial<GateTypeRecord> = {}
): GateTypeRecord => ({
	id: 1,
	code: "200-ok",
	name: "200 OK",
	description: "Normal rules, no modifiers. The baseline safe choice.",
	stake: "easy",
	polls_per_gate: 5,
	modifier_config: { wrongAnswerCoverageRate: 1 },
	unlock_condition: null,
	constraint_text: null,
	reward_text: null,
	created_at: new Date("2024-12-25T00:00:00Z"),
	updated_at: new Date("2024-12-25T00:00:00Z"),
	...overrides,
});

export const gateTypeFactory = {
	toDTO: gateTypeToDTO,
	fromDTO: gateTypeFromDTO,
	toDTOs: gateTypesToDTOs,
};
