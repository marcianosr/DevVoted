import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { CoverageRing } from "./CoverageRing.ui";

const appCss = readFileSync("src/styles/app.css", "utf8");

const TITLE = "Coverage toward Volcano";
const NOTE = "Pick an answer to see where it puts you.";

const arcOf = (container: HTMLElement) =>
	container.querySelector(".coverage-arc");

const countOf = (container: HTMLElement) =>
	container.querySelector(".coverage-count");

const offsetOf = (container: HTMLElement) =>
	Number(
		arcOf(container)
			?.getAttribute("style")
			?.match(/stroke-dashoffset:\s*([\d.]+)/)?.[1]
	);

const tickOf = (container: HTMLElement) => container.querySelector("line");

describe("CoverageRing", () => {
	it("draws the bare dial when nothing is given to caption it", () => {
		render(<CoverageRing held={148} demand={210} />);

		expect(
			screen.getByRole("img", { name: /148% of 210% needed/ })
		).toBeInTheDocument();
		expect(screen.queryByText(/Coverage toward/)).not.toBeInTheDocument();
	});

	it("keeps its note when only the title is withheld", () => {
		render(<CoverageRing held={148} demand={210} note="Pick an answer." />);

		expect(screen.getByText("Pick an answer.")).toBeInTheDocument();
	});

	it("sweeps the arc to the share of the demand the run holds", () => {
		const { container } = render(
			<CoverageRing held={148} demand={210} title={TITLE} />
		);

		expect(offsetOf(container)).toBeCloseTo(100 - (148 / 210) * 100, 5);
	});

	it("renormalises the circle to 100, so the offset is literally percent", () => {
		const { container } = render(
			<CoverageRing held={148} demand={210} title={TITLE} />
		);

		expect(arcOf(container)).toHaveAttribute("pathLength", "100");
		expect(arcOf(container)).toHaveAttribute("stroke-dasharray", "100");
	});

	it("leaves the arc empty at nothing held", () => {
		const { container } = render(
			<CoverageRing held={0} demand={210} title={TITLE} />
		);

		expect(offsetOf(container)).toBe(100);
	});

	it("draws an empty track rather than dividing by a demand of zero", () => {
		const { container } = render(
			<CoverageRing held={0} demand={0} title={TITLE} />
		);

		expect(offsetOf(container)).toBe(100);
	});

	it("hands the digits the whole part, which is what the count animates", () => {
		const { container } = render(
			<CoverageRing held={148} demand={210} title={TITLE} />
		);

		expect(countOf(container)).toHaveStyle({ "--coverage-count": "148" });
	});

	it("keeps a fractional reading exact, tenth beside the counting whole", () => {
		const { container } = render(
			<CoverageRing held={1.2} demand={3} title={TITLE} />
		);

		expect(countOf(container)).toHaveStyle({ "--coverage-count": "1" });
		expect(container.textContent).toContain(".2");
	});

	it("shows no trailing tenth on a whole reading", () => {
		const { container } = render(
			<CoverageRing held={148} demand={210} title={TITLE} />
		);

		expect(container.textContent).not.toContain(".");
	});

	it("names the reading for a screen reader, since the digits are drawn by CSS", () => {
		render(<CoverageRing held={1.2} demand={3} title={TITLE} />);

		expect(
			screen.getByRole("img", { name: "1.2% of 3% needed" })
		).toBeInTheDocument();
	});

	it("states the demand under the figure", () => {
		render(<CoverageRing held={148} demand={210} title={TITLE} />);

		expect(screen.getByText("of 210%")).toBeInTheDocument();
	});

	describe("past the demand", () => {
		it("rescales so the sweep means the run's own total, not the bar", () => {
			const { container } = render(
				<CoverageRing held={260} demand={210} title={TITLE} />
			);

			expect(offsetOf(container)).toBe(0);
		});

		it("marks where the demand fell, so overshooting cannot read as meeting it", () => {
			const { container } = render(
				<CoverageRing held={260} demand={210} title={TITLE} />
			);

			expect(tickOf(container)).not.toBeNull();
		});

		it("draws no mark while the run is still short of the demand", () => {
			const { container } = render(
				<CoverageRing held={148} demand={210} title={TITLE} />
			);

			expect(tickOf(container)).toBeNull();
		});

		it("puts the mark a quarter turn round when the run quadruples the demand", () => {
			const { container } = render(
				<CoverageRing held={210} demand={52.5} title={TITLE} />
			);

			expect(tickOf(container)).toHaveAttribute("x1", "50");
			expect(Number(tickOf(container)?.getAttribute("y1"))).toBeGreaterThan(50);
		});

		it("spans the mark across the stroke, inner edge out to the rim", () => {
			const { container } = render(
				<CoverageRing held={210} demand={52.5} title={TITLE} />
			);

			const tick = tickOf(container);
			expect(Number(tick?.getAttribute("y2"))).toBeGreaterThan(
				Number(tick?.getAttribute("y1"))
			);
		});
	});

	it("wears the screen's colour rather than carrying a green of its own", () => {
		const { container } = render(
			<CoverageRing held={148} demand={210} title={TITLE} />
		);

		expect(arcOf(container)).toHaveClass("stroke-theme");
		expect(container.querySelector("[data-screen-theme]")).toBeNull();
	});

	it("reads its title, and its note only when one is given", () => {
		const { rerender } = render(
			<CoverageRing held={148} demand={210} title={TITLE} />
		);

		expect(screen.getByText(TITLE)).toBeInTheDocument();
		expect(screen.queryByText(NOTE)).not.toBeInTheDocument();

		rerender(
			<CoverageRing held={148} demand={210} title={TITLE} note={NOTE} />
		);

		expect(screen.getByText(NOTE)).toBeInTheDocument();
	});

	it("resolves its arc and count to animations app.css declares", () => {
		expect(appCss).toContain("@property --coverage-count");
		expect(appCss).toContain(".coverage-arc {");
		expect(appCss).toContain(".coverage-count {");
	});

	it("runs both halves off one duration, so the digits cannot land early", () => {
		const durations = appCss.match(/var\(--coverage-duration\)/g);

		expect(durations).toHaveLength(2);
	});

	it("counts on arrival as well as on change", () => {
		const starting = appCss.slice(appCss.indexOf("@starting-style {"));

		expect(starting).toContain(".coverage-arc");
		expect(starting).toContain(".coverage-count");
	});

	it("stops both halves for a player who asked for less motion", () => {
		const guards = appCss.match(
			/@media \(prefers-reduced-motion: reduce\) \{[^}]*\}[^}]*\}/g
		);
		const ours = guards?.find((guard) => guard.includes(".coverage-arc"));

		expect(ours).toContain(".coverage-count");
		expect(ours).toContain("transition: none;");
	});
});
