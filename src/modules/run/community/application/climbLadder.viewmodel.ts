import type {
	ClimbClimber,
	ClimbFallen,
	ClimbTodayView,
} from "~/modules/run/community/application/community.service";
import { gateLabelOf } from "~/modules/run/gate/application/swatchTrack.viewmodel";
import {
	publicSpaceOf,
	publicWeightOf,
} from "~/modules/run/build/domain/publicBuild.model";
import { getCategoryMetadata, isCategoryCode } from "~/shared/lib/categories";
import { profilePathFor } from "~/shared/lib/profilePath";
import { kbLabel } from "~/shared/lib/storage";
import { OF, WEIGHT } from "~/shared/lib/copy";
import {
	COPY as CARD_COPY,
	type ClimberCardProps,
} from "~/ui/kanto-theme/ClimberCard.ui";
import {
	gateOf,
	trackPosition,
} from "~/modules/run/community/domain/climbMap.model";
import { publicBuildChipsFor } from "~/modules/run/build/application/publicBuild.viewmodel";
import type { CoverageBandId } from "~/modules/run/build/domain/coverageRatio.model";
import {
	ALL_SWATCHES,
	type SwatchFinish,
	type SwatchTheme,
} from "~/modules/run/gate/domain/swatch.model";
import { SLICE_WINDOW } from "~/modules/run/run/domain/rules.model";

export type ClimberMark = "perfect" | "shaky";

export type LadderClimber = {
	id: string;
	name: string;
	photoUrl?: string;
	borderUrl?: string;
	you: boolean;
	rival: boolean;
	rescued: boolean;
	mark?: ClimberMark;
	card?: ClimberCardProps;
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

const markOf = (band: CoverageBandId | undefined): ClimberMark | undefined =>
	band === "perfect" || band === "shaky" ? band : undefined;

const categoryNameOf = (code: string | undefined): string | undefined =>
	code === undefined || !isCategoryCode(code)
		? undefined
		: getCategoryMetadata(code).name;

const statsOf = (entry: ClimbClimber | ClimbFallen) => [
	{ label: CARD_COPY.streak, value: String(entry.streak ?? 0) },
	{
		label: CARD_COPY.bestCategory,
		value: categoryNameOf(entry.bestCategory) ?? CARD_COPY.none,
	},
	{ label: CARD_COPY.gate, value: String(entry.gate) },
];

const cardOf = (
	entry: ClimbClimber | ClimbFallen,
	chip: LadderClimber
): ClimberCardProps | undefined => {
	if (entry.build === undefined) return undefined;

	return {
		name: chip.name,
		profileHref: profilePathFor(entry.id),
		...(entry.handle === undefined ? {} : { handle: entry.handle }),
		...(entry.title === undefined ? {} : { title: entry.title }),
		...(chip.photoUrl === undefined ? {} : { photoUrl: chip.photoUrl }),
		...(chip.borderUrl === undefined ? {} : { borderUrl: chip.borderUrl }),
		you: chip.you,
		rival: chip.rival,
		perfect: chip.mark === "perfect",
		shaky: chip.mark === "shaky",
		rescued: chip.rescued,
		gate: gateLabelOf(entry.gate),
		...(entry.closingBand === undefined ? {} : { band: entry.closingBand }),
		...(entry.coveragePercent === undefined
			? {}
			: { coveragePercent: entry.coveragePercent }),
		weight: `${publicWeightOf(entry.build)} ${OF} ${publicSpaceOf(entry.build)} ${WEIGHT}`,
		...(entry.storageKb === undefined
			? {}
			: { storage: kbLabel(entry.storageKb) }),
		build: publicBuildChipsFor(entry.build),
		stats: statsOf(entry),
	};
};

const chipOf = (
	entry: ClimbClimber | ClimbFallen,
	rivalIds: readonly string[],
	you: boolean
): LadderClimber => {
	const mark = markOf(entry.closingBand);
	const chip: LadderClimber = {
		id: entry.id,
		name: entry.displayName,
		photoUrl: entry.photoUrl ?? undefined,
		borderUrl: entry.borderUrl ?? undefined,
		you,
		rival: rivalIds.includes(entry.id),
		rescued: (entry.startedAtGate ?? 0) > 0,
		...(mark === undefined ? {} : { mark }),
	};
	const card = cardOf(entry, chip);

	return card === undefined ? chip : { ...chip, card };
};

export const ladderFor = (
	climb: ClimbTodayView,
	rivalIds: readonly string[] = []
): LadderGate[] => {
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
			.map((climber) => chipOf(climber, rivalIds, climber.you)),
		fallen: [...climb.fallen]
			.filter((fallen) => fallen.gate === swatch.gate)
			.sort(byDepthThenId)
			.map((fallen) => ({
				...chipOf(fallen, rivalIds, false),
				runKey: String(fallen.runId),
			})),
	}));
};
