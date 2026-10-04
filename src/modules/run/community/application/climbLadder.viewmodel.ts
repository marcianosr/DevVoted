import type {
	ClimbClimber,
	ClimbFallen,
	ClimbTodayView,
	ClimbViewer,
} from "~/modules/run/community/application/community.service";
import { lootRefusalOf } from "~/modules/run/community/domain/loot.model";
import {
	type PlayerCardView,
	playerCardFor,
} from "~/modules/run/community/application/playerCard.viewmodel";
import { DEFAULT_PROFILE_THEME } from "~/modules/account/profile/domain/profileTheme.model";
import { profilePathFor } from "~/shared/lib/profilePath";
import { kbLabel } from "~/shared/lib/storage";
import {
	type ClimberCardFile,
	type ClimberCardLoot,
	type ClimberCardProps,
} from "~/ui/kanto-theme/ClimberCard.ui";
import {
	gateOf,
	trackPosition,
} from "~/modules/run/community/domain/climbMap.model";
import type { CoverageBandId } from "~/modules/run/build/domain/coverageRatio.model";
import {
	ALL_SWATCHES,
	type SwatchFinish,
	type SwatchTheme,
} from "~/modules/run/gate/domain/swatch.model";
import { SLICE_WINDOW } from "~/modules/run/run/domain/rules.model";

export const LOOT_COPY = {
	take: (figure: string) => `Loot ${figure}`,
	unbanked: (figure: string) => `${figure} unbanked`,
	takenBy: (name: string, figure: string) => `looted by ${name} · ${figure}`,
	takenByYou: (figure: string) => `looted by you · ${figure}`,
	empty: "nothing left to loot",
	someone: "another climber",
} as const;

export type LootHand = {
	readonly onLoot: (runId: number) => void;
	readonly pendingRunId?: number;
};

export const FILE_COPY = {
	press: (audit: string) => `File ${audit}`,
	outOfReach: (audit: string) => `${audit} cannot reach them`,
} as const;

export type FileHand = {
	readonly audit: string;
	readonly targetRunIdByUserId: ReadonlyMap<string, number>;
	readonly onFile: (targetRunId: number) => void;
	readonly pendingRunId?: number;
	readonly refused?: { readonly targetRunId: number; readonly reason: string };
};

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

const takenLabelOf = (fallen: ClimbFallen, viewer: ClimbViewer): string => {
	const figure = kbLabel(fallen.lootKb);

	return fallen.lootedById === viewer.id
		? LOOT_COPY.takenByYou(figure)
		: LOOT_COPY.takenBy(fallen.lootedByName ?? LOOT_COPY.someone, figure);
};

export const lootOf = (
	fallen: ClimbFallen,
	viewer: ClimbViewer,
	hand?: LootHand
): ClimberCardLoot => {
	const refusal = lootRefusalOf(
		{
			ownerId: fallen.id,
			lootedById: fallen.lootedById,
			lootKb: fallen.lootKb,
		},
		viewer
	);

	if (refusal === "already-looted")
		return { label: takenLabelOf(fallen, viewer) };
	if (refusal === "nothing-left") return { label: LOOT_COPY.empty };
	if (refusal !== null || hand === undefined)
		return { label: LOOT_COPY.unbanked(kbLabel(fallen.lootKb)) };

	return {
		label: LOOT_COPY.take(kbLabel(fallen.lootKb)),
		onPress: () => hand.onLoot(fallen.runId),
		pending: hand.pendingRunId === fallen.runId,
	};
};

export const fileOf = (
	userId: string,
	hand?: FileHand
): ClimberCardFile | undefined => {
	if (hand === undefined) return undefined;

	const label = FILE_COPY.press(hand.audit);
	const targetRunId = hand.targetRunIdByUserId.get(userId);
	if (targetRunId === undefined)
		return { label, refusal: FILE_COPY.outOfReach(hand.audit) };
	if (hand.refused?.targetRunId === targetRunId)
		return { label, refusal: hand.refused.reason };

	return {
		label,
		onPress: () => hand.onFile(targetRunId),
		pending: hand.pendingRunId === targetRunId,
	};
};

export const playerCardViewOf = (
	entry: ClimbClimber | ClimbFallen
): PlayerCardView => ({
	userId: entry.id,
	displayName: entry.displayName,
	...(entry.photoUrl == null ? {} : { photoUrl: entry.photoUrl }),
	...(entry.borderUrl == null ? {} : { borderUrl: entry.borderUrl }),
	titles: entry.titles ?? [],
	theme: entry.theme ?? DEFAULT_PROFILE_THEME,
	...(entry.build === undefined
		? {}
		: {
				run: {
					gate: entry.gate,
					coveragePercent: entry.coveragePercent ?? 0,
					streak: entry.streak ?? 0,
					storageKb: entry.storageKb ?? 0,
					build: entry.build,
					...(entry.bestCategory === undefined
						? {}
						: { bestCategory: entry.bestCategory }),
				},
			}),
});

const cardOf = (
	entry: ClimbClimber | ClimbFallen,
	chip: LadderClimber,
	loot?: ClimberCardLoot,
	file?: ClimberCardFile
): ClimberCardProps | undefined => {
	if (entry.build === undefined) return undefined;

	return {
		...playerCardFor(playerCardViewOf(entry)),
		name: chip.name,
		profileHref: profilePathFor(entry.id),
		you: chip.you,
		rival: chip.rival,
		perfect: chip.mark === "perfect",
		shaky: chip.mark === "shaky",
		rescued: chip.rescued,
		...(loot === undefined ? {} : { loot }),
		...(file === undefined ? {} : { file }),
	};
};

const chipOf = (
	entry: ClimbClimber | ClimbFallen,
	rivalIds: readonly string[],
	you: boolean,
	loot?: ClimberCardLoot,
	file?: ClimberCardFile
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
	const card = cardOf(entry, chip, loot, file);

	return card === undefined ? chip : { ...chip, card };
};

export const ladderFor = (
	climb: ClimbTodayView,
	rivalIds: readonly string[] = [],
	hand?: LootHand,
	filing?: FileHand
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
			.map((climber) =>
				chipOf(
					climber,
					rivalIds,
					climber.you,
					undefined,
					climber.you ? undefined : fileOf(climber.id, filing)
				)
			),
		fallen: [...climb.fallen]
			.filter((fallen) => fallen.gate === swatch.gate)
			.sort(byDepthThenId)
			.map((fallen) => ({
				...chipOf(fallen, rivalIds, false, lootOf(fallen, climb.viewer, hand)),
				runKey: String(fallen.runId),
			})),
	}));
};
