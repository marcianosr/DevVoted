import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { GateHeader } from "./GateHeader.ui";
import type { SwatchTrackItem } from "./SwatchTrack.ui";

const gates: readonly SwatchTrackItem[] = [
	{
		id: "pallet",
		state: "earned",
		theme: "pallet",
		gate: "gate 1",
		name: "Pallet Swatch",
		earn: "Earned by clearing gate 1",
	},
	{
		id: "cascade",
		state: "current",
		theme: "cascade",
		gate: "gate 2",
		name: "Cascade Swatch",
		earn: "Clear gate 2 to earn it",
		requirement: "Needs 25% coverage in its window",
	},
];

const props = {
	title: "Gate 4 · Lavender",
	detail: "60% required · 1 audit · out of Rock Tunnel",
};

describe("GateHeader", () => {
	it("heads the bar with the gate and what it demands", () => {
		render(<GateHeader {...props} />);

		expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
			"Gate 4 · Lavender"
		);
		expect(screen.getByText(props.detail)).toBeInTheDocument();
	});

	it("draws one square per rung of the ladder", () => {
		render(<GateHeader {...props} gates={gates} />);

		expect(screen.getAllByRole("button")).toHaveLength(gates.length);
	});

	it("speaks the streak rather than leaving bare bars", () => {
		render(
			<GateHeader {...props} streak={{ multiplier: 3, lit: 3, total: 4 }} />
		);

		expect(screen.getByText("×3")).toHaveClass("text-theme");
		expect(
			screen.getByRole("img", { name: "3 of 4 toward the next step" })
		).toBeInTheDocument();
	});

	it("leaves out the streak and the ladder when there is none", () => {
		render(<GateHeader {...props} />);

		expect(screen.queryByText("streak")).not.toBeInTheDocument();
		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});
});
