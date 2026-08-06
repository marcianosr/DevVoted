import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ALL_SWATCHES } from "~/modules/run/gate/swatch.model";
import { GATE_COUNT, VICTORY_GATE } from "~/modules/run/rules.model";
import { GateSegmentBar } from "./GateSegmentBar.ui";

const pips = (): HTMLElement[] => screen.getAllByRole("button");

const fillOf = (gate: number): HTMLElement => {
	const fill = pips()[gate].firstElementChild;
	if (!(fill instanceof HTMLElement))
		throw new Error(`no fill on gate ${gate}`);
	return fill;
};

// Two gates banked (0 and 1), so gate 2 is the one underway, 3 of its 5 polls in.
const midClimb = (
	<GateSegmentBar
		swatches={ALL_SWATCHES}
		gatesCleared={2}
		pollsAnswered={3}
		pollsPerGate={5}
		label="climb"
	/>
);

describe(GateSegmentBar, () => {
	it("draws one pip per gate of the climb", () => {
		render(midClimb);
		expect(pips()).toHaveLength(GATE_COUNT);
	});

	it("wears each gate's swatch colour, so the bar is the badge collection", () => {
		render(midClimb);
		expect(pips()[0]).toHaveAttribute("data-swatch-theme", "pallet");
		expect(pips()[1]).toHaveAttribute("data-swatch-theme", "boulder");
		expect(pips()[2]).toHaveAttribute("data-swatch-theme", "cascade");
		expect(fillOf(1)).toHaveClass("bg-theme");
	});

	it("fills the gates already beaten", () => {
		render(midClimb);
		for (const gate of [0, 1]) {
			expect(fillOf(gate)).toHaveStyle({ width: "100%" });
			expect(fillOf(gate)).not.toHaveClass("opacity-40");
		}
	});

	it("fills the gate underway by the polls answered into its window", () => {
		render(midClimb);
		expect(fillOf(2)).toHaveStyle({ width: "60%" }); // 3 of 5
	});

	it("leaves gates not yet reached empty", () => {
		render(midClimb);
		expect(fillOf(3)).toHaveStyle({ width: "0%" });
		expect(fillOf(3)).toHaveClass("opacity-40");
	});

	it("carries no coverage — width's progress lives in the shop", () => {
		render(midClimb);
		for (const detail of screen.getAllByRole("tooltip")) {
			expect(detail).not.toHaveTextContent("coverage");
		}
	});

	it("rims the Elite pip, whose indigo is darker than the empty track", () => {
		render(midClimb);
		const elite = pips()[VICTORY_GATE - 1];
		expect(elite).toHaveAttribute("data-swatch-theme", "elite");
		expect(elite).toHaveClass("ring-pewter");
	});

	it("gives the Champion a gradient fill, having no flat colour", () => {
		render(midClimb);
		expect(pips().at(-1)).not.toHaveAttribute("data-swatch-theme");
		expect(fillOf(VICTORY_GATE)).toHaveClass("bg-legendary");
	});

	it("names each pip's standing for assistive tech", () => {
		render(midClimb);
		expect(
			screen.getByRole("button", { name: "gate 0, Pallet Swatch, earned" })
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", {
				name: "gate 2, Cascade Swatch, current gate",
			})
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", {
				name: "gate 3, Thunder Swatch, not reached",
			})
		).toBeInTheDocument();
	});

	it("details the gate underway with its window progress", () => {
		render(midClimb);
		const detail = screen.getAllByRole("tooltip")[2];
		expect(detail).toHaveTextContent("gate 2");
		expect(detail).toHaveTextContent("Cascade Swatch");
		expect(detail).toHaveTextContent("Running now · 3 of 5 answered");
	});

	it("says a beaten gate's badge is earned", () => {
		render(midClimb);
		const detail = screen.getAllByRole("tooltip")[1];
		expect(detail).toHaveTextContent("Boulder Swatch");
		expect(detail).toHaveTextContent("Earned");
	});

	it("tells an unreached gate what would earn its badge", () => {
		render(midClimb);
		expect(screen.getAllByRole("tooltip")[4]).toHaveTextContent(
			"Clear gate 4 to earn it"
		);
	});

	it("groups the pips under the climb's own label", () => {
		render(
			<GateSegmentBar
				swatches={ALL_SWATCHES}
				gatesCleared={3}
				pollsAnswered={0}
				pollsPerGate={5}
				label="gate 3 of 12"
			/>
		);
		expect(
			screen.getByRole("group", { name: "gate 3 of 12" })
		).toBeInTheDocument();
	});
});
