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

export type HeldAuditBand = "ok" | "healthy" | "perfect";

export type HeldAudit = {
	readonly band: HeldAuditBand;
	readonly gate: number;
	readonly choices?: readonly AuditId[];
	readonly payload?: AuditId;
};

export type KeptAudit = HeldAudit & { readonly payload: AuditId };

export type LastClose = {
	readonly gate: number;
	readonly band: CoverageBandId;
	readonly cleared: boolean;
};

export type IncidentSender = {
	readonly id: string;
	readonly name: string;
};

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
	readonly bankedUnits: number;
	readonly gateAttempts?: number;
	readonly heldBy?: GateHoldReason;
	readonly coverage: number;
	readonly coverageByCategory: Readonly<Record<string, number>>;
	readonly storage: number;
	readonly peakStorageKb?: number;
	readonly faucetEarnedKb?: number;
	readonly faucetThisGateKb?: number;
	readonly pendingKb?: number;
	readonly escrowCommittedKb?: number;
	readonly escrowRolledBackKb?: number;
	readonly gateRewardKb?: number;
	readonly clearThisGateKb?: number;
	readonly overflowThisGateKb?: number;
	readonly streakAtClose?: number;
	readonly storageBeforeClearKb?: number;
	readonly interestThisGateKb?: number;
	readonly peelRefundKb?: number;
	readonly extraPickThisGateKb?: number;
	readonly estimatedCorrect?: number;
	readonly estimateThisGateUnits?: number;
	readonly slaBand?: CommittableBand;
	readonly slaUpliftKb?: number;
	readonly upkeepBilledKb?: number;
	readonly upkeepPaidKb?: number;
	readonly spaceDroppedTo?: number;
	readonly clearedGate?: number;
	readonly swatchGatesEarned?: readonly number[];
	readonly redoGate?: number;
	readonly autoUpgradeProgress?: number;
	readonly autoUpgradedConfigId?: string;
	readonly autoUpgradedByConfigId?: string;
	readonly deletedConfigs?: readonly Config[];
	readonly caughtFatalBy?: string;
	readonly lapsedConfigs?: readonly Config[];
	readonly subscriptionBillKb?: number;
	readonly pinPlantedAtGate?: number;
	readonly startedAtGate?: number;
	readonly auditSchedule?: AuditSchedule;
	readonly heldAudit?: HeldAudit;
	readonly offeredAudit?: HeldAudit;
	readonly auditHandedAtGate?: number;
	readonly repackagedThisShop?: true;
	readonly lastClose?: LastClose;
	readonly incidents?: readonly LockedIncident[];
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

export const isPrepPhase = (state: Pick<RunState, "status">): boolean =>
	state.status === "configuring" || state.status === "rewarding";

export const incidentsAt = (
	state: Pick<RunState, "incidents">,
	gate: number
): readonly LockedIncident[] =>
	(state.incidents ?? []).filter((incident) => incident.gate === gate);

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

export const spaceCapOf = (state: RunState): number =>
	state.spaceDroppedTo ?? MAX_BUILD_WEIGHT;

export const overflowWeightOf = (state: RunState): number =>
	Math.max(0, billableSlotsOf(state.build) - spaceCapOf(state));

export const roomToCapOf = (state: RunState): number =>
	Math.max(0, spaceCapOf(state) - billableSlotsOf(state.build));

export const isRunOver = (status: RunStatus): boolean =>
	status === "won" || status === "dead";

export const archiveCreditBytes = (state: RunState): number =>
	Math.round(
		state.storage *
			STORAGE_UNITS.KB *
			storageCreditRate(
				state.status === "won" ? "victory" : "dead",
				state.gatesCleared - (state.startedAtGate ?? 0)
			)
	);
