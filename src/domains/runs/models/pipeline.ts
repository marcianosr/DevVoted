// ─── Difficulty & gate identity ───────────────────────────────────────────────

export type GateDifficulty = "easy" | "normal" | "hard" | "intense";

export type GateTypeId =
	| "coverage-gain"
	| "correct-answers"
	| "storage-drain"
	| "disabled-config"
	| "short-window";

export type GateFamily = "coverage" | "accuracy" | "economy" | "pipeline";

// ─── Per-type requirement shapes ──────────────────────────────────────────────

export type CoverageGainRequirement = {
	type: "coverage-gain";
	threshold: number; // percentage gain required within the window
};

export type CorrectAnswersRequirement = {
	type: "correct-answers";
	count: number; // minimum correct answers in the window
	streakRequired?: number; // consecutive correct answers also required (Intense)
};

export type StorageDrainRequirement = {
	type: "storage-drain";
	drainPerWrong: number; // bytes drained per wrong answer — permanent run modifier
};

export type DisabledConfigRequirement = {
	type: "disabled-config";
	count: number;
	requiresRarePlus: boolean;
};

export type ShortWindowRequirement = {
	type: "short-window";
	pollCount: number; // reduced window size (3 or 4 instead of 5)
	correctRequired?: number; // all polls in window must be correct (Hard)
	noWrongRequired?: boolean; // no wrong answers allowed in window (Intense)
};

// Storage drain is a permanent modifier — not evaluated as pass/fail.
// All other requirement types are evaluated at the end of each window.
export type PassFailRequirement =
	| CoverageGainRequirement
	| CorrectAnswersRequirement
	| DisabledConfigRequirement
	| ShortWindowRequirement;

export type PermanentModifierRequirement = StorageDrainRequirement;

export type PipelineSlotRequirement =
	| PassFailRequirement
	| PermanentModifierRequirement;

// ─── Pipeline slot ────────────────────────────────────────────────────────────

export type PipelineSlot = {
	gateTypeId: GateTypeId;
	difficulty: GateDifficulty;
	requirement: PipelineSlotRequirement;
	reward: number; // storage payout in bytes awarded on passing the window
};

// ─── Upgrade card ─────────────────────────────────────────────────────────────

export type AddSlotCard = {
	kind: "add-slot";
	slot: PipelineSlot;
};

export type UpgradeSlotCard = {
	kind: "upgrade-slot";
	gateTypeId: GateTypeId;
	from: GateDifficulty;
	to: GateDifficulty;
	slot: PipelineSlot; // the upgraded slot definition
};

export type UpgradeCard = AddSlotCard | UpgradeSlotCard;
