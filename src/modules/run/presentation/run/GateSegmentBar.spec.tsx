import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { gateLadderRungs } from "~/modules/run/pipeline/swatch.model";
import { GATE_COUNT, VICTORY_GATE } from "~/modules/run/rules.model";
import { GateSegmentBar } from "./GateSegmentBar.ui";

// Gates count from 0, so the ladder runs gate 0 (Pallet, free) through the
// summit, and a pip's index is its gate number.
const rungs = gateLadderRungs(VICTORY_GATE);

const pips = (): HTMLElement[] => screen.getAllByRole("button");

const fillOf = (gate: number): HTMLElement => {
	const fill = pips()[gate].firstElementChild;
	if (!(fill instanceof HTMLElement))
		throw new Error(`no fill on gate ${gate}`);
	return fill;
};

describe(GateSegmentBar, () => {
	it("draws one pip per gate on the ladder", () => {
		render(
			<GateSegmentBar
				rungs={rungs}
				gatesCleared={2}
				coverage={20}
				label="climb"
			/>
		);
		expect(pips()).toHaveLength(GATE_COUNT);
	});

	it("wears each gate's swatch colour, so the bar is the ladder", () => {
		render(
			<GateSegmentBar
				rungs={rungs}
				gatesCleared={2}
				coverage={20}
				label="climb"
			/>
		);
		// Boulder opens gate 1, Cascade gate 2.
		expect(pips()[1]).toHaveAttribute("data-swatch-theme", "boulder");
		expect(pips()[2]).toHaveAttribute("data-swatch-theme", "cascade");
		expect(fillOf(1)).toHaveClass("bg-theme");
	});

	it("opens the bar in Pallet — the free swatch you start holding", () => {
		render(
			<GateSegmentBar
				rungs={rungs}
				gatesCleared={0}
				coverage={0}
				label="climb"
			/>
		);
		expect(pips()[0]).toHaveAttribute("data-swatch-theme", "pallet");
		expect(fillOf(0)).not.toHaveClass("opacity-25");
	});

	it("fills the gates you hold, including the one you're standing on", () => {
		render(
			<GateSegmentBar
				rungs={rungs}
				gatesCleared={2}
				coverage={20}
				label="climb"
			/>
		);
		for (const gate of [0, 1, 2]) {
			expect(fillOf(gate)).toHaveStyle({ width: "100%" });
			expect(fillOf(gate)).not.toHaveClass("opacity-25");
		}
	});

	it("dims a rung still to collect and fills it by coverage earned", () => {
		// Gate 3 (Thunder) costs 28%; 14% is exactly half way there.
		render(
			<GateSegmentBar
				rungs={rungs}
				gatesCleared={2}
				coverage={14}
				label="climb"
			/>
		);
		expect(fillOf(3)).toHaveClass("opacity-25");
		expect(fillOf(3)).toHaveStyle({ width: "50%" });
	});

	it("clamps a rung already afforded instead of overflowing its pip", () => {
		render(
			<GateSegmentBar
				rungs={rungs}
				gatesCleared={0}
				coverage={999}
				label="climb"
			/>
		);
		expect(fillOf(4)).toHaveStyle({ width: "100%" });
	});

	it("gives the legendary rung a gradient fill, having no flat colour", () => {
		render(
			<GateSegmentBar
				rungs={rungs}
				gatesCleared={0}
				coverage={0}
				label="climb"
			/>
		);
		expect(pips().at(-1)).not.toHaveAttribute("data-swatch-theme");
		expect(fillOf(VICTORY_GATE)).toHaveClass("bg-legendary");
	});

	it("names each pip for assistive tech, gap included", () => {
		render(
			<GateSegmentBar
				rungs={rungs}
				gatesCleared={2}
				coverage={19}
				label="climb"
			/>
		);
		expect(
			screen.getByRole("button", { name: /gate 0, Pallet Swatch, collected/ })
		).toBeInTheDocument();
		// Gate 3 costs 28%, so 19% leaves 9 points to earn.
		expect(
			screen.getByRole("button", {
				name: /gate 3, Thunder Swatch, opens at 28% coverage, 9% to go/,
			})
		).toBeInTheDocument();
	});

	it("reports a rung as ready once its coverage is in hand", () => {
		render(
			<GateSegmentBar
				rungs={rungs}
				gatesCleared={2}
				coverage={30}
				label="climb"
			/>
		);
		expect(
			screen.getByRole("button", {
				name: /gate 3, Thunder Swatch, ready to unlock/,
			})
		).toBeInTheDocument();
	});

	it("details a single gate on its pip — swatch, price, and the gap left", () => {
		render(
			<GateSegmentBar
				rungs={rungs}
				gatesCleared={2}
				coverage={19}
				label="climb"
			/>
		);
		const detail = screen.getAllByRole("tooltip")[3]; // gate 3
		expect(detail).toHaveTextContent("gate 3");
		expect(detail).toHaveTextContent("Thunder Swatch");
		expect(detail).toHaveTextContent("Opens at 28% coverage");
		expect(detail).toHaveTextContent("you have 19%");
		expect(detail).toHaveTextContent("9% to go");
	});

	it("says a held gate is collected instead of pricing it again", () => {
		render(
			<GateSegmentBar
				rungs={rungs}
				gatesCleared={2}
				coverage={19}
				label="climb"
			/>
		);
		const detail = screen.getAllByRole("tooltip")[1]; // gate 1, held
		expect(detail).toHaveTextContent("Boulder Swatch");
		expect(detail).toHaveTextContent("Collected");
		expect(detail).not.toHaveTextContent("to go");
	});

	it("groups the pips under the climb's own label", () => {
		render(
			<GateSegmentBar
				rungs={rungs}
				gatesCleared={3}
				coverage={40}
				label="gate 3 of 11"
			/>
		);
		expect(
			screen.getByRole("group", { name: "gate 3 of 11" })
		).toBeInTheDocument();
	});
});
