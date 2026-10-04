import {
	ALL_SWATCHES,
	type GateSwatch,
	type SwatchTheme,
} from "~/modules/run/gate/domain/swatch.model";

export const DEFAULT_PROFILE_THEME: SwatchTheme = "gate-pallet";

const findSwatchById = (swatchId: string): GateSwatch | undefined =>
	ALL_SWATCHES.find((swatch) => swatch.id === swatchId);

export const isDefaultSwatch = (swatch: GateSwatch): boolean =>
	swatch.theme === DEFAULT_PROFILE_THEME;

export const profileThemeFor = (
	wornSwatchId: string | null,
	ownedSwatchIds: readonly string[]
): SwatchTheme => {
	if (wornSwatchId === null || !ownedSwatchIds.includes(wornSwatchId)) {
		return DEFAULT_PROFILE_THEME;
	}
	return findSwatchById(wornSwatchId)?.theme ?? DEFAULT_PROFILE_THEME;
};

export const storedSwatchIdOf = (swatchId: string | null): string | null => {
	const swatch = swatchId === null ? undefined : findSwatchById(swatchId);
	return swatch === undefined || isDefaultSwatch(swatch) ? null : swatch.id;
};

export type SwatchWearRefusal = "unknown" | "not-owned";

export type SwatchWearDecision =
	| { readonly kind: "worn"; readonly worn: string | null }
	| { readonly kind: "refused"; readonly reason: SwatchWearRefusal };

const NOTHING_WORN: SwatchWearDecision = { kind: "worn", worn: null };

export const wearSwatch = (
	swatchId: string | null,
	ownedSwatchIds: readonly string[]
): SwatchWearDecision => {
	if (swatchId === null) return NOTHING_WORN;

	const swatch = findSwatchById(swatchId);
	if (swatch === undefined) return { kind: "refused", reason: "unknown" };
	if (isDefaultSwatch(swatch)) return NOTHING_WORN;
	if (!ownedSwatchIds.includes(swatchId)) {
		return { kind: "refused", reason: "not-owned" };
	}
	return { kind: "worn", worn: swatchId };
};
