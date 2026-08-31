import type { GateWindow } from "~/modules/run/config/domain/effect.model";
import type { Config } from "~/modules/run/config/domain/config.model";
import {
	Build,
	isBare,
	occupiedSlots,
} from "~/modules/run/build/domain/build.model";
import {
	coverageDemandFor,
	failPeelShareFor,
	peelQuotaSlotsFor,
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
	peelQuotaSlotsFor(
		occupiedSlots(configs),
		peelShareFor(configs, gatesCleared),
		gatesCleared
	);

export const gatePassed = (
	build: Build,
	window: GateWindow,
	gatesCleared: number
): boolean =>
	!isBare(build) &&
	window.coverageGained >= gateDemandFor(build.configs, gatesCleared);
