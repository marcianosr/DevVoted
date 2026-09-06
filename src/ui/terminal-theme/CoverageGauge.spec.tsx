import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import { CoverageGauge } from "./CoverageGauge.ui";

const segmentsFor = (props: Parameters<typeof CoverageGauge>[0]) => {
	const { container } = render(<CoverageGauge {...props} />);
	const track = within(container).getByRole("img");
	return Array.from(track.children).map((segment) => ({
		className: segment.className,
		height: segment.getAttribute("style"),
	}));
};

describe("the coverage gauge", () => {
	it("sizes the held fill against the demand, not against itself", () => {
		const [held] = segmentsFor({ held: 4.1, demand: 10 });
		expect(held?.className).toContain("bg-theme");
		expect(held?.height).toContain("41%");
	});

	it("draws no ghost until an answer is on the table", () => {
		expect(segmentsFor({ held: 4.1, demand: 10 })).toHaveLength(1);
		expect(segmentsFor({ held: 4.1, demand: 10, pending: 2 })).toHaveLength(2);
	});

	it("stacks the ghost above the fill so the two read as one climb", () => {
		const [ghost, held] = segmentsFor({ held: 4.1, demand: 10, pending: 2 });
		expect(ghost?.className).toContain("border-dashed");
		expect(ghost?.height).toContain("20%");
		expect(held?.className).toContain("bg-theme");
	});

	it("opens the track past the demand rather than clipping the offer", () => {
		const [ghost, standing] = segmentsFor({
			held: 8.4,
			demand: 10,
			pending: 4.2,
		});
		expect(ghost?.height).toContain("33.33%");
		expect(standing?.height).toContain("66.67%");
	});

	it("marks where the demand fell once the run climbs past it", () => {
		const drawn = segmentsFor({ held: 5.3, demand: 3 });
		const mark = drawn.find((segment) => segment.className.includes("h-0.5"));

		expect(mark?.height).toContain("bottom: 56.6%");
		expect(drawn[0]?.height).toContain("height: 100%");
	});

	it("leaves the demand unmarked while the run is still short of it", () => {
		const drawn = segmentsFor({ held: 4.1, demand: 10 });

		expect(drawn.some((segment) => segment.className.includes("h-0.5"))).toBe(
			false
		);
	});

	it("survives a gate that demands nothing", () => {
		const [held] = segmentsFor({ held: 4.1, demand: 0 });
		expect(held?.height).toContain("0%");
	});

	it("grows what the answer earned off the top of the standing fill", () => {
		const [earned, standing] = segmentsFor({
			held: 6.1,
			demand: 10,
			earned: 2,
		});
		expect(earned?.className).toContain("gauge-earned");
		expect(earned?.height).toContain("20%");
		expect(standing?.height).toContain("41%");
	});

	it("drains what a miss cost from above the fill it left behind", () => {
		const [lost, standing] = segmentsFor({ held: 4.1, demand: 10, earned: -2 });
		expect(lost?.className).toContain("gauge-lost");
		expect(lost?.height).toContain("20%");
		expect(standing?.height).toContain("41%");
	});

	it("reads the standing and the offer out loud", () => {
		render(<CoverageGauge held={4.1} demand={10} pending={2} />);
		expect(
			screen.getByLabelText("4.1% of 10% needed, a correct answer adds 2%")
		).toBeInTheDocument();
	});
});
