import type { BillLedger } from "~/modules/run/config/domain/subscription.model";
import type {
	PerAnswerPreview,
	BuildModifiers,
} from "~/modules/run/build/domain/build.model";
import {
	auditsForGate,
	nextAuditedGateFrom,
	suppressedAuditFor,
} from "~/modules/run/gate/domain/audit.model";
import type { RunState } from "~/modules/run/run/domain/run.model";

export type AuditView = {
	readonly id: string;
	readonly name: string;
	readonly description: string;
	readonly answerCue?: string;
	readonly suppressed: boolean;
};

export type GateStake = {
	readonly gateNumber: number;
	readonly pollsPerGate: number;
	readonly coverageDemand: number;
	readonly coverageHeld: number;
	readonly audits: readonly AuditView[];
	readonly upcomingAudit?: UpcomingAuditView;
	readonly peelSlotsOnFailure: number;
	readonly peelShareOnFailure: number;
	readonly missIsFatal: boolean;
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
	if (auditsForGate(gate).length > 0) return undefined;
	const next = nextAuditedGateFrom(gate + 1);
	if (next === undefined) return undefined;
	return {
		gateNumber: next.gate,
		name: next.audit.name,
		description: next.audit.description,
	};
};

export const auditViewsFor = (state: RunState): readonly AuditView[] => {
	const suppressed = suppressedAuditFor(
		state.build.configs,
		state.gatesCleared
	);
	return auditsForGate(state.gatesCleared).map((audit) => ({
		id: audit.id,
		name: audit.name,
		description: audit.description,
		answerCue: audit.answerCue,
		suppressed: audit.id === suppressed?.id,
	}));
};
