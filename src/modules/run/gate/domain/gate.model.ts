import { type Config, slotsOf } from "~/modules/run/config/domain/config.model";
import {
	Build,
	catcherFor,
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
 * Why a held gate held. A bare build never clears; the floor is the day's own
 * count of right answers; the band is the meter. The debrief needs the
 * distinction because a floor hold can sit on a HEALTHY meter, and the bar
 * must not be clamped down to make the two agree (ADR-094).
 */
export type GateHoldReason = "bare" | "floor" | "band" | "catch";

export type GateRuling =
	| { readonly closing: "cleared" }
	| { readonly closing: "fatal" }
	| { readonly closing: "held"; readonly heldBy: GateHoldReason };

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

// A flawless gate may hold and owe a peel. It must never be fatal.
const closingBandFor = (close: GateClose): CoverageBand =>
	isFlawlessGate(close)
		? atLeastBand(bandAtClose(close), "shaky")
		: bandAtClose(close);

/**
 * The verdict, in order: a bare build never clears (a free redo would soft-lock
 * the run forever); DANGER ends the run whatever the day counted, unless a catch
 * is installed to take it; then the
 * day's own five must carry FLOOR_CORRECT right answers, or the gate holds
 * however good the run reads, because a cushion banked yesterday is the one
 * thing a cumulative meter cannot otherwise make a player earn again.
 */
export const gateRulingFor = (close: GateClose): GateRuling => {
	if (isBare(close.build)) return { closing: "held", heldBy: "bare" };

	const band = closingBandFor(close);

	// Try/Catch handles the fatal exception in flight: the gate still shuts and
	// still owes its peel, it just stops being the end of the run (ADR-096).
	if (band.id === "danger")
		return catcherFor(close.build.configs) === undefined
			? { closing: "fatal" }
			: { closing: "held", heldBy: "catch" };
	if (!clearsGateFloor(close)) return { closing: "held", heldBy: "floor" };
	if (band.id === "shaky") return { closing: "held", heldBy: "band" };
	return { closing: "cleared" };
};

export const gateClosingFor = (close: GateClose): GateClosing =>
	gateRulingFor(close).closing;

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
