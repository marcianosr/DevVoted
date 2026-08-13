import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Meter, percentOfCap } from "~/ui/Meter.ui";

const widthsOf = (container: HTMLElement): string[] =>
	[...container.querySelectorAll<HTMLElement>("span > span")].map(
		(fill) => fill.style.width
	);

describe(percentOfCap, () => {
	it("reads a value as its share of the cap", () => {
		expect(percentOfCap(32, 128)).toBe(25);
	});

	it("clamps a value that overshot the cap, so a fill never leaves its track", () => {
		expect(percentOfCap(200, 128)).toBe(100);
	});

	it("clamps a negative value rather than filling backwards", () => {
		expect(percentOfCap(-10, 128)).toBe(0);
	});

	it("reads an absent cap as empty instead of dividing by zero", () => {
		expect(percentOfCap(32, 0)).toBe(0);
		expect(percentOfCap(32, -5)).toBe(0);
	});
});

describe(Meter, () => {
	it("sizes each segment against the cap, in order", () => {
		const { container } = render(
			<Meter
				cap={100}
				segments={[
					{ value: 20, className: "bg-zinc-500" },
					{ value: 30, className: "bg-viridian" },
				]}
			/>
		);
		expect(widthsOf(container)).toEqual(["20%", "30%"]);
	});

	it("carries each segment's own fill class", () => {
		const { container } = render(
			<Meter cap={100} segments={[{ value: 50, className: "bg-saffron" }]} />
		);
		expect(container.querySelector("span > span")).toHaveClass("bg-saffron");
	});

	it("reports itself as a progressbar once it is given a name", () => {
		render(
			<Meter
				cap={512}
				label="storage used"
				segments={[{ value: 128, className: "bg-zinc-400" }]}
			/>
		);
		const track = screen.getByRole("progressbar", { name: "storage used" });
		expect(track).toHaveAttribute("aria-valuenow", "128");
		expect(track).toHaveAttribute("aria-valuemax", "512");
	});

	it("sums the segments when no explicit value is reported", () => {
		render(
			<Meter
				cap={100}
				label="coverage"
				segments={[
					{ value: 20, className: "bg-zinc-500" },
					{ value: 30, className: "bg-viridian" },
				]}
			/>
		);
		expect(screen.getByRole("progressbar")).toHaveAttribute(
			"aria-valuenow",
			"50"
		);
	});

	it("prefers the reported value over the sum, for a two-segment gain", () => {
		// GainBar draws held + gain but reports the total it climbed to.
		render(
			<Meter
				cap={100}
				label="storage"
				value={50}
				segments={[
					{ value: 20, className: "bg-zinc-500" },
					{ value: 30, className: "bg-viridian" },
				]}
			/>
		);
		expect(screen.getByRole("progressbar")).toHaveAttribute(
			"aria-valuenow",
			"50"
		);
	});

	it("stays a plain track when it has no name to announce", () => {
		render(
			<Meter cap={100} segments={[{ value: 50, className: "bg-white" }]} />
		);
		expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
	});

	it("keeps a segment inside the track when the value overshoots the cap", () => {
		const { container } = render(
			<Meter cap={100} segments={[{ value: 250, className: "bg-saffron" }]} />
		);
		expect(widthsOf(container)).toEqual(["100%"]);
	});
});
