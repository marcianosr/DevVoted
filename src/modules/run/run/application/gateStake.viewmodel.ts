import type { BillLedger } from "~/modules/run/config/domain/subscription.model";
import type {
	PerAnswerPreview,
	PipelineModifiers,
} from "~/modules/run/pipeline/domain/pipeline.model";
import {
	auditsForGate,
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
	/** ADR-037, and whether that peel takes the whole build. */
	readonly stripsOnFailure: number;
	readonly missIsFatal: boolean;
	readonly billKb: number;
	/** The plan and each subscribed config, priced at this gate. */
	readonly subscriptions: BillLedger;
	readonly modifiers: PipelineModifiers;
	readonly perAnswer: PerAnswerPreview;
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
