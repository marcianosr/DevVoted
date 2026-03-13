import { describe, expect, it } from "vitest";

import { getRandomGateOptions, STARTING_GATE } from "./httpGates";

describe("STARTING_GATE", () => {
	it("is 200 OK with no constraint or reward", () => {
		expect(STARTING_GATE.httpCode).toBe(200);
		expect(STARTING_GATE.constraint).toBeNull();
		expect(STARTING_GATE.reward).toBeNull();
		expect(STARTING_GATE.difficulty).toBe("easy");
	});
});

describe("getRandomGateOptions", () => {
	it("always returns exactly 2 options", () => {
		const [easier, harder] = getRandomGateOptions();
		expect(easier).toBeDefined();
		expect(harder).toBeDefined();
	});

	it("first option is always easier (easy or normal difficulty)", () => {
		// Run multiple times to account for randomness
		for (let i = 0; i < 20; i++) {
			const [easier] = getRandomGateOptions();
			expect(["easy", "normal"]).toContain(easier.difficulty);
		}
	});

	it("second option is always harder (hard or intense difficulty)", () => {
		for (let i = 0; i < 20; i++) {
			const [, harder] = getRandomGateOptions();
			expect(["hard", "intense"]).toContain(harder.difficulty);
		}
	});

	it("easier option never has a constraint", () => {
		for (let i = 0; i < 20; i++) {
			const [easier] = getRandomGateOptions();
			expect(easier.constraint).toBeNull();
		}
	});

	it("harder option always has both a constraint and a reward", () => {
		for (let i = 0; i < 20; i++) {
			const [, harder] = getRandomGateOptions();
			expect(harder.constraint).not.toBeNull();
			expect(harder.reward).not.toBeNull();
		}
	});
});
