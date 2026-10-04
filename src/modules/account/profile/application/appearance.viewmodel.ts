import { triedOnBorderOf } from "~/modules/account/profile/application/profileScreen.viewmodel";
import {
	borders,
	borderUrlOf,
	findBorderById,
} from "~/modules/account/profile/domain/border.model";
import type { Look } from "~/modules/account/profile/domain/look.model";
import type { ProfileIdentity } from "~/modules/account/profile/domain/profile.model";
import {
	findTitleById,
	wornTitleNames,
	WORN_TITLE_CAP,
	type Title,
} from "~/modules/account/profile/domain/title.model";
import {
	tallyOf,
	titleTallyOf,
	type Tally,
} from "~/modules/collection/dex/domain/tally.model";
import {
	swatchPicksFor,
	type SwatchPick,
} from "~/modules/account/profile/application/swatchPick.viewmodel";

export type BorderPick = {
	id: string | null;
	name: string;
	image?: string;
	picked: boolean;
};

export type TitlePick = {
	id: string;
	name: string;
	wornAt: number | null;
	blocked: boolean;
};

export type AppearanceView = {
	borders: readonly BorderPick[];
	borderTally: Tally;
	titles: readonly TitlePick[];
	titleTally: Tally;
	swatches: readonly SwatchPick[];
};

export type AppearanceInput = {
	look: Look;
	ownedBorderIds: readonly string[];
	ownedTitleIds: readonly string[];
	ownedSwatchIds: readonly string[];
};

export const DEFAULT_BORDER_NAME = "Default";

const NOT_SAVED = "not saved";
const PREVIEW_DIVIDER = " · ";
const PREVIEW_LABEL = `preview${PREVIEW_DIVIDER}${NOT_SAVED}`;
const tryingOnLabelOf = (name: string) =>
	`trying on ${name}${PREVIEW_DIVIDER}${NOT_SAVED}`;

export const previewLabelFor = (
	look: Look,
	tryingOnId: string | null,
	isDirty: boolean
): string | undefined => {
	const triedOn = triedOnBorderOf(tryingOnId, look.borderId);
	if (triedOn !== undefined) return tryingOnLabelOf(triedOn.name);
	return isDirty ? PREVIEW_LABEL : undefined;
};

export const lookedIdentityOf = (
	identity: ProfileIdentity,
	look: Look,
	tryingOnId: string | null
): ProfileIdentity => ({
	...identity,
	borderUrl: borderUrlOf(tryingOnId ?? look.borderId),
	wornTitles: wornTitleNames(look.titleIds),
});

const borderPicksOf = (
	ownedBorderIds: readonly string[],
	pickedId: string | null
): readonly BorderPick[] => [
	{ id: null, name: DEFAULT_BORDER_NAME, picked: pickedId === null },
	...ownedBorderIds.flatMap((borderId) => {
		const border = findBorderById(borderId);
		return border
			? [
					{
						id: border.id,
						name: border.name,
						image: border.image,
						picked: border.id === pickedId,
					},
				]
			: [];
	}),
];

const titlesIn = (titleIds: readonly string[]): readonly Title[] =>
	titleIds.flatMap((titleId) => {
		const title = findTitleById(titleId);
		return title ? [title] : [];
	});

const titlePicksOf = (
	ownedTitleIds: readonly string[],
	wornIds: readonly string[]
): readonly TitlePick[] => {
	const atCap = wornIds.length >= WORN_TITLE_CAP;
	const unworn = ownedTitleIds.filter((titleId) => !wornIds.includes(titleId));
	return titlesIn([...wornIds, ...unworn]).map((title) => {
		const wornIndex = wornIds.indexOf(title.id);
		return {
			id: title.id,
			name: title.name,
			wornAt: wornIndex === -1 ? null : wornIndex + 1,
			blocked: atCap && wornIndex === -1,
		};
	});
};

export const appearanceFor = ({
	look,
	ownedBorderIds,
	ownedTitleIds,
	ownedSwatchIds,
}: AppearanceInput): AppearanceView => ({
	borders: borderPicksOf(ownedBorderIds, look.borderId),
	borderTally: tallyOf(borders, (border) => ownedBorderIds.includes(border.id)),
	titles: titlePicksOf(ownedTitleIds, look.titleIds),
	titleTally: titleTallyOf(ownedTitleIds),
	swatches: swatchPicksFor(ownedSwatchIds, look.swatchId),
});
