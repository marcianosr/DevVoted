import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { AccuracyTrack, type AccuracyTrackProps } from "./AccuracyTrack.ui";

const appCss = readFileSync("src/styles/app.css", "utf8");

const TWO_RIGHT: AccuracyTrackProps = {
	label: "Accuracy ×1.19, up to ×2",
	figure: "×1.19",
	ceiling: "up to ×2",
	sure: 0.19,
	best: 1,
};

const fillOf = (container: HTMLElement, fill: string) =>
	container.querySelector(`[data-fill="${fill}"]`);

describe("AccuracyTrack", () => {
	it("draws one bar, filled to the sure multiplier over the best case", () => {
		const { container } = render(<AccuracyTrack {...TWO_RIGHT} />);

		expect(fillOf(container, "sure")).toHaveStyle({ width: "19%" });
		expect(fillOf(container, "best")).toHaveStyle({ width: "100%" });
	});

	it("draws no segment per poll", () => {
		const { container } = render(<AccuracyTrack {...TWO_RIGHT} />);

		expect(container.querySelectorAll("[data-segment]")).toHaveLength(0);
	});

	it("keeps both fills inside the bar", () => {
		const { container } = render(
			<AccuracyTrack {...TWO_RIGHT} sure={-0.2} best={1.4} />
		);

		expect(fillOf(container, "sure")).toHaveStyle({ width: "0%" });
		expect(fillOf(container, "best")).toHaveStyle({ width: "100%" });
	});

	it("states the sure multiplier beside the bar", () => {
		render(<AccuracyTrack {...TWO_RIGHT} />);

		expect(screen.getByText("×1.19")).toHaveClass("badge-theme");
	});

	it("writes the ceiling on its own line below the bar", () => {
		const { container } = render(<AccuracyTrack {...TWO_RIGHT} />);
		const bar = fillOf(container, "best")?.parentElement;
		const ceiling = screen.getByText("up to ×2");
		if (!bar) throw new Error("no accuracy bar");

		expect(bar.contains(ceiling)).toBe(false);
		expect(
			bar.compareDocumentPosition(ceiling) & Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
	});

	it("writes no ceiling when the best is already sure", () => {
		render(<AccuracyTrack {...TWO_RIGHT} ceiling={undefined} />);

		expect(screen.queryByText(/up to/)).toBeNull();
	});

	it("reads the multiplier aloud through its label", () => {
		render(<AccuracyTrack {...TWO_RIGHT} />);

		expect(
			screen.getByRole("img", { name: "Accuracy ×1.19, up to ×2" })
		).toBeInTheDocument();
	});

	it("pulses the bar only when told to", () => {
		const { container, rerender } = render(<AccuracyTrack {...TWO_RIGHT} />);

		expect(container.querySelector(".accuracy-pulse")).toBeNull();

		rerender(<AccuracyTrack {...TWO_RIGHT} pulse={{ key: "poll-2" }} />);

		expect(container.querySelector(".accuracy-pulse")).not.toBeNull();
	});

	it("replays the pulse for the next right answer", () => {
		const { container, rerender } = render(
			<AccuracyTrack {...TWO_RIGHT} pulse={{ key: "one" }} />
		);
		const first = container.querySelector(".accuracy-pulse");

		rerender(<AccuracyTrack {...TWO_RIGHT} pulse={{ key: "two" }} />);

		expect(container.querySelector(".accuracy-pulse")).not.toBe(first);
	});

	it("pulses through a keyframe app.css declares, and not for reduced motion", () => {
		expect(appCss).toContain("@keyframes accuracy-pulse");
		expect(appCss).toMatch(
			/prefers-reduced-motion: reduce\) \{[^}]*\.accuracy-pulse[^}]*animation: none;/
		);
	});
});
