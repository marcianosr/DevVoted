import { describe, expect, it } from "vitest";

import {
	swatchPicksFor,
	type SwatchPick,
} from "~/modules/account/profile/application/swatchPick.viewmodel";
import { ALL_SWATCHES } from "~/modules/run/gate/domain/swatch.model";

const VOLCANO = "swatch-volcano";
const PALLET = "swatch-pallet";

const pickOf = (picks: readonly SwatchPick[], id: string) =>
	picks.find((pick) => pick.id === id);

describe("swatchPicksFor", () => {
	it("offers every swatch in gate order", () => {
		const picks = swatchPicksFor([], null);

		expect(picks.map((pick) => pick.id)).toEqual(
			ALL_SWATCHES.map((swatch) => swatch.id)
		);
	});

	it("wears pallet when nothing is worn, even unearned", () => {
		expect(pickOf(swatchPicksFor([], null), PALLET)?.state).toBe("worn");
	});

	it("marks the worn swatch and leaves pallet pickable", () => {
		const picks = swatchPicksFor([VOLCANO], VOLCANO);

		expect(pickOf(picks, VOLCANO)?.state).toBe("worn");
		expect(pickOf(picks, PALLET)?.state).toBe("owned");
	});

	it("locks an unearned swatch and withholds its colour", () => {
		const locked = pickOf(swatchPicksFor([], null), VOLCANO);

		expect(locked?.state).toBe("locked");
		expect(locked?.fill).toEqual({ state: "undiscovered" });
	});
});
