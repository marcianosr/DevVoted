import type { PublicBuild } from "~/modules/run/build/domain/publicBuild.model";
import {
	publicSpaceOf,
	publicWeightOf,
} from "~/modules/run/build/domain/publicBuild.model";
import { publicBuildChipsFor } from "~/modules/run/build/application/publicBuild.viewmodel";
import { baseGateLadderAt } from "~/modules/run/gate/domain/gate.model";
import {
	gateNumberLabelOf,
	gateSwatchAt,
} from "~/modules/run/gate/application/swatchTrack.viewmodel";
import { getCategoryMetadata, isCategoryCode } from "~/shared/lib/categories";
import { OF, WEIGHT } from "~/shared/lib/copy";
import { kbLabel } from "~/shared/lib/storage";
import {
	COPY as CARD_COPY,
	type ClimberCardProps,
	type ClimberCardStanding,
} from "~/ui/kanto-theme/ClimberCard.ui";

export type PlayerRun = {
	readonly gate: number;
	readonly coveragePercent: number;
	readonly streak: number;
	readonly storageKb: number;
	readonly bestCategory?: string;
	readonly build: PublicBuild;
};

export type PlayerCardView = {
	readonly userId: string;
	readonly displayName: string;
	readonly photoUrl?: string;
	readonly borderUrl?: string;
	readonly title?: string;
	readonly run?: PlayerRun;
};

const categoryNameOf = (code: string | undefined): string =>
	code === undefined || !isCategoryCode(code)
		? CARD_COPY.none
		: getCategoryMetadata(code).name;

export const standingFor = (run: PlayerRun): ClimberCardStanding => {
	const swatch = gateSwatchAt(run.gate);
	const weight = publicWeightOf(run.build);
	const space = publicSpaceOf(run.build);

	return {
		gate: {
			name: swatch.gateName,
			label: gateNumberLabelOf(run.gate),
			swatch,
			coverage: { ...baseGateLadderAt(run.gate), held: run.coveragePercent },
		},
		weight: `${weight} ${OF} ${space} ${WEIGHT}`,
		build: publicBuildChipsFor(run.build),
		freeSlots: Math.max(0, space - weight),
		stats: [
			{ label: CARD_COPY.storage, value: kbLabel(run.storageKb) },
			{ label: CARD_COPY.streak, value: String(run.streak) },
			{ label: CARD_COPY.best, value: categoryNameOf(run.bestCategory) },
		],
	};
};

export const playerCardFor = (view: PlayerCardView): ClimberCardProps => ({
	name: view.displayName,
	...(view.photoUrl === undefined ? {} : { photoUrl: view.photoUrl }),
	...(view.borderUrl === undefined ? {} : { borderUrl: view.borderUrl }),
	...(view.title === undefined ? {} : { title: view.title }),
	...(view.run === undefined ? {} : { standing: standingFor(view.run) }),
});
