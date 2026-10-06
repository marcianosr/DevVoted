import type { BillLedger } from "~/modules/run/config/domain/subscription.model";
import type { PerAnswerPreview } from "~/modules/run/build/domain/answerPayout.model";
import type { BuildModifiers } from "~/modules/run/build/domain/build.model";
import {
	type AuditId,
	auditsForGate,
	auditsHideAnswerType,
	suppressedAuditFor,
	suppressorOf,
} from "~/modules/run/gate/domain/audit.model";
import type { Config } from "~/modules/run/config/domain/config.model";
import {
	bandAtLadder,
	type GateLadder,
	type PeelConfigRange,
} from "~/modules/run/gate/domain/gate.model";
import {
	auditsOf,
	incidentsAt,
	type IncidentSender,
	type RunState,
	scheduleOf,
} from "~/modules/run/run/domain/run.model";
import {
	accuracyMultiplierFor,
	creditFor,
	MULTIPLE_CREDIT,
} from "~/modules/run/build/domain/coverageRatio.model";
import { namesAnswerTypes } from "~/modules/run/run/domain/rebase.model";
import {
	creditedAnswerTypeFor,
	pollCreditFor,
} from "~/modules/run/run/domain/answer.model";
import { SLICE_WINDOW } from "~/modules/run/run/domain/rules.model";
import type {
	AnsweredPoll,
	RunPoll,
} from "~/modules/run/run/domain/runPoll.model";

import type { CoverageBarProps } from "~/ui/kanto-theme/CoverageBar.ui";

export type AuditView = {
	readonly id: AuditId;
	readonly code: number;
	readonly name: string;
	readonly description: string;
	readonly answerCue?: string;
	readonly suppressed: boolean;
	readonly suppressedBy?: Config;
	readonly sentBy?: IncidentSender;
};

export type GateStake = {
	readonly gateNumber: number;
	readonly pollsPerGate: number;
	readonly coverageLadder: GateLadder;
	readonly coverageHeld: number;
	readonly coverageAtOpen: number;
	readonly audits: readonly AuditView[];
	readonly peelSlotsOnFailure: number;
	readonly peelConfigsOnFailure: PeelConfigRange;
	readonly peelShareOnFailure: number;
	readonly missIsFatal: boolean;
	readonly missIsFree: boolean;
	readonly subscriptions: BillLedger;
	readonly modifiers: BuildModifiers;
	readonly perAnswer: PerAnswerPreview;
	readonly accuracy: AccuracyView;
};

export type AccuracyPoll = {
	readonly credit: number;
	readonly earned: number;
};

export type AccuracyView = {
	readonly polls: readonly AccuracyPoll[];
	readonly pending: number;
	readonly available: number | null;
	readonly guaranteed: number;
	readonly best: number;
	readonly carried: number;
};

const answeredAccuracyOf = (
	state: RunState,
	answer: AnsweredPoll
): AccuracyPoll => {
	const credit = creditFor(
		creditedAnswerTypeFor(state, { answerType: answer.answerType ?? "single" })
	);
	return { credit, earned: (answer.coverageFactors?.correct ?? 0) * credit };
};

const mixKnown = (state: RunState, pending: number): boolean =>
	pending === 0 ||
	auditsHideAnswerType(auditsOf(state)) ||
	namesAnswerTypes(state.build.configs);

const pendingInWindowOf = (state: RunState): number =>
	Math.max(0, SLICE_WINDOW - state.window.answered);

const unseenInWindowOf = (state: RunState): readonly RunPoll[] =>
	state.polls.slice(
		state.currentIndex,
		state.currentIndex + pendingInWindowOf(state)
	);

const knownAvailableOf = (state: RunState): number | null =>
	mixKnown(state, pendingInWindowOf(state))
		? state.window.accuracyAvailable +
			unseenInWindowOf(state).reduce(
				(sum, poll) => sum + pollCreditFor(state, poll),
				0
			)
		: null;

const worstCaseAvailableOf = (state: RunState): number =>
	state.window.accuracyAvailable + pendingInWindowOf(state) * MULTIPLE_CREDIT;

const windowAvailableOf = (state: RunState): number =>
	knownAvailableOf(state) ?? worstCaseAvailableOf(state);

const pendingCreditOf = (state: RunState): number =>
	windowAvailableOf(state) - state.window.accuracyAvailable;

export const guaranteedMultiplierOf = (state: RunState): number =>
	accuracyMultiplierFor(state.accuracyBonus, {
		earned: state.window.accuracyEarned,
		available: windowAvailableOf(state),
	});

export const bestMultiplierOf = (state: RunState): number =>
	accuracyMultiplierFor(state.accuracyBonus, {
		earned: state.window.accuracyEarned + pendingCreditOf(state),
		available: windowAvailableOf(state),
	});

export const guaranteedWindowOutputOf = (state: RunState): number =>
	state.window.unitsEarned * guaranteedMultiplierOf(state);

export const accuracyViewFor = (state: RunState): AccuracyView => ({
	polls: state.answeredThisGate
		.filter((answer) => answer.outcome !== "skipped")
		.map((answer) => answeredAccuracyOf(state, answer)),
	pending: pendingInWindowOf(state),
	available: knownAvailableOf(state),
	guaranteed: guaranteedMultiplierOf(state),
	best: bestMultiplierOf(state),
	carried: state.accuracyBonus,
});

export const auditViewsFor = (state: RunState): readonly AuditView[] => {
	const schedule = scheduleOf(state);
	const suppressed = suppressedAuditFor(
		state.build.configs,
		state.gatesCleared,
		schedule
	);
	const suppressor = suppressorOf(state.build.configs);
	const incidents = incidentsAt(state, state.gatesCleared);
	return auditsForGate(state.gatesCleared, schedule).map((audit) => ({
		id: audit.id,
		code: audit.code,
		name: audit.name,
		description: audit.description,
		answerCue: audit.answerCue,
		suppressed: audit.id === suppressed?.id,
		suppressedBy: audit.id === suppressed?.id ? suppressor : undefined,
		sentBy: incidents.find((incident) => incident.auditId === audit.id)?.sentBy,
	}));
};

export const stakeBarFor = (
	stake: Pick<GateStake, "coverageLadder" | "coverageHeld">
): CoverageBarProps => ({
	...stake.coverageLadder,
	held: stake.coverageHeld,
	band: bandAtLadder(stake.coverageHeld, stake.coverageLadder).id,
});
