import { describe, expect, it } from "vitest";

import {
	isSameLook,
	lookRefusalOf,
	toggleTitleIn,
	type Look,
	type LookOwnership,
} from "~/modules/account/profile/domain/look.model";

const GREEN_BUILD = "border-00b9a62e";
const RUBBER_DUCK = "border-0a006140";
const SHIP_IT = "title-rank-poll-newbie";
const TESTER = "title-legacy-tester";
const CSS_CARRIER = "title-answered-css";
const BIKESHEDDER = "title-it-compiles";

const OWNED: LookOwnership = {
	ownedBorderIds: [GREEN_BUILD],
	ownedTitleIds: [SHIP_IT, TESTER, CSS_CARRIER, BIKESHEDDER],
};

const WORN: Look = { borderId: GREEN_BUILD, titleIds: [SHIP_IT, TESTER] };

describe("lookRefusalOf", () => {
	it("accepts a look made only of owned things within the cap", () => {
		expect(lookRefusalOf(WORN, OWNED)).toBeNull();
	});

	it("accepts the default border and no titles", () => {
		expect(lookRefusalOf({ borderId: null, titleIds: [] }, OWNED)).toBeNull();
	});

	it("refuses a border the player has not bought", () => {
		expect(lookRefusalOf({ ...WORN, borderId: RUBBER_DUCK }, OWNED)).toBe(
			"border-not-owned"
		);
	});

	it("refuses a title the player has not earned", () => {
		expect(
			lookRefusalOf({ ...WORN, titleIds: ["title-maintainer-git"] }, OWNED)
		).toBe("title-not-owned");
	});

	it("refuses more titles than a card can wear", () => {
		const titleIds = [SHIP_IT, TESTER, CSS_CARRIER, BIKESHEDDER];

		expect(lookRefusalOf({ ...WORN, titleIds }, OWNED)).toBe("over-cap");
	});
});

describe("toggleTitleIn", () => {
	it("puts an earned title on after the ones already worn", () => {
		expect(
			toggleTitleIn(WORN, CSS_CARRIER, OWNED.ownedTitleIds).titleIds
		).toEqual([SHIP_IT, TESTER, CSS_CARRIER]);
	});

	it("takes a worn title off and closes the gap", () => {
		expect(toggleTitleIn(WORN, SHIP_IT, OWNED.ownedTitleIds).titleIds).toEqual([
			TESTER,
		]);
	});

	it("leaves a full card as it is", () => {
		const full = { ...WORN, titleIds: [SHIP_IT, TESTER, CSS_CARRIER] };

		expect(toggleTitleIn(full, BIKESHEDDER, OWNED.ownedTitleIds)).toEqual(full);
	});
});

describe("isSameLook", () => {
	it("reads a reordered title list as a different look", () => {
		expect(isSameLook(WORN, { ...WORN, titleIds: [TESTER, SHIP_IT] })).toBe(
			false
		);
	});

	it("reads an identical look as the same", () => {
		expect(isSameLook(WORN, { ...WORN, titleIds: [...WORN.titleIds] })).toBe(
			true
		);
	});
});
