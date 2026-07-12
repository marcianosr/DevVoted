/** Public API of the session-run domain (ADR-006). Import from here, not deep paths. */
export type { Config, ConfigFamily, CheckKind, Rarity } from "./configs/config";
export {
	rarityOf,
	focusCoverageMultiplier,
	focusDemand,
} from "./configs/config";
export { CONFIGS, CONFIG_LIST } from "./configs/configRoster";
export type { Pipeline } from "./pipeline/pipeline";
export {
	BASE_SLOTS,
	MAX_SLOTS,
	coverageForAnswer,
	rewardMultiplierFor,
	hasLinter,
	disabledOptionIds,
	isBare,
} from "./pipeline/pipeline";
export type { CheckStatus, GateWindow } from "./gate/gate";
export {
	SLICE_WINDOW,
	VICTORY_GATE,
	CLIMB_BASE_REQUIREMENT,
	dropCount,
	escalation,
	currentRequirement,
	checkStatuses,
	gateDemands,
	gatePassed,
} from "./gate/gate";
export { rebuildCost, rollDraft, DRAFT_SIZE } from "./draft/draft";
export type {
	SessionState,
	SessionAction,
	SessionStatus,
	SessionPoll,
	SessionOption,
} from "./climb/sessionRun";
export {
	createSession,
	sessionReducer,
	SPEED_MS,
	LINT_COST,
} from "./climb/sessionRun";
