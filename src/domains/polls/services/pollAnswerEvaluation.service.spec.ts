import { describe, it, expect } from "vitest";

import { evaluatePollAnswer } from "./pollAnswerEvaluation.service";

describe("evaluatePollAnswer", () => {
	describe("single-choice degenerate (totalCorrect = 1)", () => {
		it("returns full when the one correct option is picked", () => {
			expect(
				evaluatePollAnswer({
					selectedCorrect: 1,
					selectedIncorrect: 0,
					totalCorrect: 1,
				})
			).toEqual({ outcome: "full", isFullyCorrect: true });
		});

		it("returns wrong when an incorrect option is picked instead", () => {
			expect(
				evaluatePollAnswer({
					selectedCorrect: 0,
					selectedIncorrect: 1,
					totalCorrect: 1,
				})
			).toEqual({ outcome: "wrong", isFullyCorrect: false });
		});
	});

	describe("multi-choice", () => {
		it("returns full when all correct options picked and no wrong picks (Banjo's full move set)", () => {
			expect(
				evaluatePollAnswer({
					selectedCorrect: 3,
					selectedIncorrect: 0,
					totalCorrect: 3,
				})
			).toEqual({ outcome: "full", isFullyCorrect: true });
		});

		it("returns partial when some correct picked and no wrong picks", () => {
			expect(
				evaluatePollAnswer({
					selectedCorrect: 1,
					selectedIncorrect: 0,
					totalCorrect: 3,
				})
			).toEqual({ outcome: "partial", isFullyCorrect: false });
		});

		it("returns partial when all correct picked but with wrong picks", () => {
			expect(
				evaluatePollAnswer({
					selectedCorrect: 3,
					selectedIncorrect: 2,
					totalCorrect: 3,
				})
			).toEqual({ outcome: "partial", isFullyCorrect: false });
		});

		it("returns partial when some correct and some wrong picks", () => {
			expect(
				evaluatePollAnswer({
					selectedCorrect: 1,
					selectedIncorrect: 2,
					totalCorrect: 3,
				})
			).toEqual({ outcome: "partial", isFullyCorrect: false });
		});

		it("returns wrong when zero correct picked even if user picked many options", () => {
			expect(
				evaluatePollAnswer({
					selectedCorrect: 0,
					selectedIncorrect: 4,
					totalCorrect: 3,
				})
			).toEqual({ outcome: "wrong", isFullyCorrect: false });
		});
	});

	describe("edge cases", () => {
		it("returns wrong when poll has no correct options (data error)", () => {
			expect(
				evaluatePollAnswer({
					selectedCorrect: 0,
					selectedIncorrect: 0,
					totalCorrect: 0,
				})
			).toEqual({ outcome: "wrong", isFullyCorrect: false });
		});

		it("returns wrong when user selected nothing", () => {
			expect(
				evaluatePollAnswer({
					selectedCorrect: 0,
					selectedIncorrect: 0,
					totalCorrect: 2,
				})
			).toEqual({ outcome: "wrong", isFullyCorrect: false });
		});
	});
});
