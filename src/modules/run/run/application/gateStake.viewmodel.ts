import type { BillLedger } from "~/modules/run/config/domain/subscription.model";
import type {
	PerAnswerPreview,
	BuildModifiers,
} from "~/modules/run/build/domain/build.model";
import {
	auditsForGate,
	suppressedAuditFor,
	suppressorOf,
} from "~/modules/run/gate/domain/audit.model";
import type { Config } from "~/modules/run/config/domain/config.model";
import type { AuditId } from "~/modules/run/gate/domain/audit.model";
import type {
	GateLadder,
	GateProjection,
	PeelConfigRange,
} from "~/modules/run/gate/domain/gate.model";
import {
	incidentsAt,
	type RunState,
	scheduleOf,
} from "~/modules/run/run/domain/run.model";

export type AuditView = {
	readonly id: AuditId;
	readonly code: number;
	readonly name: string;
	readonly description: string;
	readonly answerCue?: string;
	readonly suppressed: boolean;
	readonly suppressedBy?: Config;
	/** The rival who fired it, where the audit is one a rival locked in (ADR-099). */
	readonly sentBy?: string;
};

export type GateStake = {
	readonly gateNumber: number;
	readonly pollsPerGate: number;
	readonly coverageLadder: GateLadder;
	readonly coverageHeld: number;
	/**
	 * The same reading with this window's own units taken back out: what the run
	 * held when the gate opened. Fixed for the whole window, including a retry,
	 * so a price quoted against it cannot move while the window is played.
	 */
	readonly coverageAtOpen: number;
	/** The same reading in units, so a screen can say "12 of 15" rather than a percentage. */
	readonly unitsHeld: number;
	readonly audits: readonly AuditView[];
	readonly peelSlotsOnFailure: number;
	readonly peelConfigsOnFailure: PeelConfigRange;
	readonly peelShareOnFailure: number;
	readonly missIsFatal: boolean;
	readonly missIsFree: boolean;
	readonly subscriptions: BillLedger;
	readonly modifiers: BuildModifiers;
	readonly perAnswer: PerAnswerPreview;
	readonly projection?: GateProjection;
};

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
		sentBy: incidents.find((incident) => incident.auditId === audit.id)?.sentBy
			.name,
	}));
};
