import {
	isDefaultSwatch,
	profileThemeFor,
} from "~/modules/account/profile/domain/profileTheme.model";
import {
	ALL_SWATCHES,
	type GateSwatch,
	type SwatchTheme,
} from "~/modules/run/gate/domain/swatch.model";
import type { SwatchFill } from "~/ui/kanto-theme/Swatch.ui";

export type SwatchPickState = "worn" | "owned" | "locked";

export type SwatchPick = {
	readonly id: string;
	readonly name: string;
	readonly state: SwatchPickState;
	readonly fill: SwatchFill;
};

const pickStateOf = (
	swatch: GateSwatch,
	worn: SwatchTheme,
	ownedSwatchIds: readonly string[]
): SwatchPickState => {
	if (swatch.theme === worn) return "worn";
	if (isDefaultSwatch(swatch) || ownedSwatchIds.includes(swatch.id)) {
		return "owned";
	}
	return "locked";
};

export const swatchPicksFor = (
	ownedSwatchIds: readonly string[],
	wornSwatchId: string | null
): readonly SwatchPick[] => {
	const worn = profileThemeFor(wornSwatchId, ownedSwatchIds);
	return ALL_SWATCHES.map((swatch) => {
		const state = pickStateOf(swatch, worn, ownedSwatchIds);
		return {
			id: swatch.id,
			name: swatch.gateName,
			state,
			fill:
				state === "locked"
					? { state: "undiscovered" }
					: { state: "discovered", swatch },
		};
	});
};
