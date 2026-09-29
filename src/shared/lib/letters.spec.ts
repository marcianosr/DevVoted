import { describe, expect, it } from "vitest";

import { letterAt } from "./letters";

describe("letterAt", () => {
	it("names the first option A and the twenty-sixth Z", () => {
		expect(letterAt(0)).toBe("A");
		expect(letterAt(25)).toBe("Z");
	});

	it("has no letter past Z", () => {
		expect(letterAt(26)).toBe("?");
	});
});
