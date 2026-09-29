import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import {
	GATE_STRICTNESS_TITLE,
	GateStrictness,
	type GateStrictnessProps,
} from "./GateStrictness.ui";

const props: GateStrictnessProps = {
	summary: "Lavender · 25 slots · one unit is +4%",
	statements: [
		[
			"The codebase grows. Each gate opens ",
			{ figure: "5" },
			" more slots, so one unit moves the bar less.",
		],
		[
			"The line rises. ",
			{ band: "healthy" },
			" asks ",
			{ figure: "60%", band: "healthy" },
			" from Pallet to Thunder, then climbs to ",
			{ figure: "90%", band: "healthy" },
			" at Champion.",
		],
	],
	rows: [
		{ gate: "Pallet", slots: "5", unit: "+20%", healthy: "60%" },
		{ gate: "Boulder", slots: "10", unit: "+10%", healthy: "60%" },
		{
			gate: "Lavender",
			slots: "25",
			unit: "+4%",
			healthy: "62%",
			current: true,
		},
		{ gate: "Champion", slots: "65", unit: "+1.54%", healthy: "90%" },
	],
	note: ["Your units stay banked; a new gate only adds slots to cover."],
};

const rowOf = (gate: string) =>
	screen.getByText(gate).closest("div.flex.w-full") as HTMLElement;

describe("GateStrictness", () => {
	it("folds shut, the same table standing behind every prep", () => {
		const { container } = render(<GateStrictness {...props} />);

		const fold = container.querySelector("details") as HTMLDetailsElement;

		expect(fold).not.toHaveAttribute("open");
		expect(
			screen.getByRole("heading", { name: GATE_STRICTNESS_TITLE })
		).toBeInTheDocument();
	});

	it("summarises today's gate on the fold, so the table need not be opened", () => {
		const { container } = render(<GateStrictness {...props} />);

		expect(container.querySelector("summary")).toHaveTextContent(
			"Lavender · 25 slots · one unit is +4%"
		);
	});

	it("numbers its two statements", () => {
		render(<GateStrictness {...props} />);

		expect(screen.getByText("1")).toHaveClass("badge-theme");
		expect(screen.getByText("2")).toHaveClass("badge-theme");
		expect(screen.getByText(/moves the bar less/)).toBeInTheDocument();
	});

	it("heads the table gate, slots, one unit and HEALTHY", () => {
		render(<GateStrictness {...props} />);

		for (const heading of ["gate", "slots", "one unit"]) {
			expect(screen.getByText(heading)).toBeInTheDocument();
		}
		expect(screen.getAllByText("HEALTHY").length).toBeGreaterThan(1);
	});

	it("edges the row of the gate being prepped and no other", () => {
		render(<GateStrictness {...props} />);

		expect(rowOf("Lavender")).toHaveClass("border-l-2");
		expect(rowOf("Pallet")).not.toHaveClass("border-l-2");
		expect(rowOf("Champion")).not.toHaveClass("border-l-2");
	});

	it("badges what one unit pays and the line it must reach", () => {
		render(<GateStrictness {...props} />);

		expect(screen.getByText("+1.54%")).toHaveAttribute(
			"data-screen-theme",
			"viridian"
		);
		expect(screen.getByText("62%")).toHaveAttribute(
			"data-screen-theme",
			"viridian"
		);
	});

	it("closes on the note", () => {
		render(<GateStrictness {...props} />);

		expect(screen.getByText(/Your units stay banked/)).toBeInTheDocument();
	});
});
