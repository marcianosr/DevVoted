import type { BillLedger } from "~/modules/run/config/domain/subscription.model";
import type {
	PerAnswerPreview,
	BuildModifiers,
} from "~/modules/run/build/domain/build.model";
import {
	auditAt,
	auditLabel,
	auditsForGate,
	suppressedAuditFor,
	suppressorOf,
} from "~/modules/run/gate/domain/audit.model";
import {
	INTRO_AUDITS,
	INTRO_GATE,
} from "~/modules/run/gate/domain/auditSchedule.model";
import type { Config } from "~/modules/run/config/domain/config.model";
import type { PeelConfigRange } from "~/modules/run/gate/domain/gate.model";
import { type RunState, scheduleOf } from "~/modules/run/run/domain/run.model";

export type AuditView = {
	readonly id: string;
	readonly code: number;
	readonly name: string;
	readonly description: string;
	readonly answerCue?: string;
	readonly suppressed: boolean;
	readonly suppressedBy?: Config;
};

export type GateStake = {
	readonly gateNumber: number;
	readonly pollsPerGate: number;
	readonly coverageDemand: number;
	readonly coverageHeld: number;
	readonly audits: readonly AuditView[];
	readonly upcomingAudit?: UpcomingAuditView;
	readonly peelSlotsOnFailure: number;
	readonly peelConfigsOnFailure: PeelConfigRange;
	readonly peelShareOnFailure: number;
	readonly missIsFatal: boolean;
	readonly missIsFree: boolean;
	readonly subscriptions: BillLedger;
	readonly modifiers: BuildModifiers;
	readonly perAnswer: PerAnswerPreview;
};

export type UpcomingAuditView = {
	readonly gateNumber: number;
	readonly name: string;
	readonly description: string;
};

export const upcomingAuditFor = (
	gate: number
): UpcomingAuditView | undefined => {
	const introId = INTRO_AUDITS[0];
	if (gate >= INTRO_GATE || introId === undefined) return undefined;
	const audit = auditAt(introId, INTRO_GATE);
	return {
		gateNumber: INTRO_GATE,
		name: auditLabel(audit),
		description: audit.description,
	};
};

export const auditViewsFor = (state: RunState): readonly AuditView[] => {
	const schedule = scheduleOf(state);
	const suppressed = suppressedAuditFor(
		state.build.configs,
		state.gatesCleared,
		schedule
	);
	const suppressor = suppressorOf(state.build.configs);
	return auditsForGate(state.gatesCleared, schedule).map((audit) => ({
		id: audit.id,
		code: audit.code,
		name: audit.name,
		description: audit.description,
		answerCue: audit.answerCue,
		suppressed: audit.id === suppressed?.id,
		suppressedBy: audit.id === suppressed?.id ? suppressor : undefined,
	}));
};
