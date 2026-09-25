import {
	type AnsweredPoll,
	type RunPoll,
} from "~/modules/run/run/domain/runPoll.model";

import {
	isBare,
	MAX_BUILD_WEIGHT,
	billableSlotsOf,
	isOverCapacity,
	withVendorLockSurviving,
	Build,
} from "~/modules/run/build/domain/build.model";
import { Config } from "~/modules/run/config/domain/config.model";
import type {
	CommittableBand,
	CoverageBandId,
} from "~/modules/run/build/domain/coverageRatio.model";
import {
	EMPTY_WINDOW,
	GateWindow,
} from "~/modules/run/config/domain/effect.model";
import { offerCount, rollDraft } from "~/modules/run/shop/domain/draft.model";
import {
	EMPTY_AUDIT_SCHEDULE,
	type Audit,
	type AuditId,
	type AuditSchedule,
	liveAuditsFor,
	redactedOptionIdsFor,
	mirrorsPolls,
	offlineConfigsFor,
	type OfflinePair,
	offlinePairsFor,
} from "~/modules/run/gate/domain/audit.model";
import type { GateHoldReason } from "~/modules/run/gate/domain/gate.model";
import {
	PIN_START_KB_PER_GATE,
	SLICE_WINDOW,
	storageCreditRate,
} from "~/modules/run/run/domain/rules.model";
import { STORAGE_UNITS } from "~/shared/lib/storage";

export const addStorage = (current: number, income: number): number =>
	Math.max(0, current + income);

export type RunStatus =
	"configuring" | "answering" | "awaiting-strip" | "rewarding" | "won" | "dead";

export type AttackBand = "healthy" | "perfect";

/** One attack a HEALTHY-or-better clear armed, held until fired (ADR-099). */
export type Attack = {
	readonly band: AttackBand;
};

/** How the last gate closed, read by rivals deciding whether this run is fair game. */
export type LastClose = {
	readonly gate: number;
	readonly band: CoverageBandId;
	readonly cleared: boolean;
};

export type IncidentSender = {
	readonly id: string;
	readonly name: string;
};

/** A rival's audit once it has locked into one of this run's gates (ADR-099). */
export type LockedIncident = {
	readonly id: number;
	readonly auditId: AuditId;
	readonly gate: number;
	readonly sentBy: IncidentSender;
};

export type RunState = {
	readonly status: RunStatus;
	readonly build: Build;
	readonly available: readonly Config[];
	readonly draftOptions: readonly Config[];
	readonly rebuildsUsed: number;
	readonly soldThisShop?: number;
	readonly rebasedThisGate?: true;
	readonly configsLost?: number;
	readonly lockedOfferIds?: readonly string[];
	readonly extensionsBought?: number;
	readonly draftedThisGate: readonly string[];
	readonly answeredThisGate: readonly AnsweredPoll[];
	readonly allAnswered?: readonly AnsweredPoll[];
	readonly peelSlotsRemaining: number;
	readonly polls: readonly RunPoll[];
	readonly currentIndex: number;
	readonly window: GateWindow;
	readonly manualDisabled: readonly string[];
	readonly strictArmed?: boolean;
	readonly peekedPollIds?: readonly string[];
	readonly boughtBackOptionIds?: readonly string[];
	readonly gatesCleared: number;
	readonly streak: number;
	/** Units banked by cleared gates. Run coverage is derived from it, never stored. */
	readonly bankedUnits: number;
	/** Attempts already spent on the gate in front. Each one prices the next peel higher. */
	readonly gateAttempts?: number;
	/** Why the gate in front held, while it is held. Cleared on the clear and on the retry. */
	readonly heldBy?: GateHoldReason;
	readonly coverage: number;
	readonly coverageByCategory: Readonly<Record<string, number>>;
	readonly storage: number;
	readonly peakStorageKb?: number;
	readonly faucetEarnedKb?: number;
	readonly faucetThisGateKb?: number;
	/**
	 * The open transaction: KB held by Database's exact answers and not yet
	 * paid. Only a cleared gate turns it into storage, so unlike every other
	 * faucet it can be taken back.
	 */
	readonly pendingKb?: number;
	readonly escrowCommittedKb?: number;
	readonly escrowRolledBackKb?: number;
	readonly gateRewardKb?: number;
	/** The parts of the last clear's reward, so the debrief can itemise it. */
	readonly clearThisGateKb?: number;
	readonly overflowThisGateKb?: number;
	/** The streak the clear paid on, kept because the clear resets the live one. */
	readonly streakAtClose?: number;
	/** What the gate's own objective added to the clear, zero where it was missed. */
	readonly storageBeforeClearKb?: number;
	readonly interestThisGateKb?: number;
	readonly peelRefundKb?: number;
	readonly extraPickThisGateKb?: number;
	readonly estimatedCorrect?: number;
	readonly estimateThisGateUnits?: number;
	/** The band SLA promised this gate, and what holding to it paid. */
	readonly slaBand?: CommittableBand;
	readonly slaUpliftKb?: number;
	readonly upkeepBilledKb?: number;
	/** Build-space upkeep billed across the whole run, for the run-over report. */
	readonly upkeepPaidKb?: number;
	/** The space the run was forced down to when it could not pay for the one it held. */
	readonly spaceDroppedTo?: number;
	readonly clearedGate?: number;
	/** Gates whose swatch this run has earned, in the order the windows landed. */
	readonly swatchGatesEarned?: readonly number[];
	readonly redoGate?: number;
	readonly autoUpgradeProgress?: number;
	readonly autoUpgradedConfigId?: string;
	readonly autoUpgradedByConfigId?: string;
	readonly deletedConfigs?: readonly Config[];
	/** The config that turned a fatal close into a held one, spent doing it. */
	readonly caughtFatalBy?: string;
	readonly lapsedConfigs?: readonly Config[];
	readonly subscriptionBillKb?: number;
	readonly pinPlantedAtGate?: number;
	readonly startedAtGate?: number;
	readonly auditSchedule?: AuditSchedule;
	/** The attack a HEALTHY-or-better clear armed, held until fired (ADR-099). */
	readonly attack?: Attack;
	/** The gate whose clear last armed or upgraded the attack, for the debrief chip. */
	readonly attackEarnedAtGate?: number;
	/** How the last gate closed, read by rivals deciding whether this run is fair game. */
	readonly lastClose?: LastClose;
	/** Rivals' audits locked onto this run's gates, with who sent each. */
	readonly incidents?: readonly LockedIncident[];
	/** What surviving this gate's incidents paid, inside gateRewardKb. */
	readonly incidentSurvivalKb?: number;
	readonly log: readonly string[];
};

