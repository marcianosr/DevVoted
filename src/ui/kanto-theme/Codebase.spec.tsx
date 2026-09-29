import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { gateSwatchAt } from "~/test/swatchTrack.factory";

import { Codebase, type CodebaseGate } from "./Codebase.ui";

const PALLET = 0;
const BOULDER = 1;
const CASCADE = 2;
const CHAMPION = 12;

const GATES: readonly CodebaseGate[] = [
	{ swatch: gateSwatchAt(PALLET), covered: 5, slots: 5 },
	{ swatch: gateSwatchAt(BOULDER), covered: 3, slots: 5 },
	{ swatch: gateSwatchAt(CASCADE), covered: 0, slots: 5, current: true },
];

const LABEL = "8 of 15 slots covered";

const squaresOf = (container: HTMLElement) =>
	[...container.querySelectorAll("[role='img'] > span")].flatMap((group) => [
		...group.children,
	]);

describe("Codebase", () => {
	it("draws one square per slot the run has opened", () => {
		const { container } = render(<Codebase gates={GATES} label={LABEL} />);

		expect(squaresOf(container)).toHaveLength(15);
	});

	it("reads as one picture with the units over the slots", () => {
		render(<Codebase gates={GATES} label={LABEL} />);

		expect(screen.getByRole("img", { name: LABEL })).toBeInTheDocument();
	});

	it("fills a covered square in the colour of the gate that opened it", () => {
		const { container } = render(<Codebase gates={GATES} label={LABEL} />);

		const [first, , , , , sixth] = squaresOf(container);

		expect(first).toHaveAttribute(
			"data-swatch-theme",
			gateSwatchAt(PALLET).theme
		);
		expect(first).toHaveClass("bg-theme");
		expect(sixth).toHaveAttribute(
			"data-swatch-theme",
			gateSwatchAt(BOULDER).theme
		);
	});

	it("leaves an opened slot nobody covered as a plain block, in no gate's colour", () => {
		const { container } = render(<Codebase gates={GATES} label={LABEL} />);

		const ninth = squaresOf(container)[8];

		expect(ninth).not.toHaveAttribute("data-swatch-theme");
		expect(ninth).not.toHaveClass("border-dashed");
	});

	it("dashes the five slots of the gate about to be run, in that gate's colour", () => {
		const { container } = render(<Codebase gates={GATES} label={LABEL} />);

		const todays = squaresOf(container).slice(10);

		expect(todays).toHaveLength(5);
		for (const square of todays) {
			expect(square).toHaveClass("border-dashed");
			expect(square).toHaveAttribute(
				"data-swatch-theme",
				gateSwatchAt(CASCADE).theme
			);
		}
	});

	it("paints the Champion's covered slots prismatic, the way its swatch is", () => {
		const { container } = render(
			<Codebase
				gates={[{ swatch: gateSwatchAt(CHAMPION), covered: 2, slots: 5 }]}
				label="2 of 5 slots covered"
			/>
		);

		expect(squaresOf(container)[0]).toHaveClass("bg-legendary");
	});
});
