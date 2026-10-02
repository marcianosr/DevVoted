import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import { SCORING_TITLE, Scoring, type ScoringProps } from "./Scoring.ui";

const props: ScoringProps = {
	meta: [
		"single ",
		{ figure: "+11.1%", gain: true },
		" · multiple up to ",
		{ figure: "+22.2%", gain: true },
		" · accuracy up to ",
		{ figure: "×2" },
	],
	prices: [
		{
			label: "single answer",
			steps: [
				{ figure: "0", tone: "none" },
				{ figure: "1", tone: "full" },
			],
		},
		{
			label: "multiple answers",
			steps: [
				{ figure: "0", tone: "none" },
				{ figure: "0.5", tone: "partial" },
				{ figure: "1", tone: "partial" },
				{ figure: "1.5", tone: "partial" },
				{ figure: "2", tone: "full" },
			],
		},
	],
	hint: [
		"credit per poll · a multiple counts ",
		{ figure: "2" },
		" · configs add on top",
	],
	statements: [
		[
			"Right answers multiply what the window covered: ",
			{ figure: "5 ×2" },
			". A multiple counts as two.",
		],
		[
			"The line rises. ",
			{ band: "healthy" },
			" asks ",
			{ figure: "62%", band: "healthy" },
			" at Lavender and more at the gates after.",
		],
	],
	rows: [
		{ gate: 0, name: "Pallet", unit: "+20%", healthy: "60%" },
		{ gate: 1, name: "Boulder", unit: "+10%", healthy: "60%" },
		{ gate: 2, name: "Cascade", unit: "+6.67%", healthy: "60%" },
		{ gate: 3, name: "Thunder", unit: "+5%", healthy: "60%" },
		{
			gate: 4,
			name: "Lavender",
			unit: "+4%",
			healthy: "62%",
			current: true,
		},
		{ locked: true, gate: 5, name: "Rainbow" },
		{ locked: true, gate: 12, name: "Champion" },
	],
};

const BADGE = ".badge-theme";

const rowOf = (name: string) =>
	screen.getByText(name).closest("div.flex.w-full") as HTMLElement;

const priceOf = (label: string) =>
	within(screen.getByText(label).closest("div") as HTMLElement);

describe("Scoring", () => {
	it("folds shut under its own name", () => {
		const { container } = render(<Scoring {...props} />);

		expect(container.querySelector("details")).not.toHaveAttribute("open");
		expect(
			screen.getByRole("heading", { name: SCORING_TITLE })
		).toBeInTheDocument();
	});

	it("states what a single, a multiple and accuracy add on the strip, the gains in green", () => {
		const { container } = render(<Scoring {...props} />);

		const strip = within(container.querySelector("summary") as HTMLElement);

		expect(container.querySelector("summary")).toHaveTextContent(
			"single +11.1% · multiple up to +22.2% · accuracy up to ×2"
		);
		expect(strip.getByText("+11.1%")).toHaveAttribute(
			"data-screen-theme",
			"viridian"
		);
		expect(strip.getByText("×2")).toHaveClass("badge-theme");
	});

	it("prices a single answer as nothing or a unit, red then green", () => {
		render(<Scoring {...props} />);

		const steps = priceOf("single answer").getAllByText(/^\d/, {
			selector: BADGE,
		});

		expect(steps.map((step) => step.textContent)).toEqual(["0", "1"]);
		expect(steps[0]).toHaveAttribute("data-screen-theme", "cinnabar");
		expect(steps[1]).toHaveAttribute("data-screen-theme", "viridian");
	});

	it("prices a multiple answer by its share, the partial steps in saffron", () => {
		render(<Scoring {...props} />);

		const steps = priceOf("multiple answers").getAllByText(/^\d/, {
			selector: BADGE,
		});

		expect(steps.map((step) => step.textContent)).toEqual([
			"0",
			"0.5",
			"1",
			"1.5",
			"2",
		]);
		expect(steps[2]).toHaveAttribute("data-screen-theme", "saffron");
		expect(steps[4]).toHaveAttribute("data-screen-theme", "viridian");
	});

	it("hints the credit a poll pays with the multiple's credit badged", () => {
		render(<Scoring {...props} />);

		const hint = screen.getByText(/configs add on top/).closest("p");

		expect(hint).toHaveTextContent(
			"credit per poll · a multiple counts 2 · configs add on top"
		);
		expect(within(hint as HTMLElement).getByText("2")).toHaveClass(
			"badge-theme"
		);
	});

	it("numbers its two statements and badges the figures inside them", () => {
		render(<Scoring {...props} />);

		const curve = screen
			.getByText(/multiply what the window covered/)
			.closest("div");
		const rises = screen.getByText(/gates after/).closest("div");

		expect(within(curve as HTMLElement).getByText("1")).toHaveClass(
			"badge-theme"
		);
		expect(within(curve as HTMLElement).getByText("5 ×2")).toHaveClass(
			"badge-theme"
		);
		expect(within(rises as HTMLElement).getByText("2")).toHaveClass(
			"badge-theme"
		);
		expect(within(rises as HTMLElement).getByText("62%")).toHaveAttribute(
			"data-screen-theme",
			"viridian"
		);
	});

	it("heads the table gate, single choice and HEALTHY", () => {
		const { container } = render(<Scoring {...props} />);

		const headings = within(
			container.querySelector(".bg-theme-raised") as HTMLElement
		);

		for (const heading of ["gate", "single choice", "HEALTHY"]) {
			expect(headings.getByText(heading)).toBeInTheDocument();
		}
	});

	it("badges every figure on a reached row, the single's gain in green", () => {
		render(<Scoring {...props} />);

		const lavender = within(rowOf("Lavender"));

		expect(lavender.getByText("+4%")).toHaveAttribute(
			"data-screen-theme",
			"viridian"
		);
		expect(lavender.getByText("62%")).toHaveAttribute(
			"data-screen-theme",
			"viridian"
		);
	});

	it("edges the row of the gate being prepped and no other", () => {
		render(<Scoring {...props} />);

		expect(rowOf("Lavender")).toHaveClass("border-l-2");
		expect(rowOf("Pallet")).not.toHaveClass("border-l-2");
		expect(rowOf("Rainbow")).not.toHaveClass("border-l-2");
	});

	it("seals the figures of a gate ahead but keeps its name, named once for a reader", () => {
		render(<Scoring {...props} />);

		const rainbow = within(rowOf("Rainbow"));

		expect(rainbow.getAllByText("???")).toHaveLength(2);
		expect(
			rainbow.getAllByText("Sealed until the run reaches this gate")
		).toHaveLength(1);
		expect(rainbow.queryByText(/%/)).toBeNull();
		expect(within(rowOf("Champion")).getAllByText("???")).toHaveLength(2);
	});

	it("marks the gates it skips between the next one and the last with a gap", () => {
		render(<Scoring {...props} />);

		expect(screen.getAllByText("⋮")).toHaveLength(1);
		expect(rowOf("Rainbow").nextElementSibling).toHaveTextContent("⋮");
		expect(rowOf("Thunder").nextElementSibling).toBe(rowOf("Lavender"));
	});

	it("closes on the table, with no note under it", () => {
		render(<Scoring {...props} />);

		expect(screen.queryByText(/stay banked/)).toBeNull();
	});
});
