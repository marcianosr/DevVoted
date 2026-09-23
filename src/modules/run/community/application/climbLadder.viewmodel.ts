import type {
	ClimbTodayView,
	RunCommunityView,
} from "~/modules/run/community/application/community.service";
import {
	gateOf,
	trackPosition,
} from "~/modules/run/community/domain/climbMap.model";
import type { PublicBuild } from "~/modules/run/build/domain/publicBuild.model";
import {
	ALL_SWATCHES,
	type SwatchFinish,
	type SwatchTheme,
} from "~/modules/run/gate/domain/swatch.model";
import { SLICE_WINDOW } from "~/modules/run/run/domain/rules.model";

/**
 * The ladder's own vocabulary. It used to be the terminal kit's `TrackConfig` /
 * `TrackClimber` / `TrackGate`; owning it here means the shape outlives whichever
 * kit draws it, and a future `ClimbMap.ui.tsx` can take these as types only.
 */
export type LadderConfig = {
	name: string;
	slots: number;
	version?: number;
	locked?: boolean;
};

export type LadderClimber = {
	id: string;
	name: string;
	photoUrl?: string;
	borderUrl?: string;
	you: boolean;
	build?: readonly LadderConfig[];
};

export type LadderFallen = LadderClimber & { runKey: string };

export type LadderGate = {
	gate: number;
	name: string;
	theme: SwatchTheme;
	finish: SwatchFinish;
	current: boolean;
	uncharted: boolean;
	best: boolean;
	climbers: readonly LadderClimber[];
	fallen: readonly LadderFallen[];
};

const byDepthThenId = (
	a: { pollsIntoGate: number; id: string },
	b: { pollsIntoGate: number; id: string }
): number => b.pollsIntoGate - a.pollsIntoGate || a.id.localeCompare(b.id);

export const trackBuildFor = (build: PublicBuild): LadderConfig[] =>
	build.configs.map((config) => ({
		name: config.label,
		slots: config.slots,
		...(config.level === undefined ? {} : { version: config.level }),
		...(config.id === build.vendorLockedConfigId ? { locked: true } : {}),
	}));

export const ladderFor = (climb: ClimbTodayView): LadderGate[] => {
	const you = climb.climbers.find((climber) => climber.you);
	const chartedTo = Math.max(
		you === undefined ? 0 : trackPosition(you),
		climb.bestPosition ?? 0
	);
	const bestGate =
		climb.bestPosition === null ? null : gateOf(climb.bestPosition);

	return ALL_SWATCHES.map((swatch) => ({
		gate: swatch.gate,
		name: swatch.gateName,
		theme: swatch.theme,
		finish: swatch.finish,
		current: you?.gate === swatch.gate,
		uncharted: swatch.gate * SLICE_WINDOW > chartedTo,
		best: bestGate === swatch.gate,
		climbers: [...climb.climbers]
			.filter((climber) => climber.gate === swatch.gate)
			.sort(byDepthThenId)
			.map((climber): LadderClimber => ({
				id: climber.id,
				name: climber.displayName,
				photoUrl: climber.photoUrl ?? undefined,
				borderUrl: climber.borderUrl ?? undefined,
				you: climber.you,
				...(climber.build === undefined
					? {}
					: { build: trackBuildFor(climber.build) }),
			})),
		fallen: [...climb.fallen]
			.filter((fallen) => fallen.gate === swatch.gate)
			.sort(byDepthThenId)
			.map((fallen) => ({
				id: fallen.id,
				name: fallen.displayName,
				photoUrl: fallen.photoUrl ?? undefined,
				borderUrl: fallen.borderUrl ?? undefined,
				you: false,
				build: trackBuildFor(fallen.build),
				runKey: String(fallen.runId),
			})),
	}));
};

/** "3 on the ladder · 1 fell today" — the summary the parked map still states. */
export const ladderSummaryFor = (
	climb: RunCommunityView["climb"]
): string | undefined => {
	if (climb === null) return undefined;
	const climbers = `${climb.climbers.length} on the ladder`;
	return climb.fallen.length === 0
		? climbers
		: `${climbers} · ${climb.fallen.length} fell today`;
};
