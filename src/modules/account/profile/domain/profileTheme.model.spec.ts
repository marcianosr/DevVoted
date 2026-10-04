import { describe, expect, it } from "vitest";

import {
	DEFAULT_PROFILE_THEME,
	profileThemeFor,
	wearSwatch,
} from "~/modules/account/profile/domain/profileTheme.model";

const CINNABAR = "swatch-cinnabar";
const PALLET = "swatch-pallet";

describe("profileThemeFor", () => {
	it("wears pallet when nothing is worn", () => {
		expect(profileThemeFor(null, [CINNABAR])).toBe("gate-pallet");
		expect(DEFAULT_PROFILE_THEME).toBe("gate-pallet");
	});

	it("wears the theme of an owned swatch", () => {
		expect(profileThemeFor(CINNABAR, [CINNABAR])).toBe("gate-cinnabar");
	});

	it("falls back to pallet for a worn swatch the player does not own", () => {
		expect(profileThemeFor(CINNABAR, [])).toBe("gate-pallet");
	});

	it("falls back to pallet for an id no swatch carries", () => {
		expect(profileThemeFor("swatch-retired", ["swatch-retired"])).toBe(
			"gate-pallet"
		);
	});
});

describe("wearSwatch", () => {
	it("wears an owned swatch", () => {
		expect(wearSwatch(CINNABAR, [CINNABAR])).toEqual({
			kind: "worn",
			worn: CINNABAR,
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
		expect(wearSwatch(CINNABAR, [])).toEqual({
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
