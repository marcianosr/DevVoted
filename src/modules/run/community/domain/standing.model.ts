import {
	percentOf,
	runShareOf,
} from "~/modules/run/build/domain/coverageRatio.model";
import type { PublicBuild } from "~/modules/run/build/domain/publicBuild.model";

export type Standing = {
	readonly gate: number;
	readonly coveragePercent: number;
	readonly streak: number;
	readonly storageKb: number;
	readonly bestCategory?: string;
	readonly build: PublicBuild;
};

export type StandingSource = {
	readonly gate: number;
	readonly coverageUnits: number;
	readonly streak: number;
	readonly storageKb: number;
	readonly build: PublicBuild;
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
});
