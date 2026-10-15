import {
	type CoverageBandId,
	percentOf,
	runShareOf,
} from "~/modules/run/build/domain/coverageRatio.model";
import type { PublicBuild } from "~/modules/run/build/domain/publicBuild.model";
import {
	baseGateLadderAt,
	type GateLadder,
} from "~/modules/run/gate/domain/gate.model";
import type { LastClose } from "~/modules/run/run/domain/run.model";

export type ClosedGate = {
	readonly gate: number;
	readonly band: CoverageBandId;
	readonly held: number;
	readonly ladder: GateLadder;
};

export type Standing = {
	readonly gate: number;
	readonly coveragePercent: number;
	readonly streak: number;
	readonly storageKb: number;
	readonly bestCategory?: string;
	readonly build: PublicBuild;
	readonly lastClose?: ClosedGate;
};

export type StandingSource = {
	readonly gate: number;
	readonly coverageUnits: number;
	readonly streak: number;
	readonly storageKb: number;
	readonly build: PublicBuild;
	readonly lastClose?: LastClose;
};

const closedGateOf = (close: LastClose): ClosedGate | undefined => {
	const held = close.reached ?? close.held;
	if (held === undefined) return undefined;

	return {
		gate: close.gate,
		band: close.band,
		held,
		ladder: close.ladder ?? baseGateLadderAt(close.gate),
	};
};

const lastCloseOf = (close: LastClose | undefined) => {
	const closed = close === undefined ? undefined : closedGateOf(close);
	return closed === undefined ? {} : { lastClose: closed };
};

export const standingOf = (
	climber: StandingSource,
	bestCategory?: string
): Standing => ({
	gate: climber.gate,
	coveragePercent: Math.round(
		percentOf(runShareOf(climber.coverageUnits, climber.gate))
	),
	streak: climber.streak,
	storageKb: climber.storageKb,
	build: climber.build,
	...(bestCategory === undefined ? {} : { bestCategory }),
	...lastCloseOf(climber.lastClose),
});