export const scheduleOf = (
	state: Pick<RunState, "auditSchedule">
): AuditSchedule => state.auditSchedule ?? EMPTY_AUDIT_SCHEDULE;

const correctOptionCount = (poll: RunPoll): number =>
	poll.options.filter((option) => option.correct).length;

export const pickBudgetFor = (
	polls: readonly RunPoll[],
	fromIndex: number,
	mirrored = false
): number =>
	polls
		.slice(fromIndex, fromIndex + SLICE_WINDOW)
		.reduce(
			(total, poll) =>
				total +
				(mirrored
					? poll.options.length - correctOptionCount(poll)
					: correctOptionCount(poll)),
			0
		);

export type AnswerTypeSplit = {
	readonly single: number;
	readonly multiple: number;
};

export const answerTypesOf = (polls: readonly RunPoll[]): AnswerTypeSplit =>
	polls.reduce(
		(split, poll) => ({
			single: split.single + (poll.answerType === "single" ? 1 : 0),
			multiple: split.multiple + (poll.answerType === "multiple" ? 1 : 0),
		}),
		{ single: 0, multiple: 0 }
	);

export const windowStartIndex = (
	state: Pick<RunState, "currentIndex" | "window">
): number => state.currentIndex - state.window.answered;

export const freshWindow = (
	polls: readonly RunPoll[],
	fromIndex: number,
	configs: readonly Config[],
	gate: number,
	schedule: AuditSchedule
): GateWindow => ({
	...EMPTY_WINDOW,
	budget: pickBudgetFor(
		polls,
		fromIndex,
		mirrorsPolls(liveAuditsFor(configs, gate, schedule))
	),
});

export const createRun = (
	polls: readonly RunPoll[],
	handed: readonly Config[],
	startAtGate = 0,
	auditSchedule: AuditSchedule = EMPTY_AUDIT_SCHEDULE
): RunState => ({
	status: "configuring",
	build: {
		id: "build",
		configs: [],
	},
	available: handed,
	draftOptions: [],
	rebuildsUsed: 0,
	lockedOfferIds: [],
	extensionsBought: 0,
	draftedThisGate: [],
	answeredThisGate: [],
	allAnswered: [],
	peelSlotsRemaining: 0,
	polls,
	currentIndex: 0,
	window: freshWindow(polls, 0, [], startAtGate, auditSchedule),
	manualDisabled: [],
	peekedPollIds: [],
	gatesCleared: startAtGate,
	startedAtGate: startAtGate,
	auditSchedule,
	streak: 0,
	bankedUnits: 0,
	coverage: 0,
	coverageByCategory: {},
	storage: PIN_START_KB_PER_GATE * startAtGate,
	peakStorageKb: PIN_START_KB_PER_GATE * startAtGate,
	faucetEarnedKb: 0,
	faucetThisGateKb: 0,
	pendingKb: 0,
	upkeepPaidKb: 0,
	gateRewardKb: 0,
	log: [],
});

/**
 * The beat between gates, where a config may ask the player for something:
 * before gate 0 opens, and in the shop/prep beat after every later clear.
 */
export const isPrepPhase = (state: Pick<RunState, "status">): boolean =>
	state.status === "configuring" || state.status === "rewarding";

