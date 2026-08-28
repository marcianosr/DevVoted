import type { GateWindow } from "~/modules/run/config/domain/effect.model";
import type { Config } from "~/modules/run/config/domain/config.model";
import {
	Pipeline,
	isBare,
	occupiedSpots,
} from "~/modules/run/pipeline/domain/pipeline.model";
import {
	coverageDemandFor,
	failPeelShareFor,
	peelQuotaSpotsFor,
} from "~/modules/run/run/domain/rules.model";
import {
	auditDemandFactor,
	auditExtraPeelShare,
	liveAuditsFor,
} from "~/modules/run/gate/domain/audit.model";

export const gateDemandFor = (
	configs: readonly Config[],
	gatesCleared: number
): number =>
	Math.round(
		coverageDemandFor(gatesCleared) *
			auditDemandFactor(liveAuditsFor(configs, gatesCleared))
	);

export const peelShareFor = (
	configs: readonly Config[],
	gatesCleared: number
): number =>
	failPeelShareFor(gatesCleared) +
	auditExtraPeelShare(liveAuditsFor(configs, gatesCleared));

export const failPeelQuotaFor = (
	configs: readonly Config[],
	gatesCleared: number
): number =>
	peelQuotaSpotsFor(
		occupiedSpots(configs),
		peelShareFor(configs, gatesCleared),
		gatesCleared
	);

export const gatePassed = (
	pipeline: Pipeline,
	window: GateWindow,
	gatesCleared: number
): boolean =>
	!isBare(pipeline) &&
	window.coverageGained >= gateDemandFor(pipeline.configs, gatesCleared);
