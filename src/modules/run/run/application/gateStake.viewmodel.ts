import type { BillLedger } from "~/modules/run/config/domain/subscription.model";
import type {
	PerAnswerPreview,
	PipelineModifiers,
} from "~/modules/run/pipeline/domain/pipeline.model";
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
	/** Volkswagen CI is reporting this one as passing — struck through. */
	readonly suppressed: boolean;
};

/** What the coming gate demands and what it pays. Clustered because Prep, Configuring and Shop were each carrying seven props only to hand them on. */
export type GateStake = {
	readonly gateNumber: number;
	readonly pollsPerGate: number;
	/** Paired so every stake surface can grade the demand without threading run state beside the stake. */
	readonly coverageDemand: number;
	readonly coverageHeld: number;
	/** Suppressed ones included: the receipt lists them struck through. */
	readonly audits: readonly AuditView[];
	/** Set only when this gate runs clean: the first audited gate ahead, so the
	 * receipt's Audit section foreshadows instead of vanishing. */
	readonly upcomingAudit?: UpcomingAuditView;
	/** ADR-037, and whether that peel takes the whole build. */
	readonly stripsOnFailure: number;
	readonly missIsFatal: boolean;
	readonly billKb: number;
	/** The plan and each subscribed config, priced at this gate. */
	readonly subscriptions: BillLedger;
	readonly modifiers: PipelineModifiers;
	readonly perAnswer: PerAnswerPreview;
};

export type UpcomingAuditView = {
	readonly gateNumber: number;
	readonly name: string;
	readonly description: string;
};

/**
 * Only for a clean gate: the first audited gate ahead. Gates 0–2 are the only
 * clean ones, so this is how the audit system introduces itself before it ever
 * charges — otherwise its first impression is gate 3's fee.
 */
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
		state.pipeline.configs,
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