export const incidentsAt = (
	state: Pick<RunState, "incidents">,
	gate: number
): readonly LockedIncident[] =>
	(state.incidents ?? []).filter((incident) => incident.gate === gate);

/**
 * A gate's audits are exactly the incidents that locked into it. Locking the
 * gate in front re-reads the pick budget, because the window opened before the
 * lock and a mirror changes how many picks a poll asks for.
 */
export const withLockedGate = (
	state: RunState,
	gate: number,
	locked: readonly LockedIncident[]
): RunState => {
	const auditSchedule = {
		...scheduleOf(state),
		[gate]: locked.map((incident) => incident.auditId),
	};
	const next = {
		...state,
		auditSchedule,
		incidents: [...(state.incidents ?? []), ...locked],
	};
	if (gate !== state.gatesCleared) return next;
	return {
		...next,
		window: {
			...state.window,
			budget: pickBudgetFor(
				state.polls,
				windowStartIndex(state),
				mirrorsPolls(liveAuditsFor(state.build.configs, gate, auditSchedule))
			),
		},
	};
};

export const withLog = (
	state: RunState,
	...lines: string[]
): readonly string[] => [...state.log, ...lines];

/**
 * The high-water mark of KB held, which is what opens storage rungs
 * (`revealsPlanTier`). Applied once around the reducer rather than at each of
 * the sites that raise storage — a faucet, a clear, a refund — so a new earner
 * can never forget to record its own peak.
 */
export const withPeakStorage = (state: RunState): RunState =>
	state.storage <= (state.peakStorageKb ?? 0)
		? state
		: { ...state, peakStorageKb: state.storage };

export const isAwaitingTomorrow = (state: RunState): boolean =>
	state.status === "answering" && state.currentIndex >= state.polls.length;
export const withBuild = (build: Build, configs: readonly Config[]): Build =>
	withVendorLockSurviving({
		...build,
		configs,
	});

export const shopDraft = (state: RunState, seed: number): readonly Config[] =>
	rollDraft(
		seed,
		state.build.configs,
		state.lockedOfferIds ?? [],
		offerCount(state.extensionsBought ?? 0)
	);

export const auditsOf = (state: RunState): readonly Audit[] =>
	liveAuditsFor(state.build.configs, state.gatesCleared, scheduleOf(state));

/**
 * The options still sealed on the poll in front of the player. Subtracting the
 * bought-back set here keeps un-redaction in one place, so `redactPoll` never
 * has to learn the concept.
 */
export const hiddenOptionIdsOf = (state: RunState): readonly string[] => {
	const poll = state.polls[state.currentIndex];
	if (!poll) return [];
	const bought = new Set(state.boughtBackOptionIds ?? []);
	return redactedOptionIdsFor(
		poll,
		auditsOf(state),
		state.window.answered
	).filter((id) => !bought.has(id));
};

export const offlineConfigsOf = (state: RunState): readonly Config[] =>
	offlineConfigsFor(
		state.build.configs,
		auditsOf(state),
		windowStartIndex(state),
		state.window.answered
	);

export const offlinePairsOf = (state: RunState): readonly OfflinePair[] =>
	offlinePairsFor(
		state.build.configs,
		auditsOf(state),
		windowStartIndex(state),
		state.window.answered
	);

export const liveConfigsOf = (state: RunState): readonly Config[] => {
	const offline = offlineConfigsOf(state);
	if (offline.length === 0) return state.build.configs;
	return state.build.configs.filter(
		(config) => !offline.some((down) => down.id === config.id)
	);
};

export const canStart = (build: Build): boolean =>
	!isBare(build) && !isOverCapacity(build);

/**
 * The weight the run is held to. Normally the top of the ladder — the rung
 * follows the build, so nothing narrower can bind (ADR-098) — but a clear whose
 * balance could not cover its bill only rented the space it could afford, and
 * the build is held to that until it fits. `finishReward` clears the figure, so
 * the lock lasts exactly the one shop visit it was imposed in.
 */
export const spaceCapOf = (state: RunState): number =>
	state.spaceDroppedTo ?? MAX_BUILD_WEIGHT;

export const overflowWeightOf = (state: RunState): number =>
	Math.max(0, billableSlotsOf(state.build) - spaceCapOf(state));

export const roomToCapOf = (state: RunState): number =>
	Math.max(0, spaceCapOf(state) - billableSlotsOf(state.build));

export const isRunOver = (status: RunStatus): boolean =>
	status === "won" || status === "dead";

/**
 * What the archive banks when this run ends. Engine storage is KB and the
 * archive is bytes, and only the gates actually climbed count: a tag-rescued
 * run banks nothing for the gates its checkpoint skipped (ADR-036).
 */
export const archiveCreditBytes = (state: RunState): number =>
	Math.round(
		state.storage *
			STORAGE_UNITS.KB *
			storageCreditRate(
				state.status === "won" ? "victory" : "dead",
				state.gatesCleared - (state.startedAtGate ?? 0)
			)
	);
