import { describe, it, expect } from "vitest";
import {
	outcomeSingle,
	outcomeMulti,
	singleCorrectnessFactor,
	multiCorrectnessFactor,
	calculateXP,
} from "./score.service";

describe("score.service", () => {
	describe("outcomeSingle", () => {
		it("returns full for correct answer", () => {
			expect(outcomeSingle(true)).toBe("full");
		});

		it("returns wrong for incorrect answer", () => {
			expect(outcomeSingle(false)).toBe("wrong");
		});
	});

	describe("outcomeMulti", () => {
		it("returns full for all correct, no wrong", () => {
			expect(outcomeMulti(2, 2, 0)).toBe("full");
		});

		it("returns partial for some correct, some wrong", () => {
			expect(outcomeMulti(1, 2, 1)).toBe("partial");
		});

		it("returns partial for some correct, no wrong", () => {
			expect(outcomeMulti(1, 2, 0)).toBe("partial");
		});

		it("returns wrong for no correct answers", () => {
			expect(outcomeMulti(0, 2, 2)).toBe("wrong");
		});
	});

	describe("singleCorrectnessFactor", () => {
		it("returns 1.0 for correct answer", () => {
			expect(singleCorrectnessFactor(true)).toBe(1.0);
		});

		it("returns 0.0 for incorrect answer", () => {
			expect(singleCorrectnessFactor(false)).toBe(0.0);
		});
	});

	describe("multiCorrectnessFactor", () => {
		it("gives full score for perfect answer", () => {
			const result = multiCorrectnessFactor(2, 2, 0);
			expect(result).toBe(1.0);
		});

		it("gives partial credit for mixed correct/wrong", () => {
			// 1 correct out of 2, with 1 wrong = should get partial credit
			const result = multiCorrectnessFactor(1, 2, 1);
			expect(result).toBe(0.625); // 0.5 + 0.5 * 0.25 = 0.625
		});

		it("gives partial credit for incomplete correct answers", () => {
			// 1 correct out of 2, with 0 wrong = half credit
			const result = multiCorrectnessFactor(1, 2, 0);
			expect(result).toBe(0.75); // 0.5 + 0.5 * 0.5 = 0.75
		});

		it("gives zero for no correct answers", () => {
			const result = multiCorrectnessFactor(0, 2, 2);
			expect(result).toBe(0.0);
		});

		it("gives zero when penalties exceed correct score", () => {
			// 1 correct, but 4 wrong answers should zero out the score
			const result = multiCorrectnessFactor(1, 2, 4);
			expect(result).toBe(0.0);
		});
	});

	describe("calculateXP", () => {
		it("calculates XP based on correctness factor", () => {
			expect(calculateXP(1.0, 10)).toBe(10);
			expect(calculateXP(0.5, 10)).toBe(5);
			expect(calculateXP(0.0, 10)).toBe(0);
		});

		it("rounds XP to nearest integer", () => {
			expect(calculateXP(0.625, 10)).toBe(6); // 6.25 -> 6
			expect(calculateXP(0.75, 10)).toBe(8);   // 7.5 -> 8
		});
	});
});