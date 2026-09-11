import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { gateRoster, gateSwatchAt, trackTo } from "~/test/swatchTrack.factory";

import { Swatch } from "./Swatch.ui";
import { SwatchTrack } from "./SwatchTrack.ui";

const appCss = readFileSync("src/styles/app.css", "utf8");

const PALLET = gateSwatchAt(0);
const ELITE = gateSwatchAt(11);
const CHAMPION = gateSwatchAt(12);

const swatchesIn = (container: HTMLElement) =>
	Array.from(container.querySelectorAll("span"));

const FLAT_SWATCHES = gateRoster
	.filter((swatch) => swatch.finish === "flat")
	.map((swatch) => [swatch.gateName, swatch] as const);

describe("Swatch", () => {
	it.each(FLAT_SWATCHES)(
		"paints a discovered %s in its gate's colour",
		(_, swatch) => {
			const { container } = render(
				<Swatch state="discovered" swatch={swatch} />
			);

			expect(container.firstChild).toHaveAttribute(
				"data-swatch-theme",
				swatch.theme
			);
			expect(container.firstChild).toHaveClass("bg-theme");
		}
	);

	it("withholds the theme attribute while undiscovered", () => {
		const { container } = render(<Swatch state="undiscovered" />);

		expect(container.firstChild).not.toHaveAttribute("data-swatch-theme");
		expect(container.firstChild).toHaveClass("bg-theme-raised");
	});

	it("sits above the screen ground rather than level with it", () => {
		const { container } = render(<Swatch state="undiscovered" />);

		expect(container.firstChild).not.toHaveClass("bg-theme-faint");
	});

	it("dashes the current swatch instead of filling it", () => {
		const { container } = render(<Swatch state="current" swatch={PALLET} />);

		expect(container.firstChild).toHaveClass(
			"border-2",
			"border-dashed",
			"border-theme"
		);
		expect(container.firstChild).not.toHaveClass("bg-theme");
	});

	it("rings the Elite plate so indigo reads against the page", () => {
		const { container } = render(<Swatch state="discovered" swatch={ELITE} />);

		expect(container.firstChild).toHaveAttribute("data-swatch-theme", "elite");
		expect(container.firstChild).toHaveClass(
			"bg-theme",
			"ring-1",
			"ring-pewter"
		);
	});

	it("gives the Champion the gradient and no theme colour at all", () => {
		const { container } = render(
			<Swatch state="discovered" swatch={CHAMPION} />
		);

		expect(container.firstChild).toHaveClass("bg-legendary");
		expect(container.firstChild).not.toHaveAttribute("data-swatch-theme");
		expect(container.firstChild).not.toHaveClass("bg-theme");
	});

	it("turns the Champion's gradient into a ring while it is the current gate", () => {
		const { container } = render(<Swatch state="current" swatch={CHAMPION} />);

		expect(container.firstChild).toHaveClass("legendary-ring");
		expect(container.firstChild).not.toHaveClass(
			"bg-legendary",
			"border-theme"
		);
	});

	it("resolves its gradient and withheld fill to utilities app.css declares", () => {
		expect(appCss).toContain("@utility bg-theme-raised");
		expect(appCss).toContain("@utility bg-legendary");
	});

	it.each([
		["large", "rounded-md"],
		["small", "rounded-xs"],
	] as const)("gives every %s swatch the same %s corners", (size, radius) => {
		const { container } = render(
			<SwatchTrack swatches={trackTo(2)} size={size} />
		);

		for (const swatch of swatchesIn(container)) {
			expect(swatch).toHaveClass(radius);
		}
	});

	it("sizes large by default, the strip's own scale", () => {
		const { container } = render(<Swatch state="undiscovered" />);

		expect(container.firstChild).toHaveClass("size-7");
	});

	it("drops to the pip scale when asked for small", () => {
		const { container } = render(<Swatch state="undiscovered" size="small" />);

		expect(container.firstChild).toHaveClass("size-3.5");
		expect(container.firstChild).not.toHaveClass("size-7");
	});
});

describe("SwatchTrack", () => {
	it("renders one swatch per gate, in climb order", () => {
		const { container } = render(<SwatchTrack swatches={trackTo(3)} />);

		expect(swatchesIn(container)).toHaveLength(gateRoster.length);
		expect(swatchesIn(container)[0]).toHaveAttribute(
			"data-swatch-theme",
			gateRoster[0]?.theme ?? ""
		);
	});

	it("counts the discovered swatches for a screen reader, current included", () => {
		render(<SwatchTrack swatches={trackTo(9)} />);

		expect(
			screen.getByRole("img", {
				name: `10 of ${gateRoster.length} swatches discovered`,
			})
		).toBeInTheDocument();
	});

	it("reports nothing discovered when the run has not started", () => {
		render(<SwatchTrack swatches={trackTo(0)} />);

		expect(
			screen.getByRole("img", {
				name: `1 of ${gateRoster.length} swatches discovered`,
			})
		).toBeInTheDocument();
	});

	it("hands its size down to every swatch", () => {
		const { container } = render(
			<SwatchTrack swatches={trackTo(4)} size="small" />
		);

		for (const swatch of swatchesIn(container)) {
			expect(swatch).toHaveClass("size-3.5");
		}
	});

	it("tightens the gap at the small size", () => {
		const { container } = render(
			<SwatchTrack swatches={trackTo(4)} size="small" />
		);

		expect(container.firstChild).toHaveClass("gap-1");
		expect(container.firstChild).not.toHaveClass("gap-1.5");
	});
});
