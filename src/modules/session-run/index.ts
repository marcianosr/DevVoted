/** Public API of the session-run domain (ADR-006). Import from here, not deep paths. */
export type { Config, ConfigFamily, CheckKind, Rarity } from "./configs/config";
export {
	rarityOf,
	focusCoverageMultiplier,
	focusDemand,
} from "./configs/config";
export { CONFIGS, CONFIG_LIST } from "./configs/configRoster";
export type {
	Effect,
	EffectContext,
	CheckStatus,
	GateWindow,
} from "./configs/effect";
export { effectOf } from "./configs/effect";
export type { Pipeline } from "./pipeline/pipeline";
export {
	BASE_SLOTS,
	MAX_SLOTS,
	coverageForAnswer,
	rewardMultiplierFor,
	canLint,
	disabledOptionIds,
	isBare,
} from "./pipeline/pipeline";
export {
	currentRequirement,
	checkStatuses,
	gateDemands,
	gatePassed,
} from "./gate/gate";
export {
	SLICE_WINDOW,
	VICTORY_GATE,
	CLIMB_BASE_REQUIREMENT,
	SPEED_MS,
	escalation,
	dropCount,
} from "./rules";
export { rebuildCost, rollDraft, DRAFT_SIZE } from "./draft/draft";
export type {
	SessionState,
	SessionAction,
	SessionStatus,
	SessionPoll,
	SessionOption,
} from "./climb/sessionRun";
export { createSession, sessionReducer, LINT_COST } from "./climb/sessionRun";
