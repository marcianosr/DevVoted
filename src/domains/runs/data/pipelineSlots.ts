import { STORAGE_UNITS } from "~/lib/storage";
import type { CategoryCode } from "~/domains/shared/categories";
import type {
	GateDifficulty,
	GateTypeId,
	PipelineSlot,
	PipelineSlotRequirement,
} from "~/domains/runs/models/pipeline";

// ─── Rewards ──────────────────────────────────────────────────────────────────

export const SLOT_REWARDS: Record<GateDifficulty, number> = {
	low: 60 * STORAGE_UNITS.KB,
	medium: 120 * STORAGE_UNITS.KB,
	high: 240 * STORAGE_UNITS.KB,
	critical: 480 * STORAGE_UNITS.KB,
};

// ─── Difficulty distribution ──────────────────────────────────────────────────

export type DifficultyWeights = Record<GateDifficulty, number>;

export type DifficultyDistributionEntry = {
	readonly gateRange: readonly [number, number | null]; // [min, max], null = no upper bound
	readonly weights: DifficultyWeights;
};

export const DIFFICULTY_DISTRIBUTION: readonly DifficultyDistributionEntry[] = [
	{
		gateRange: [1, 3],
		weights: { low: 80, medium: 15, high: 4, critical: 1 },
	},
	{
		gateRange: [4, 6],
		weights: { low: 20, medium: 60, high: 15, critical: 5 },
	},
	{
		gateRange: [7, 9],
		weights: { low: 5, medium: 20, high: 60, critical: 15 },
	},
	{
		gateRange: [10, 12],
		weights: { low: 0, medium: 10, high: 55, critical: 35 },
	},
	{
		gateRange: [13, 15],
		weights: { low: 0, medium: 5, high: 40, critical: 55 },
	},
	{
		gateRange: [16, null],
		weights: { low: 0, medium: 0, high: 30, critical: 70 },
	},
];

// ─── Slot definitions ─────────────────────────────────────────────────────────

type SlotVariant = {
	requirement: PipelineSlotRequirement;
	reward: number;
};

type PipelineSlotDefinition = {
	difficulties: Partial<Record<GateDifficulty, SlotVariant>>;
};

export type StaticGateTypeId = Exclude<GateTypeId, "category-mastery">;

export const STARTER_SLOT_DEFINITIONS: Record<
	StaticGateTypeId,
	PipelineSlotDefinition
> = {
	"coverage-gain": {
		difficulties: {
			low: {
				requirement: { type: "coverage-gain", threshold: 3 },
				reward: SLOT_REWARDS.low,
			},
			medium: {
				requirement: { type: "coverage-gain", threshold: 5 },
				reward: SLOT_REWARDS.medium,
			},
			high: {
				requirement: { type: "coverage-gain", threshold: 8 },
				reward: SLOT_REWARDS.high,
			},
			critical: {
				requirement: { type: "coverage-gain", threshold: 12 },
				reward: SLOT_REWARDS.critical,
			},
		},
	},
	"correct-answers": {
		difficulties: {
			low: {
				requirement: { type: "correct-answers", count: 2 },
				reward: SLOT_REWARDS.low,
			},
			medium: {
				requirement: { type: "correct-answers", count: 3 },
				reward: SLOT_REWARDS.medium,
			},
			high: {
				requirement: { type: "correct-answers", count: 4 },
				reward: SLOT_REWARDS.high,
			},
			critical: {
				requirement: { type: "correct-answers", count: 5 },
				reward: SLOT_REWARDS.critical,
			},
		},
	},
	"cold-start": {
		difficulties: {
			low: {
				requirement: { type: "cold-start", count: 1 },
				reward: SLOT_REWARDS.low,
			},
			medium: {
				requirement: { type: "cold-start", count: 2 },
				reward: SLOT_REWARDS.medium,
			},
			high: {
				requirement: { type: "cold-start", count: 3 },
				reward: SLOT_REWARDS.high,
			},
			critical: {
				requirement: { type: "cold-start", count: 4 },
				reward: SLOT_REWARDS.critical,
			},
		},
	},
	"short-window": {
		difficulties: {
			low: {
				requirement: { type: "short-window", pollCount: 5 },
				reward: SLOT_REWARDS.low,
			},
			// TODO: doesn't work yet in combinarion with correct-answers req, need to decide how to handle the interaction of "all polls must be correct" vs "need X correct answers in window"
			// medium: {
			// 	requirement: { type: "short-window", pollCount: 4 },
			// 	reward: SLOT_REWARDS.medium,
			// },
			// high: {
			// 	requirement: {
			// 		type: "short-window",
			// 		pollCount: 3,
			// 	},
			// 	reward: SLOT_REWARDS.high,
			// },
			// critical: {
			// 	requirement: {
			// 		type: "short-window",
			// 		pollCount: 2,
			// 	},
			// 	reward: SLOT_REWARDS.critical,
			// },
		},
	},
};

// ─── Category mastery ─────────────────────────────────────────────────────────

const CATEGORY_MASTERY_MIN_CORRECT: Record<GateDifficulty, number | null> = {
	low: 1,
	medium: 2,
	high: 3,
	critical: null, // all that appear must be correct
};

export const getCategoryMasterySlot = (
	category: CategoryCode,
	difficulty: GateDifficulty = "low"
): PipelineSlot => ({
	gateTypeId: "category-mastery",
	difficulty,
	requirement: {
		type: "category-mastery",
		category,
		minCorrect: CATEGORY_MASTERY_MIN_CORRECT[difficulty],
	},
	reward: SLOT_REWARDS[difficulty],
});

// ─── Starter pool ─────────────────────────────────────────────────────────────

export const STARTER_GATE_TYPE_IDS: readonly StaticGateTypeId[] = [
	"coverage-gain",
	"correct-answers",
	"cold-start",
] as const;

// ─── Lookup helpers ───────────────────────────────────────────────────────────

export const getSlotDefinition = (
	gateTypeId: StaticGateTypeId,
	difficulty: GateDifficulty
): PipelineSlot | null => {
	const variant = STARTER_SLOT_DEFINITIONS[gateTypeId].difficulties[difficulty];

	if (!variant) return null;

	return {
		gateTypeId,
		difficulty,
		requirement: variant.requirement,
		reward: variant.reward,
	};
};

export const getDifficultyWeights = (gateNumber: number): DifficultyWeights => {
	const entry = DIFFICULTY_DISTRIBUTION.find(({ gateRange }) => {
		const [min, max] = gateRange;
		return gateNumber >= min && (max === null || gateNumber <= max);
	});

	return (
		entry?.weights ??
		DIFFICULTY_DISTRIBUTION[DIFFICULTY_DISTRIBUTION.length - 1].weights
	);
};
