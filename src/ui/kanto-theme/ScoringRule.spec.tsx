import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { SCORING } from "~/test/kantoPoll.factory";

import { ScoringRule } from "./ScoringRule.ui";

const [QUARTER, HALF, THREE_QUARTERS] = SCORING.partialRungs;
const MISS = 0;

const badges = () => screen.getAllByText(/^\d+(\.\d+)?$/);

const figures = () => badges().map((badge) => Number(badge.textContent));

const distinct = () => [...new Set(figures())].sort((a, b) => a - b);

const badgeFor = (figure: string) =>
	badges().filter((badge) => badge.textContent === figure);

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

	it("opens both ladders on a miss, so nothing is worth guessing at", () => {
		render(<ScoringRule />);

		expect(distinct()[0]).toBe(MISS);
		expect(badgeFor(String(MISS))).toHaveLength(2);
	});

	it("draws every rung an answer can land on and none it cannot", () => {
		render(<ScoringRule />);

		expect(distinct()).toEqual([
			MISS,
			QUARTER * SCORING.multiple,
			HALF * SCORING.multiple,
			THREE_QUARTERS * SCORING.multiple,
			SCORING.multiple,
		]);
	});

	it("never offers a part the full credit, which only an exact set earns", () => {
		render(<ScoringRule />);

		expect(THREE_QUARTERS * SCORING.multiple).toBeLessThan(SCORING.multiple);
	});

	it("greens what an answer pays in full, reddens what a miss pays", () => {
		render(<ScoringRule />);

		const [single] = badgeFor(String(SCORING.single));
		const [exact] = badgeFor(String(SCORING.multiple));
		const [miss] = badgeFor(String(MISS));

		expect(single).toHaveAttribute("data-screen-theme", "viridian");
		expect(exact).toHaveAttribute("data-screen-theme", "viridian");
		expect(miss).toHaveAttribute("data-screen-theme", "cinnabar");
	});

	it("ambers a part, because it is worth something short of the answer", () => {
		render(<ScoringRule />);

		const [part] = badgeFor(String(QUARTER * SCORING.multiple));

		expect(part).toHaveAttribute("data-screen-theme", "saffron");
	});

	it("names itself for the panel it explains", () => {
		render(<ScoringRule />);

		expect(screen.getByText("Score info")).toBeInTheDocument();
	});

	it("stacks each case into a column until there is room for a row", () => {
		const { container } = render(<ScoringRule />);

		const row = screen.getByText("single answer").parentElement?.parentElement;

		expect(row).toHaveClass("flex-col", "sm:flex-row");
		expect(container.querySelector(".ml-auto")).toBeNull();
	});

	it("nests nothing but spans, so it can sit inside a tooltip", () => {
		const { container } = render(<ScoringRule />);

		expect(container.querySelectorAll("div, p")).toHaveLength(0);
	});
});
