import { type Config, slotsOf } from "~/modules/run/config/domain/config.model";
import {
	Build,
	isBare,
	occupiedSlots,
	type PerAnswerPreview,
} from "~/modules/run/build/domain/build.model";
import {
	SLICE_WINDOW,
	failPeelShareFor,
	meetsGateFloor,
	peelQuotaSlotsFor,
	roundToOneDecimal,
} from "~/modules/run/run/domain/rules.model";
import {
	type CoverageBand,
	atLeastBand,
	bandOf,
	floorAt,
	healthyAt,
	okAt,
	percentOf,
	runCoverageOf,
} from "~/modules/run/build/domain/coverageRatio.model";
import {
	auditDemandFactor,
	auditExtraPeelShare,
	type AuditSchedule,
	liveAuditsFor,
} from "~/modules/run/gate/domain/audit.model";

export type GateLadder = {
	readonly floor: number;
	readonly ok: number;
	readonly healthy: number;
};

export const gateDemandFor = (
	configs: readonly Config[],
	gatesCleared: number,
	schedule: AuditSchedule
): number =>
	roundToOneDecimal(
		percentOf(healthyAt(gatesCleared)) *
			auditDemandFactor(liveAuditsFor(configs, gatesCleared, schedule))
	);

export const gateLadderFor = (
	configs: readonly Config[],
	gatesCleared: number,
	schedule: AuditSchedule
): GateLadder => {
	const factor = auditDemandFactor(
		liveAuditsFor(configs, gatesCleared, schedule)
	);
	const scaled = (line: number): number =>
		Math.max(0, roundToOneDecimal(percentOf(line) * factor));

	return {
		healthy: gateDemandFor(configs, gatesCleared, schedule),
		ok: scaled(okAt(gatesCleared)),
		floor: scaled(floorAt(gatesCleared)),
	};
};

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
	schedule: AuditSchedule,
	attempts = 0
): number =>
	peelQuotaSlotsFor(
		occupiedSlots(configs),
		peelShareFor(configs, gatesCleared, schedule),
		gatesCleared,
		attempts
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

/** What a gate did when it shut. The application layer already speaks this. */
export type GateClosing = "cleared" | "held" | "fatal";

/**
 * Everything the close needs. `correctThisGate` is counted before multipliers
 * on purpose: a floor a x2 build clears with one right answer exempts exactly
 * the builds the floor exists to catch.
 */
export type GateClose = {
	readonly build: Build;
	readonly bankedUnits: number;
	readonly unitsThisGate: number;
	readonly correctThisGate: number;
	readonly gatesCleared: number;
	readonly schedule: AuditSchedule;
};

export const runCoverageAtClose = (close: GateClose): number =>
	runCoverageOf(close.bankedUnits + close.unitsThisGate, close.gatesCleared);

export const isFlawlessGate = (close: GateClose): boolean =>
	close.correctThisGate >= SLICE_WINDOW;

export const clearsGateFloor = (close: GateClose): boolean =>
	meetsGateFloor(close.correctThisGate);

/**
 * The band the run score lands in, against this gate's audited ladder. Both
 * sides are compared at the precision the screen shows, so the number the
 * player reads and the verdict they get can never disagree.
 */
export const bandAtClose = (close: GateClose): CoverageBand => {
	const ladder = gateLadderFor(
		close.build.configs,
		close.gatesCleared,
		close.schedule
	);
	const held = roundToOneDecimal(percentOf(runCoverageAtClose(close)));

	if (held >= percentOf(1)) return bandOf("perfect");
	if (held >= ladder.healthy) return bandOf("healthy");
	if (held >= ladder.ok) return bandOf("ok");
	if (held >= ladder.floor) return bandOf("shaky");
	return bandOf("danger");
};

export const gateClosingFor = (close: GateClose): GateClosing => {
	// A bare build never clears: a free redo would soft-lock the run forever.
	if (isBare(close.build)) return "held";

	// TODO(marciano): the floor rule goes here, and it has to sit above the band.
	// A run that answered fewer than FLOOR_CORRECT of its five correctly holds
	// the gate whatever its run score says. `clearsGateFloor(close)` is the
	// check. Without it a capped x2 build coasts through four dead gates on a
	// score its history earned, which is the one thing a sticky average cannot
	// otherwise punish.

	// A flawless gate may hold and owe a peel. It must never be fatal.
	const band = isFlawlessGate(close)
		? atLeastBand(bandAtClose(close), "shaky")
		: bandAtClose(close);

	if (band.id === "danger") return "fatal";
	if (band.id === "shaky") return "held";
	return "cleared";
};

export const gatePassed = (close: GateClose): boolean =>
	gateClosingFor(close) === "cleared";

export type GateProjection = {
	readonly held: number;
	readonly demand: number;
	readonly pass: number;
	readonly miss: number;
	readonly passClears: boolean;
	readonly missClears: boolean;
};

/**
 * Where one more answer lands the run score. A miss earns nothing and the gate's
 * slot count is already fixed, so a miss leaves the number where it is: the cost
 * of a wrong answer is the gain it forfeits, not a bleed.
 */
export const gateProjectionFor = (
	units: number,
	preview: PerAnswerPreview,
	gate: number,
	demand: number
): GateProjection => {
	const asHeld = (carried: number): number =>
		roundToOneDecimal(percentOf(runCoverageOf(carried, gate)));
	const held = asHeld(units);
	const pass = asHeld(units + preview.coveragePerCorrect);

	return {
		held,
		demand,
		pass,
		miss: held,
		passClears: pass >= demand,
		missClears: held >= demand,
	};
};
