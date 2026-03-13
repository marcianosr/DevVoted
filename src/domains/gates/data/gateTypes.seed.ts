import type {
	GateModifierConfig,
	GateStake,
} from "~/domains/gates/models/gateType";

export type GateTypeSeedData = {
	code: string;
	name: string;
	description: string;
	stake: GateStake;
	pollsPerGate: number;
	modifierConfig: GateModifierConfig;
	unlockCondition: string | null;
	constraintText: string | null;
	rewardText: string | null;
};

/**
 * All 10 gate types — named after HTTP status codes.
 *
 * Starter gates (always available): 200, 206, 301, 418
 * Unlockable gates (earned through play): 401, 402, 503, 507, 429, 500
 */
export const GATE_TYPES_SEED: GateTypeSeedData[] = [
	// === STARTER GATES ===
	{
		code: "200-ok",
		name: "200 OK",
		description:
			"Standard pipeline. Normal rules, no modifiers. The baseline safe choice for steady progress.",
		stake: "easy",
		pollsPerGate: 5,
		modifierConfig: {
			wrongAnswerCoverageRate: 1,
		},
		unlockCondition: null,
		constraintText: null,
		rewardText: null,
	},
	{
		code: "206-partial",
		name: "206 Partial Content",
		description:
			"Specialist path. Only your top 2 categories count toward gate threshold checks, but they earn a coverage bonus.",
		stake: "medium",
		pollsPerGate: 5,
		modifierConfig: {
			wrongAnswerCoverageRate: 1,
			categoryFilter: "top2",
			coverageMultForFilteredCategories: 1.25,
		},
		unlockCondition: null,
		constraintText: "Only top 2 categories count toward threshold",
		rewardText: "+25% coverage bonus on top 2 categories",
	},
	{
		code: "301-moved",
		name: "301 Moved Permanently",
		description:
			"Recovery path. Your weakest category gets a free coverage boost at gate start, but its poll weight doubles.",
		stake: "easy",
		pollsPerGate: 5,
		modifierConfig: {
			wrongAnswerCoverageRate: 1,
			weakestCategoryBoost: 5,
			weakestCategoryWeightMult: 2,
		},
		unlockCondition: null,
		constraintText: "Weakest category poll weight doubles",
		rewardText: "+5% free coverage boost on weakest category",
	},
	{
		code: "418-teapot",
		name: "418 I'm a Teapot",
		description:
			"The joke gate. No wrong-answer penalty, but only frontend categories (JS, TS, CSS, HTML, React) earn coverage.",
		stake: "very_easy",
		pollsPerGate: 2,
		modifierConfig: {
			wrongAnswerCoverageRate: 0,
			categoryWhitelist: ["js", "ts", "css", "html", "react"],
		},
		unlockCondition: null,
		constraintText: "Only frontend categories earn coverage",
		rewardText: "No wrong-answer penalty",
	},

	// === UNLOCKABLE GATES ===
	{
		code: "401-unauthorized",
		name: "401 Unauthorized",
		description:
			"Shop is locked for the first gate. Correct answers earn +10% bonus coverage during the locked gate.",
		stake: "hard",
		pollsPerGate: 5,
		modifierConfig: {
			wrongAnswerCoverageRate: 1,
			shopLockedForGates: 1,
			correctAnswerCoverageMult: 1.1,
		},
		unlockCondition: "Reach Gate 5 in any run",
		constraintText: "Shop locked for 1 gate",
		rewardText: "+10% coverage on correct answers during locked gate",
	},
	{
		code: "402-payment",
		name: "402 Payment Required",
		description:
			"All shop items cost 50% more storage. Every correct answer refunds +2KB storage.",
		stake: "medium",
		pollsPerGate: 5,
		modifierConfig: {
			wrongAnswerCoverageRate: 1,
			shopPriceMult: 1.5,
			correctAnswerStorageRefund: 2048,
		},
		unlockCondition: "Install 5 distinct configs across runs",
		constraintText: "Shop items cost +50% more storage",
		rewardText: "+2KB storage refund per correct answer",
	},
	{
		code: "503-unavailable",
		name: "503 Service Unavailable",
		description:
			"1-in-5 chance shop is unavailable per gate. When available: +1 slot and +1 rarity tier on all items.",
		stake: "hard",
		pollsPerGate: 5,
		modifierConfig: {
			wrongAnswerCoverageRate: 1,
			shopAvailabilityChance: 0.8,
			shopBonusSlotOnAvailable: true,
			shopRarityBumpOnAvailable: 1,
		},
		unlockCondition: "Reach Gate 7 in any run",
		constraintText: "20% chance shop is unavailable per gate",
		rewardText: "+1 shop slot and +1 rarity tier when available",
	},
	{
		code: "507-storage",
		name: "507 Insufficient Storage",
		description:
			"Start with only 25% of normal storage. Every correct answer permanently refunds +5KB.",
		stake: "hard",
		pollsPerGate: 5,
		modifierConfig: {
			wrongAnswerCoverageRate: 1,
			startingStorageMult: 0.25,
			correctAnswerStorageRefund: 5120,
		},
		unlockCondition: "Reach 75% coverage in any single category",
		constraintText: "Start with 25% of normal storage",
		rewardText: "+5KB storage refund per correct answer",
	},
	{
		code: "429-too-many",
		name: "429 Too Many Requests",
		description:
			"Rerolls disabled, only 2 shop slots. Installed configs give +50% to their category effects.",
		stake: "very_hard",
		pollsPerGate: 5,
		modifierConfig: {
			wrongAnswerCoverageRate: 1,
			rerollsDisabled: true,
			shopSlotCount: 2,
			configCategoryEffectMult: 1.5,
		},
		unlockCondition: "Complete a full run (Gate 10+)",
		constraintText: "Rerolls disabled, only 2 shop slots",
		rewardText: "Installed configs give +50% category effects",
	},
	{
		code: "500-error",
		name: "500 Internal Server Error",
		description:
			"Wrong answers deal DOUBLE penalty. Correct streaks of 3+ give an extra +0.5% bonus per answer.",
		stake: "very_hard",
		pollsPerGate: 5,
		modifierConfig: {
			wrongAnswerCoverageRate: 2,
			extendedStreakThreshold: 3,
			extendedStreakBonus: 0.5,
		},
		unlockCondition: "Unlock all other gates",
		constraintText: "Wrong answers deal double penalty",
		rewardText: "Streak of 3+ gives +0.5% bonus per answer",
	},
];

/**
 * The default gate type code that all runs start with.
 * Gate 1 is always forced 200 OK.
 */
export const DEFAULT_GATE_TYPE_CODE = "200-ok";
