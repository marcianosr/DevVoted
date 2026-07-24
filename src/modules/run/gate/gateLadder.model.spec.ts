import { describe, expect, it } from "vitest";

import { deriveGateLadder } from "./gateLadder.model";

describe(deriveGateLadder, () => {
	it("marks cleared gates pass, the stall gate fail, and the rest skip", () => {
		expect(deriveGateLadder(2, false, 5)).toEqual([
			{ gate: 1, status: "pass" },
			{ gate: 2, status: "pass" },
			{ gate: 3, status: "fail" },
			{ gate: 4, status: "skip" },
			{ gate: 5, status: "skip" },
		]);
	});

	it("passes every gate on a won run with no fail or skip", () => {
		expect(deriveGateLadder(5, true, 5)).toEqual([
			{ gate: 1, status: "pass" },
			{ gate: 2, status: "pass" },
			{ gate: 3, status: "pass" },
			{ gate: 4, status: "pass" },
			{ gate: 5, status: "pass" },
		]);
	});

	it("fails the first gate when the run breaks before clearing any", () => {
		expect(deriveGateLadder(0, false, 3)).toEqual([
			{ gate: 1, status: "fail" },
			{ gate: 2, status: "skip" },
			{ gate: 3, status: "skip" },
		]);
	});

	it("defaults the ladder length to the victory gate", () => {
		expect(deriveGateLadder(1, false)).toHaveLength(5);
	});
});
