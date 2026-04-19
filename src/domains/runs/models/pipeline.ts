export type GateDifficulty = "low" | "medium" | "high" | "critical";
export type GateTypeId = "coverage-gain" | "correct-answers" | "short-window";

export type CoverageGainRequirement = {
	type: "coverage-gain";
	threshold: number; // percentage gain required within the window
};

export type CorrectAnswersRequirement = {
	type: "correct-answers";
	count: number; // minimum correct answers in the window
	streakRequired?: number; // consecutive correct answers also required (Intense)
};

export type ShortWindowRequirement = {
	type: "short-window";
	pollCount: number; // reduced window size (3 or 4 instead of 5)
	correctRequired?: number; // all polls in window must be correct (Hard)
};

// Storage drain is a permanent modifier — not evaluated as pass/fail.
// All other requirement types are evaluated at the end of each window.
export type PassFailRequirement =
	| CoverageGainRequirement
	| CorrectAnswersRequirement
	| ShortWindowRequirement;

export type PipelineSlotRequirement = PassFailRequirement;

export type PipelineSlot = {
	gateTypeId: GateTypeId;
	difficulty: GateDifficulty;
	requirement: PipelineSlotRequirement;
	reward: number; // storage payout in bytes awarded on passing the window
};

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
