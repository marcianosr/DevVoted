import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { SCORING } from "~/test/kantoPoll.factory";

import { ScoringRule } from "./ScoringRule.ui";

const [QUARTER, HALF, THREE_QUARTERS] = SCORING.partialRungs;

const figures = () =>
	screen
		.getAllByText(/^\d+(\.\d+)?$/)
		.map((badge) => Number(badge.textContent));

describe("ScoringRule", () => {
	it("prices each answer type at the credit the engine pays it", () => {
		render(<ScoringRule />);

		expect(figures()).toContain(SCORING.single);
		expect(figures()).toContain(SCORING.multiple);
	});

	it("states the whole partial ladder, not a sample of it", () => {
		render(<ScoringRule />);

		for (const share of [QUARTER, HALF, THREE_QUARTERS]) {
			expect(figures()).toContain(share * SCORING.multiple);
		}
	});

	it("shows the quarter rung, the cheapest a part can pay", () => {
		render(<ScoringRule />);

		expect(Math.min(...figures())).toBe(QUARTER * SCORING.multiple);
	});

	it("never offers a part the full credit, which only an exact set earns", () => {
		render(<ScoringRule />);

		expect(THREE_QUARTERS * SCORING.multiple).toBeLessThan(SCORING.multiple);
	});

	it("says a cancelled-out answer is a miss rather than a part", () => {
		render(<ScoringRule />);

		expect(screen.getByText(/is a miss, not a part/)).toBeInTheDocument();
	});

	it("says a part moves coverage but not the correct tally the swatch reads", () => {
		render(<ScoringRule />);

		expect(
			screen.getByText(/never counts toward the correct tally/)
		).toBeInTheDocument();
	});
});
