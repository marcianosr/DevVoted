import { STORAGE_UNITS } from "~/lib/storage";
import type {
	GateDifficulty,
	GateFamily,
	GateTypeId,
	PipelineSlot,
	PipelineSlotRequirement,
} from "~/domains/runs/models/pipeline";

// ─── Rewards ──────────────────────────────────────────────────────────────────

export const SLOT_REWARDS: Record<GateDifficulty, number> = {
	easy: 60 * STORAGE_UNITS.KB,
	normal: 120 * STORAGE_UNITS.KB,
	hard: 240 * STORAGE_UNITS.KB,
	intense: 480 * STORAGE_UNITS.KB,
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
		weights: { easy: 80, normal: 15, hard: 4, intense: 1 },
	},
	{
		gateRange: [4, 6],
		weights: { easy: 20, normal: 60, hard: 15, intense: 5 },
	},
	{
		gateRange: [7, 9],
		weights: { easy: 5, normal: 20, hard: 60, intense: 15 },
	},
	{
		gateRange: [10, 12],
		weights: { easy: 0, normal: 10, hard: 55, intense: 35 },
	},
	{
		gateRange: [13, 15],
		weights: { easy: 0, normal: 5, hard: 40, intense: 55 },
	},
	{
		gateRange: [16, null],
		weights: { easy: 0, normal: 0, hard: 30, intense: 70 },
	},
];

// ─── Slot definitions ─────────────────────────────────────────────────────────

type SlotVariant = {
	requirement: PipelineSlotRequirement;
	reward: number;
};

type PipelineSlotDefinition = {
	family: GateFamily;
	difficulties: Record<GateDifficulty, SlotVariant>;
};

export const STARTER_SLOT_DEFINITIONS: Record<
	GateTypeId,
	PipelineSlotDefinition
> = {
	"coverage-gain": {
		family: "coverage",
		difficulties: {
			easy: {
				requirement: { type: "coverage-gain", threshold: 3 },
				reward: SLOT_REWARDS.easy,
			},
			normal: {
				requirement: { type: "coverage-gain", threshold: 5 },
				reward: SLOT_REWARDS.normal,
			},
			hard: {
				requirement: { type: "coverage-gain", threshold: 8 },
				reward: SLOT_REWARDS.hard,
			},
			intense: {
				requirement: { type: "coverage-gain", threshold: 12 },
				reward: SLOT_REWARDS.intense,
			},
		},
	},
	"correct-answers": {
		family: "accuracy",
		difficulties: {
			easy: {
				requirement: { type: "correct-answers", count: 3 },
				reward: SLOT_REWARDS.easy,
			},
			normal: {
				requirement: { type: "correct-answers", count: 4 },
				reward: SLOT_REWARDS.normal,
			},
			hard: {
				requirement: { type: "correct-answers", count: 5 },
				reward: SLOT_REWARDS.hard,
			},
			intense: {
				requirement: { type: "correct-answers", count: 5, streakRequired: 2 },
				reward: SLOT_REWARDS.intense,
			},
		},
	},
	"no-wrong-answers": {
		family: "accuracy",
		difficulties: {
			easy: {
				requirement: { type: "no-wrong-answers", maxWrong: 2 },
				reward: SLOT_REWARDS.easy,
			},
			normal: {
				requirement: { type: "no-wrong-answers", maxWrong: 1 },
				reward: SLOT_REWARDS.normal,
			},
			hard: {
				requirement: { type: "no-wrong-answers", maxWrong: 0 },
				reward: SLOT_REWARDS.hard,
			},
			intense: {
				requirement: {
					type: "no-wrong-answers",
					maxWrong: 0,
					streakRequired: 2,
				},
				reward: SLOT_REWARDS.intense,
			},
		},
	},
	"storage-drain": {
		family: "economy",
		difficulties: {
			easy: {
				requirement: {
					type: "storage-drain",
					drainPerWrong: 5 * STORAGE_UNITS.KB,
				},
				reward: SLOT_REWARDS.easy,
			},
			normal: {
				requirement: {
					type: "storage-drain",
					drainPerWrong: 10 * STORAGE_UNITS.KB,
				},
				reward: SLOT_REWARDS.normal,
			},
			hard: {
				requirement: {
					type: "storage-drain",
					drainPerWrong: 20 * STORAGE_UNITS.KB,
				},
				reward: SLOT_REWARDS.hard,
			},
			intense: {
				requirement: {
					type: "storage-drain",
					drainPerWrong: 40 * STORAGE_UNITS.KB,
				},
				reward: SLOT_REWARDS.intense,
			},
		},
	},
	"disabled-config": {
		family: "pipeline",
		difficulties: {
			easy: {
				requirement: {
					type: "disabled-config",
					count: 1,
					requiresRarePlus: false,
				},
				reward: SLOT_REWARDS.easy,
			},
			normal: {
				requirement: {
					type: "disabled-config",
					count: 1,
					requiresRarePlus: true,
				},
				reward: SLOT_REWARDS.normal,
			},
			hard: {
				requirement: {
					type: "disabled-config",
					count: 2,
					requiresRarePlus: false,
				},
				reward: SLOT_REWARDS.hard,
			},
			intense: {
				requirement: {
					type: "disabled-config",
					count: 2,
					requiresRarePlus: true,
				},
				reward: SLOT_REWARDS.intense,
			},
		},
	},
	"short-window": {
		family: "pipeline",
		difficulties: {
			easy: {
				requirement: { type: "short-window", pollCount: 4 },
				reward: SLOT_REWARDS.easy,
			},
			normal: {
				requirement: { type: "short-window", pollCount: 3 },
				reward: SLOT_REWARDS.normal,
			},
			hard: {
				requirement: {
					type: "short-window",
					pollCount: 3,
					correctRequired: 3, // all polls in window must be correct
				},
				reward: SLOT_REWARDS.hard,
			},
			intense: {
				requirement: {
					type: "short-window",
					pollCount: 3,
					noWrongRequired: true,
				},
				reward: SLOT_REWARDS.intense,
			},
		},
	},
};

// ─── Lookup helpers ───────────────────────────────────────────────────────────

export const getSlotDefinition = (
	gateTypeId: GateTypeId,
	difficulty: GateDifficulty
): PipelineSlot => {
	const variant = STARTER_SLOT_DEFINITIONS[gateTypeId].difficulties[difficulty];

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
