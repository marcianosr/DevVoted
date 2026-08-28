import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import {
	ExtraSpots,
	extraSpotLabel,
	type ExtraSpotStep,
} from "./ExtraSpots.ui";

const STEPS: readonly ExtraSpotStep[] = [
	{
		id: "extra-0",
		label: "none",
		makes: "makes 8",
		terms: "free",
		settled: true,
		held: false,
		pick: { onUse: () => {} },
	},
	{
		id: "extra-1",
		label: "+1 spot",
		makes: "makes 9",
		terms: "8 KB a gate",
		held: true,
		pick: { onUse: () => {} },
	},
	{
		id: "extra-2",
		label: "+2 spots",
		makes: "makes 10",
		terms: "16 KB a gate",
		held: false,
		opensAt: "opens at gate 5",
	},
];

const section = (renting = 1, perGateKb = 8) => (
	<ExtraSpots steps={STEPS} renting={renting} perGateKb={perGateKb} />
);

describe("ExtraSpots", () => {
	it("names itself for what it sells, not for the whole of capacity", () => {
		render(section());

		expect(screen.getByText("Extra spots")).toBeInTheDocument();
	});

	it("says what the rent already costs, in the header", () => {
		render(section());

		expect(screen.getByText("renting 1 · 8 KB a gate")).toBeInTheDocument();
	});

	it("says so plainly when nothing is on the bill", () => {
		render(section(0, 0));

		expect(screen.getByText("renting nothing")).toBeInTheDocument();
	});

	it("names both ways a pipeline gets wider", () => {
		render(section());

		expect(
			screen.getByText(
				"Gates unlock spots for free. Rent adds more on top, by the gate."
			)
		).toBeInTheDocument();
	});

	it("draws every step it was given, locked ones included", () => {
		render(section());

		expect(screen.getByText("none")).toBeInTheDocument();
		expect(screen.getByText("+1 spot")).toBeInTheDocument();
		expect(screen.getByText("+2 spots")).toBeInTheDocument();
		expect(screen.getByText("opens at gate 5")).toBeInTheDocument();
	});

	it("gives the steps it sells a radio each, and the locked one none", () => {
		render(section());

		expect(screen.getAllByRole("radio")).toHaveLength(2);
	});

	it("does not fold away — the section is a reason the screen exists", () => {
		render(section());

		expect(screen.queryByRole("button", { expanded: false })).toBeNull();
	});
});

describe("extraSpotLabel", () => {
	it("writes every step as an addition, and nothing as none", () => {
		expect(extraSpotLabel(0)).toBe("none");
		expect(extraSpotLabel(1)).toBe("+1 spot");
		expect(extraSpotLabel(3)).toBe("+3 spots");
	});
});

describe("the picker", () => {
	it("rents the step whose radio is used", () => {
		const onUse = vi.fn();
		render(
			<ExtraSpots
				steps={[{ ...STEPS[0], pick: { onUse } }]}
				renting={0}
				perGateKb={0}
			/>
		);

		screen.getByRole("radio").click();

		expect(onUse).toHaveBeenCalledOnce();
	});
});
