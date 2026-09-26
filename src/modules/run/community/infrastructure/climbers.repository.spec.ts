import { describe, expect, it } from "vitest";

import { borderUrlOf } from "~/modules/account/profile/domain/border.model";

describe("borderUrlOf", () => {
	it("resolves an equipped border id to its catalog art", () => {
		expect(borderUrlOf("border-00b9a62e")).toBe(
			"/borders/00b9a62e09a1e452d6840170849e8ac06f6d3ef5.png"
		);
	});

	it("wears nothing when no border is equipped", () => {
		expect(borderUrlOf(null)).toBeNull();
	});

	it("wears nothing when the equipped id has left the catalog", () => {
		expect(borderUrlOf("border-retired")).toBeNull();
	});
});
