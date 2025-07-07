import { describe, it, expect } from "vitest";
import { calculateMultipleChoiceXP } from "./xpSystem";

describe("calculateMultipleChoiceXP", () => {
	it("awards full XP for all correct answers", () => {
		// 3 correct, 0 wrong, 3 total
		const result = calculateMultipleChoiceXP(3, 3, 0);
		expect(result).toBe(5); // 5 * (3/3) - 2 * 0 = 5
	});

	it("awards partial XP for mixed answers", () => {
		// 2 correct, 1 wrong, 3 total
		const result = calculateMultipleChoiceXP(2, 3, 1);
		expect(result).toBe(1.33); // 5 * (2/3) - 2 * 1 = 3.33 - 2 = 1.33
	});

	it("awards zero XP when penalty exceeds reward", () => {
		// 1 correct, 2 wrong, 3 total
		const result = calculateMultipleChoiceXP(1, 3, 2);
		expect(result).toBe(0); // 5 * (1/3) - 2 * 2 = 1.67 - 4 = -2.33, clamped to 0
	});

	it("awards zero XP for all wrong answers", () => {
		// 0 correct, 3 wrong, 3 total
		const result = calculateMultipleChoiceXP(0, 3, 3);
		expect(result).toBe(0); // 5 * (0/3) - 2 * 3 = 0 - 6 = -6, clamped to 0
	});

	it("handles single selection correctly", () => {
		// 1 correct, 0 wrong, 1 total
		const result = calculateMultipleChoiceXP(1, 1, 0);
		expect(result).toBe(5); // 5 * (1/1) - 2 * 0 = 5
	});

	it("handles partial selection of multiple correct answers", () => {
		// 1 correct selected out of 2 total correct answers, 0 wrong
		const result = calculateMultipleChoiceXP(1, 2, 0);
		expect(result).toBe(2.5); // 5 * (1/2) - 2 * 0 = 2.5
	});

	it("handles edge case with zero total selections", () => {
		// 0 correct, 0 wrong, 0 total
		const result = calculateMultipleChoiceXP(0, 0, 0);
		expect(result).toBe(0); // 5 * (0/0) - 2 * 0 = NaN, should be handled
	});
});