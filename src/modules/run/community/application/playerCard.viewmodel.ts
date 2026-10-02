import {
	type Authorship,
	isContributor,
} from "~/modules/account/profile/domain/authorship.model";
import type { ProfileFace } from "~/modules/account/profile/domain/profile.model";
import type { Standing } from "~/modules/run/community/domain/standing.model";
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
} from "~/modules/run/gate/application/swatchTrack.viewmodel";
import { getCategoryMetadata, isCategoryCode } from "~/shared/lib/categories";
import type { KantoColor } from "~/ui/kanto-theme/colors";
import { kbLabel } from "~/shared/lib/storage";
import {
	COPY as CARD_COPY,
	type ClimberCardProps,
	type ClimberCardStanding,
} from "~/ui/kanto-theme/ClimberCard.ui";

const STORAGE_COLOR: KantoColor = "saffron";

export type PlayerCardView = {
	readonly userId: string;
	readonly displayName: string;
	readonly photoUrl?: string;
	readonly borderUrl?: string;
	readonly titles: readonly string[];
	readonly theme: SwatchTheme;
	readonly authorship?: Authorship;
	readonly run?: Standing;
};

export const playerCardViewFor = (
	userId: string,
	{ identity, theme }: ProfileFace,
	run: Standing | null
): PlayerCardView => ({
	userId,
	displayName: identity.displayName,
	...(identity.photoUrl === null ? {} : { photoUrl: identity.photoUrl }),
	...(identity.borderUrl === null ? {} : { borderUrl: identity.borderUrl }),
	titles: identity.wornTitles,
	theme,
	authorship: identity.authorship,
	...(run === null ? {} : { run }),
});

const categoryNameOf = (code: string | undefined): string =>
	code === undefined || !isCategoryCode(code)
		? CARD_COPY.none
		: getCategoryMetadata(code).name;

export const standingFor = (run: Standing): ClimberCardStanding => {
	const swatch = gateSwatchAt(run.gate);
	const ladder = baseGateLadderAt(run.gate);
	const weight = publicWeightOf(run.build);
	const space = publicSpaceOf(run.build);

	return {
		gate: {
			name: swatch.gateName,
			label: gateNumberLabelOf(run.gate),
			swatch,
			coverage: {
				...ladder,
				held: run.coveragePercent,
				band: bandAtLadder(run.coveragePercent, ladder).id,
			},
		},
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

const isContributing = (
	authorship: Authorship | undefined
): authorship is Authorship =>
	authorship !== undefined && isContributor(authorship);

export const playerCardFor = (view: PlayerCardView): ClimberCardProps => ({
	name: view.displayName,
	...(view.photoUrl === undefined ? {} : { photoUrl: view.photoUrl }),
	...(view.borderUrl === undefined ? {} : { borderUrl: view.borderUrl }),
	titles: view.titles,
	theme: view.theme,
	...(isContributing(view.authorship) ? { contribution: view.authorship } : {}),
	...(view.run === undefined ? {} : { standing: standingFor(view.run) }),
});
