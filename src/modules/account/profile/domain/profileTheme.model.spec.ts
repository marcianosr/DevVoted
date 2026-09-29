import { describe, expect, it } from "vitest";

import {
	DEFAULT_PROFILE_THEME,
	profileThemeFor,
	wearSwatch,
} from "~/modules/account/profile/domain/profileTheme.model";

const VOLCANO = "swatch-volcano";
const PALLET = "swatch-pallet";

describe("profileThemeFor", () => {
	it("wears pallet when nothing is worn", () => {
		expect(profileThemeFor(null, [VOLCANO])).toBe("pallet");
		expect(DEFAULT_PROFILE_THEME).toBe("pallet");
	});

	it("wears the theme of an owned swatch", () => {
		expect(profileThemeFor(VOLCANO, [VOLCANO])).toBe("volcano");
	});

	it("falls back to pallet for a worn swatch the player does not own", () => {
		expect(profileThemeFor(VOLCANO, [])).toBe("pallet");
	});

	it("falls back to pallet for an id no swatch carries", () => {
		expect(profileThemeFor("swatch-retired", ["swatch-retired"])).toBe(
			"pallet"
		);
	});
});

describe("wearSwatch", () => {
	it("wears an owned swatch", () => {
		expect(wearSwatch(VOLCANO, [VOLCANO])).toEqual({
			kind: "worn",
			worn: VOLCANO,
		});
	});

	it("takes the swatch off when given none", () => {
		expect(wearSwatch(null, [])).toEqual({ kind: "worn", worn: null });
	});

	it("stores pallet as nothing worn, owned or not", () => {
		expect(wearSwatch(PALLET, [])).toEqual({ kind: "worn", worn: null });
		expect(wearSwatch(PALLET, [PALLET])).toEqual({ kind: "worn", worn: null });
	});

	it("refuses a swatch the player has not earned", () => {
		expect(wearSwatch(VOLCANO, [])).toEqual({
			kind: "refused",
			reason: "not-owned",
		});
	});

	it("refuses an id no swatch carries", () => {
		expect(wearSwatch("swatch-retired", ["swatch-retired"])).toEqual({
			kind: "refused",
			reason: "unknown",
		});
	});
});
