import {
	type Authorship,
	isContributor,
	NO_AUTHORSHIP,
} from "~/modules/account/profile/domain/authorship.model";
import type { ProfileFace } from "~/modules/account/profile/domain/profile.model";
import type {
	ClosedGate,
	Standing,
} from "~/modules/run/community/domain/standing.model";
import {
	publicSpaceOf,
	publicWeightOf,
} from "~/modules/run/build/domain/publicBuild.model";
import { publicBuildChipsFor } from "~/modules/run/build/application/publicBuild.viewmodel";
import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";
import {
	bandAtLadder,
	baseGateLadderAt,
} from "~/modules/run/gate/domain/gate.model";
import {
	gateNumberLabelOf,
	gateSwatchAt,
	swatchTrackFor,
} from "~/modules/run/gate/application/swatchTrack.viewmodel";
import { getCategoryMetadata, isCategoryCode } from "~/shared/lib/categories";
import type { KantoColor } from "~/ui/kanto-theme/colors";
import { kbLabel } from "~/shared/lib/storage";
import type { ContributionProps } from "~/modules/run/community/presentation/Contribution.ui";
import type {
	ClimberCardProps,
	ClimberCardStanding,
} from "~/modules/run/community/presentation/ClimberCard.ui";

export const CARD_COPY = {
	storage: "run storage",
	streak: "streak",
	best: "best",
	none: "—",
} as const;

const STORAGE_COLOR: KantoColor = "saffron";

export type PlayerCardView = {
	readonly userId: string;
	readonly displayName: string;
	readonly photoUrl?: string;
	readonly borderUrl?: string;
	readonly titles: readonly string[];
	readonly theme: SwatchTheme;
	readonly authorship?: Authorship;
	readonly pollsAnswered?: number;
	readonly swatchGates?: readonly number[];
	readonly run?: Standing;
};

export const playerCardViewFor = (
	userId: string,
	{ identity, theme }: ProfileFace,
	swatchGates: readonly number[],
	run: Standing | null
): PlayerCardView => ({
	userId,
	displayName: identity.displayName,
	...(identity.photoUrl === null ? {} : { photoUrl: identity.photoUrl }),
	...(identity.borderUrl === null ? {} : { borderUrl: identity.borderUrl }),
	titles: identity.wornTitles,
	theme,
	authorship: identity.authorship,
	pollsAnswered: identity.pollsAnswered,
	swatchGates,
	...(run === null ? {} : { run }),
});

const categoryNameOf = (code: string | undefined): string =>
	code === undefined || !isCategoryCode(code)
		? CARD_COPY.none
		: getCategoryMetadata(code).name;

const currentGateOf = (run: Standing): ClosedGate => {
	const ladder = baseGateLadderAt(run.gate);

	return {
		gate: run.gate,
		band: bandAtLadder(run.coveragePercent, ladder).id,
		held: run.coveragePercent,
		ladder,
	};
};

const gateReadingOf = ({ gate, band, held, ladder }: ClosedGate) => {
	const swatch = gateSwatchAt(gate);

	return {
		name: swatch.gateName,
		label: gateNumberLabelOf(gate),
		swatch,
		coverage: { ...ladder, held, band },
	};
};

export const standingFor = (run: Standing): ClimberCardStanding => {
	const weight = publicWeightOf(run.build);
	const space = publicSpaceOf(run.build);

	return {
		gate: gateReadingOf(run.lastClose ?? currentGateOf(run)),
		weight: `${weight} / ${space}`,
		build: publicBuildChipsFor(run.build),
		freeSlots: Math.max(0, space - weight),
		stats: [
			{
				label: CARD_COPY.storage,
				value: kbLabel(run.storageKb),
				color: STORAGE_COLOR,
			},
			{ label: CARD_COPY.streak, value: String(run.streak) },
			{ label: CARD_COPY.best, value: categoryNameOf(run.bestCategory) },
		],
	};
};

export const contributionOf = (
	authorship: Authorship,
	pollsAnswered: number
): ContributionProps => ({
	answered: pollsAnswered,
	...(isContributor(authorship) ? { authored: authorship } : {}),
});

export const playerCardFor = (view: PlayerCardView): ClimberCardProps => ({
	name: view.displayName,
	...(view.photoUrl === undefined ? {} : { photoUrl: view.photoUrl }),
	...(view.borderUrl === undefined ? {} : { borderUrl: view.borderUrl }),
	titles: view.titles,
	theme: view.theme,
	...(view.pollsAnswered === undefined
		? {}
		: {
				contribution: contributionOf(
					view.authorship ?? NO_AUTHORSHIP,
					view.pollsAnswered
				),
			}),
	...(view.swatchGates === undefined
		? {}
		: { swatches: swatchTrackFor(view.swatchGates) }),
	...(view.run === undefined ? {} : { standing: standingFor(view.run) }),
});
