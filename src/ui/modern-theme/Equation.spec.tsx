import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Equation } from "./Equation.ui";

const FACTORS = [
	{ label: "correct", value: 1 },
	{ label: "streak", value: 1.1 },
	{ label: "your build", value: 1.25, tone: "celadon" as const },
];

describe("Equation", () => {
	it("reads the earn as its multiplication, factor by factor", () => {
		render(<Equation factors={FACTORS} paid={1.4} />);

		expect(screen.getByText("correct 1.0")).toBeInTheDocument();
		expect(screen.getByText("streak 1.1")).toBeInTheDocument();
		expect(screen.getByText("your build 1.25")).toBeInTheDocument();
		expect(screen.getAllByText("×")).toHaveLength(2);
	});

	it("states what the answer paid, signed and suffixed", () => {
		render(<Equation factors={FACTORS} paid={1.4} />);

		expect(screen.getByLabelText("+1.4%")).toBeInTheDocument();
	});

	it("carries a miss as the paid line alone — nothing multiplied", () => {
		render(<Equation factors={[]} paid={-0.8} />);

		expect(screen.getByLabelText("−0.8%")).toBeInTheDocument();
		expect(screen.queryByText("×")).not.toBeInTheDocument();
	});

	it("colours the paid line by its sign", () => {
		render(<Equation factors={[]} paid={-0.8} />);

		expect(screen.getByLabelText("−0.8%")).toHaveClass("text-cinnabar");
	});

	it("dresses a config's chip in its grade instead of a tone", () => {
		render(
			<Equation
				factors={[{ label: "AGENTS.md", value: 2, rarity: "nibble" }]}
				paid={2}
			/>
		);

		expect(screen.getByText("AGENTS.md 2.0")).toBeInTheDocument();
	});

	it("adds a flat contributor in rather than converting it to a factor", () => {
		render(
			<Equation
				factors={[
					{ label: "correct", value: 1 },
					{ label: "Code Coverage", value: 0.5, op: "plus" },
				]}
				paid={1.5}
			/>
		);

		expect(screen.getByText("Code Coverage +0.5")).toBeInTheDocument();
		expect(screen.getByText("+")).toBeInTheDocument();
		expect(screen.queryByText("×")).not.toBeInTheDocument();
	});

	it("brackets the base and its adds when multipliers scale their sum", () => {
		render(
			<Equation
				factors={[
					{ label: "correct", value: 1 },
					{ label: "Code Coverage", value: 0.5, op: "plus" },
					{ label: "streak", value: 1.1 },
				]}
				paid={1.7}
			/>
		);

		expect(screen.getByText("(")).toBeInTheDocument();
		expect(screen.getByText(")")).toBeInTheDocument();
	});

	it("leaves the brackets off when the row is all adds", () => {
		render(
			<Equation
				factors={[
					{ label: "correct", value: 1 },
					{ label: "Code Coverage", value: 0.5, op: "plus" },
				]}
				paid={1.5}
			/>
		);

		expect(screen.queryByText("(")).not.toBeInTheDocument();
	});

	it("orders adds before multipliers however they arrive", () => {
		render(
			<Equation
				factors={[
					{ label: "correct", value: 1 },
					{ label: "streak", value: 1.1 },
					{ label: "Code Coverage", value: 0.5, op: "plus" },
				]}
				paid={1.7}
			/>
		);

		const row = screen.getByText("correct 1.0").closest("div");
		expect(row?.textContent).toBe(
			"(correct 1.0+Code Coverage +0.5)×streak 1.1"
		);
	});

	it("keeps one decimal on a whole factor so it still reads as a figure", () => {
		render(<Equation factors={[{ label: "correct", value: 2 }]} paid={2} />);

		expect(screen.getByText("correct 2.0")).toBeInTheDocument();
	});
});
