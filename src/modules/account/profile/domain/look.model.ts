import {
	storedSwatchIdOf,
	wearSwatch,
} from "~/modules/account/profile/domain/profileTheme.model";
import {
	removeTitle,
	wearEach,
	wearTitle,
	type WearDecision,
	type WearRefusal,
} from "~/modules/account/profile/domain/title.model";

export type Look = {
	readonly borderId: string | null;
	readonly titleIds: readonly string[];
	readonly swatchId: string | null;
};

export type LookOwnership = {
	readonly ownedBorderIds: readonly string[];
	readonly ownedTitleIds: readonly string[];
	readonly ownedSwatchIds: readonly string[];
	readonly wornBorderId: string | null;
};

export type LookRefusal =
	| "border-not-owned"
	| "title-not-owned"
	| "title-repeated"
	| "over-cap"
	| "swatch-not-owned";

const TITLE_REFUSAL: Record<WearRefusal, LookRefusal> = {
	unknown: "title-not-owned",
	"not-owned": "title-not-owned",
	"already-worn": "title-repeated",
	"at-cap": "over-cap",
};

export const isSameLook = (a: Look, b: Look): boolean =>
	a.borderId === b.borderId &&
	a.swatchId === b.swatchId &&
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

const isRefused = (
	decision: WearDecision
): decision is Extract<WearDecision, { kind: "refused" }> =>
	decision.kind === "refused";

const titleRefusalOf = (
	titleIds: readonly string[],
	ownedTitleIds: readonly string[]
): LookRefusal | null => {
	const refused = titleIds
		.map((titleId, index) =>
			wearTitle(titleIds.slice(0, index), titleId, ownedTitleIds)
		)
		.find(isRefused);

	return refused === undefined ? null : TITLE_REFUSAL[refused.reason];
};

const mayWearBorder = (
	borderId: string | null,
	owned: LookOwnership
): boolean =>
	borderId === null ||
	borderId === owned.wornBorderId ||
	owned.ownedBorderIds.includes(borderId);

export const lookRefusalOf = (
	look: Look,
	owned: LookOwnership
): LookRefusal | null => {
	if (!mayWearBorder(look.borderId, owned)) {
		return "border-not-owned";
	}
	if (wearSwatch(look.swatchId, owned.ownedSwatchIds).kind === "refused") {
		return "swatch-not-owned";
	}

	return titleRefusalOf(look.titleIds, owned.ownedTitleIds);
};

export const storedSwatchOf = (look: Look): string | null =>
	storedSwatchIdOf(look.swatchId);
