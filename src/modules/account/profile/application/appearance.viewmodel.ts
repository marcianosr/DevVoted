import {
	profileCardFor,
	triedOnBorderOf,
	type ProfileIdentity,
} from "~/modules/account/profile/application/profileScreen.viewmodel";
import {
	borders,
	borderUrlOf,
	findBorderById,
} from "~/modules/account/profile/domain/border.model";
import type { Look } from "~/modules/account/profile/domain/look.model";
import {
	findTitleById,
	visibleTitles,
	wornTitleNames,
	WORN_TITLE_CAP,
	type Title,
} from "~/modules/account/profile/domain/title.model";
import type { ProfileCardProps } from "~/ui/kanto-theme/ProfileCard.ui";

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

export type Tally = { held: number; total: number };

export type AppearanceView = {
	face: ProfileCardProps;
	tryingOn?: string;
	borders: readonly BorderPick[];
	borderTally: Tally;
	titles: readonly TitlePick[];
	titleTally: Tally;
};

export type AppearanceInput = {
	identity: ProfileIdentity;
	look: Look;
	tryingOnId: string | null;
	ownedBorderIds: readonly string[];
	ownedTitleIds: readonly string[];
};

export const DEFAULT_BORDER_NAME = "Default";

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
	identity,
	look,
	tryingOnId,
	ownedBorderIds,
	ownedTitleIds,
}: AppearanceInput): AppearanceView => {
	const triedOn = triedOnBorderOf(tryingOnId, look.borderId);
	const titleTotal = visibleTitles(ownedTitleIds).length;
	return {
		face: profileCardFor(lookedIdentityOf(identity, look, tryingOnId), false),
		...(triedOn === undefined ? {} : { tryingOn: triedOn.name }),
		borders: borderPicksOf(ownedBorderIds, look.borderId),
		borderTally: { held: ownedBorderIds.length, total: borders.length },
		titles: titlePicksOf(ownedTitleIds, look.titleIds),
		titleTally: { held: ownedTitleIds.length, total: titleTotal },
	};
};
