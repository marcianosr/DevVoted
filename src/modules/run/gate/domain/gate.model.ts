import type { GateWindow } from "~/modules/run/config/domain/effect.model";
import type { Config } from "~/modules/run/config/domain/config.model";
import { Pipeline, isBare } from "~/modules/run/pipeline/domain/pipeline.model";
import {
	coverageDemandFor,
	failStripsFor,
} from "~/modules/run/run/domain/rules.model";
import {
	auditDemandFactor,
	auditExtraStrips,
	liveAuditsFor,
} from "~/modules/run/gate/domain/audit.model";

/**
 * What this gate demands of this build's window: the table row, scaled by the
 * live audits' demand factor (the mirror discounts what streakless play can
 * reach; a suppressed audit discounts nothing).
 */
export const gateDemandFor = (
	configs: readonly Config[],
	gatesCleared: number
): number =>
	Math.round(
		coverageDemandFor(gatesCleared) *
			auditDemandFactor(liveAuditsFor(configs, gatesCleared))
	);

/**
 * What a miss costs this build at this gate (ADR-037): the gate's own row of the
 * peel table plus whatever its live audits add. A suppressed strip audit adds
 * nothing — the defeat device buys back the deep gate's extra bite, never the
 * base rule.
 */
export const failStripQuotaFor = (
	configs: readonly Config[],
	gatesCleared: number
): number =>
	failStripsFor(gatesCleared) +
	auditExtraStrips(liveAuditsFor(configs, gatesCleared));

/**
 * The gate's one demand (ADR-035): the coverage earned inside this attempt's
 * window meets the gate's own threshold. Configs demand nothing — they are
 * pure enhancements; the friction is the gate's.
 *
 * A bare pipeline never clears: a build with nothing in it would otherwise
 * soft-lock a run into a climb it never equipped for, so bareness itself stays
 * a failure — and the peel that follows ends the run.
 */
export const gatePassed = (
	pipeline: Pipeline,
	window: GateWindow,
	gatesCleared: number
): boolean =>
	!isBare(pipeline) &&
	window.coverageGained >= gateDemandFor(pipeline.configs, gatesCleared);
