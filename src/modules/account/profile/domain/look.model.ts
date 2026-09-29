import {
	removeTitle,
	wearEach,
	WORN_TITLE_CAP,
} from "~/modules/account/profile/domain/title.model";

export type Look = {
	readonly borderId: string | null;
	readonly titleIds: readonly string[];
};

export type LookOwnership = {
	readonly ownedBorderIds: readonly string[];
	readonly ownedTitleIds: readonly string[];
};

export type LookRefusal = "border-not-owned" | "title-not-owned" | "over-cap";

export const isSameLook = (a: Look, b: Look): boolean =>
	a.borderId === b.borderId &&
	a.titleIds.length === b.titleIds.length &&
	a.titleIds.every((titleId, index) => b.titleIds[index] === titleId);

export const toggleTitleIn = (
	look: Look,
	titleId: string,
	ownedTitleIds: readonly string[]
): Look => ({
	...look,
	titleIds: look.titleIds.includes(titleId)
		? removeTitle(look.titleIds, titleId)
		: wearEach(look.titleIds, [titleId], ownedTitleIds),
});

export const lookRefusalOf = (
	look: Look,
	owned: LookOwnership
): LookRefusal | null => {
	// TODO(Marciano): return the first refusal that applies, or null.
	void WORN_TITLE_CAP;
	void look;
	void owned;
	return null;
};
