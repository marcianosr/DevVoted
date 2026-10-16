import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { AccuracyTrack, type AccuracyTrackProps } from "./AccuracyTrack.ui";
import { allStyles } from "~/test/styles.harness";

const appCss = allStyles();

const MID_GATE: AccuracyTrackProps = {
	label: "Accuracy ×1.13, this gate up to ×1.18",
	figure: "×1.13",
	bonus: 0.52,
	cap: 0.72,
	ticks: [
		{ share: 0, label: "×1.00" },
		{ share: 0.2, label: "×1.05" },
		{ share: 0.4, label: "×1.10" },
		{ share: 0.6, label: "×1.15" },
		{ share: 0.8, label: "×1.20" },
		{ share: 1 },
	],
};

const partOf = (container: HTMLElement, part: string) =>
	container.querySelector<HTMLElement>(`[data-part="${part}"]`);

describe("AccuracyTrack", () => {
	it("fills the bar to the live bonus", () => {
		const { container } = render(<AccuracyTrack {...MID_GATE} />);

		expect(partOf(container, "bonus")).toHaveStyle({ width: "52%" });
	});

	it("hatches the stretch from the bonus up to the gate's cap", () => {
		const { container } = render(<AccuracyTrack {...MID_GATE} />);
		const cap = partOf(container, "cap");

		expect(cap).toHaveStyle({ left: "52%", width: "20%" });
	});

	it("marks the gate's cap with a line across the bar and dims the track past it", () => {
		const { container } = render(<AccuracyTrack {...MID_GATE} />);

		expect(partOf(container, "limit")).toHaveStyle({ left: "72%" });
		expect(partOf(container, "beyond")).toHaveStyle({ left: "72%" });
	});

	it("still marks the cap once the bonus has met it", () => {
		const { container } = render(
			<AccuracyTrack {...MID_GATE} bonus={0.72} cap={0.72} />
		);

		expect(partOf(container, "limit")).toHaveStyle({ left: "72%" });
	});

	it("draws no hatch once the bonus has met the cap", () => {
		const { container } = render(
			<AccuracyTrack {...MID_GATE} bonus={0.72} cap={0.72} />
		);

		expect(partOf(container, "cap")).toBeNull();
	});

	it("keeps every part inside the bar", () => {
		const { container } = render(
			<AccuracyTrack {...MID_GATE} bonus={-0.2} cap={1.4} />
		);

		expect(partOf(container, "bonus")).toHaveStyle({ width: "0%" });
		expect(partOf(container, "cap")).toHaveStyle({ width: "100%" });
	});

	it("labels the ticks under the bar", () => {
		render(<AccuracyTrack {...MID_GATE} />);

		["×1.00", "×1.05", "×1.10", "×1.15", "×1.20"].forEach((label) =>
			expect(screen.getByText(label)).toBeInTheDocument()
		);
	});

	it("pins the live figure above the end of the fill", () => {
		const { container } = render(<AccuracyTrack {...MID_GATE} />);

		expect(screen.getByText("×1.13")).toHaveClass("badge-theme");
		expect(partOf(container, "marker")).toHaveStyle({ left: "52%" });
	});

	it("reads the bonus and the cap aloud through its label", () => {
		render(<AccuracyTrack {...MID_GATE} />);

		expect(
			screen.getByRole("img", { name: "Accuracy ×1.13, this gate up to ×1.18" })
		).toBeInTheDocument();
	});

	it("pulses the bar only when told to", () => {
		const { container, rerender } = render(<AccuracyTrack {...MID_GATE} />);

		expect(container.querySelector(".accuracy-pulse")).toBeNull();

		rerender(<AccuracyTrack {...MID_GATE} pulse={{ key: "poll-2" }} />);

		expect(container.querySelector(".accuracy-pulse")).not.toBeNull();
	});

	it("replays the pulse for the next right answer", () => {
		const { container, rerender } = render(
			<AccuracyTrack {...MID_GATE} pulse={{ key: "one" }} />
		);
		const first = container.querySelector(".accuracy-pulse");

		rerender(<AccuracyTrack {...MID_GATE} pulse={{ key: "two" }} />);

		expect(container.querySelector(".accuracy-pulse")).not.toBe(first);
	});

	it("pulses through a keyframe the stylesheet declares, and not for reduced motion", () => {
		expect(appCss).toContain("@keyframes accuracy-pulse");
		expect(appCss).toMatch(
			/prefers-reduced-motion: reduce\) \{[^}]*\.accuracy-pulse[^}]*animation: none;/
		);
	});
});
