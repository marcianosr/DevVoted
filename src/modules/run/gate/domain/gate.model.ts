import type { GateWindow } from "~/modules/run/config/domain/effect.model";
import { type Config, slotsOf } from "~/modules/run/config/domain/config.model";
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
	type AuditSchedule,
	liveAuditsFor,
} from "~/modules/run/gate/domain/audit.model";

export const gateDemandFor = (
	configs: readonly Config[],
	gatesCleared: number,
	schedule: AuditSchedule
): number =>
	Math.round(
		coverageDemandFor(gatesCleared) *
			auditDemandFactor(liveAuditsFor(configs, gatesCleared, schedule))
	);

export const peelShareFor = (
	configs: readonly Config[],
	gatesCleared: number,
	schedule: AuditSchedule
): number =>
	failPeelShareFor(gatesCleared) +
	auditExtraPeelShare(liveAuditsFor(configs, gatesCleared, schedule));

export const failPeelQuotaFor = (
	configs: readonly Config[],
	gatesCleared: number,
	schedule: AuditSchedule
): number =>
	peelQuotaSlotsFor(
		occupiedSlots(configs),
		peelShareFor(configs, gatesCleared, schedule),
		gatesCleared
	);

const dropsToCover = (sizes: readonly number[], quota: number): number =>
	sizes.reduce(
		(paid, size) =>
			paid.slots >= quota
				? paid
				: { slots: paid.slots + size, drops: paid.drops + 1 },
		{ slots: 0, drops: 0 }
	).drops;

export type PeelConfigRange = {
	readonly fewest: number;
	readonly most: number;
};

// The quota is slots, so it does not name a number of configs: an 8-slot config
// settles a 2-slot debt alone, and a build of ones pays it one config at a
// time. Dropping the biggest first gives the floor, the smallest first the
// ceiling. Minifying can undercut the floor further, which is why the forecast
// says "remove" and the hint beside it says "or minify".
export const peelConfigRangeFor = (
	configs: readonly Config[],
	quota: number
): PeelConfigRange => {
	const sizes = configs.map(slotsOf);
	return {
		fewest: dropsToCover(
			[...sizes].sort((a, b) => b - a),
			quota
		),
		most: dropsToCover(
			[...sizes].sort((a, b) => a - b),
			quota
		),
	};
};

export const gatePassed = (
	build: Build,
	window: GateWindow,
	gatesCleared: number,
	schedule: AuditSchedule
): boolean =>
	!isBare(build) &&
	window.coverageGained >= gateDemandFor(build.configs, gatesCleared, schedule);
