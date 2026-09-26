import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { gateSwatchAt } from "~/test/swatchTrack.factory";

import { SwatchChip } from "./SwatchChip.ui";

const LAVENDER = gateSwatchAt(4);
const LABEL = "Lavender swatch";

const EARNED = { state: "current", swatch: LAVENDER } as const;

describe("SwatchChip", () => {
	it("names the swatch beside the gate's own colour", () => {
		render(<SwatchChip swatch={EARNED} label={LABEL} />);

		const chip = screen.getByText(LABEL);
		expect(chip.querySelector("[data-swatch-theme='lavender']")).not.toBeNull();
	});

	it("stays quieter than one of the kit's badges", () => {
		const { container } = render(<SwatchChip swatch={EARNED} label={LABEL} />);

		expect(container.firstElementChild).toHaveClass("bg-theme-raised");
		expect(container.firstElementChild).not.toHaveClass("badge-theme");
	});

	it("keeps the swatch at the size the kit reads inline", () => {
		const { container } = render(<SwatchChip swatch={EARNED} label={LABEL} />);

		expect(container.querySelector("[data-swatch-theme]")).toHaveClass(
			"size-3.5"
		);
	});

	it("draws the swatch in whatever state it was handed", () => {
		const { container } = render(
			<SwatchChip
				swatch={{ state: "undiscovered" }}
				label="an unearned swatch"
			/>
		);

		expect(container.querySelector("[data-swatch-theme]")).toBeNull();
	});
});
