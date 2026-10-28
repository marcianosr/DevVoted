import { describe, expect, it } from "vitest";

import { guestNameOf } from "~/modules/account/auth/domain/guestName.model";

const MISSINGNO = "missingno-from-cinnabar";

describe("guestNameOf", () => {
	it("names a guest after a trait, a Kanto or Johto Pokémon and a number", () => {
		expect(guestNameOf(MISSINGNO)).toBe("QuirkyAriados8870");
	});

	it("gives the same guest the same name on every visit", () => {
		expect(guestNameOf(MISSINGNO)).toBe(guestNameOf(MISSINGNO));
	});

	it("tells two guests apart", () => {
		expect(guestNameOf("red")).not.toBe(guestNameOf("blue"));
	});

	it("keeps the number to four digits at most", () => {
		for (const id of ["red", "blue", "green", "gold", "silver", MISSINGNO]) {
			expect(guestNameOf(id)).toMatch(/^[A-Z][a-z]+[A-Z][A-Za-z0-9]*?\d{1,4}$/);
		}
	});
});
