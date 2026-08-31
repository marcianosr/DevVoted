import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Equation } from "./Equation.ui";

const FACTORS = [
	{ label: "correct", value: 1 },
	{ label: "streak", value: 1.1 },
	{ label: "your build", value: 1.25 },
];

const factorOf = (label: string) =>
	screen.getByText(label).parentElement?.textContent;

describe("Equation", () => {
	it("reads the earn as its multiplication, factor by factor", () => {
		render(<Equation factors={FACTORS} paid={1.4} />);

		expect(factorOf("correct")).toBe("1.0correct");
		expect(factorOf("streak")).toBe("1.1streak");
		expect(factorOf("your build")).toBe("1.25your build");
		expect(screen.getAllByText("×")).toHaveLength(2);
	});

	it("sets the figure over the name it belongs to, not beside it", () => {
		render(<Equation factors={[{ label: "correct", value: 2 }]} paid={2} />);

		expect(screen.getByText("2.0")).toHaveClass("text-2xl");
		expect(screen.getByText("correct")).toHaveClass("text-xxs");
	});

	it("states what the answer paid, signed and suffixed", () => {
		render(<Equation factors={FACTORS} paid={1.4} />);

		expect(screen.getByLabelText("+1.4%")).toBeInTheDocument();
		expect(screen.getByText("coverage earned")).toBeInTheDocument();
	});

	it("names a loss as lost rather than as a negative earning", () => {
		render(<Equation factors={[]} paid={-0.8} />);

		expect(screen.getByText("coverage lost")).toBeInTheDocument();
		expect(screen.queryByText("coverage earned")).not.toBeInTheDocument();
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

	// The gate sets the other terms; the box is the half the player chose.
	it("boxes a config and leaves the gate's own terms bare", () => {
		render(
			<Equation
				factors={[
					{ label: "correct", value: 1 },
					{ label: "AGENTS.md", value: 2, chosen: true },
				]}
				paid={2}
			/>
		);

		expect(screen.getByText("AGENTS.md").parentElement).toHaveClass(
			"border-edge-strong"
		);
		expect(screen.getByText("correct").parentElement).not.toHaveClass(
			"border-edge-strong"
		);
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

		expect(factorOf("Code Coverage")).toBe("+0.5Code Coverage");
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

		const row = screen.getByText("correct").closest("div");
		expect(row?.textContent).toBe("(1.0correct++0.5Code Coverage)×1.1streak");
	});

	it("keeps one decimal on a whole factor so it still reads as a figure", () => {
		render(<Equation factors={[{ label: "correct", value: 2 }]} paid={2} />);

		expect(screen.getByText("2.0")).toBeInTheDocument();
	});

	it("carries a closing note for what the answer changed beyond its coverage", () => {
		render(
			<Equation
				factors={[]}
				paid={-0.5}
				note="streak lost · your next correct answer starts at ×1.0"
			/>
		);

		expect(
			screen.getByText("streak lost · your next correct answer starts at ×1.0")
		).toBeInTheDocument();
	});

	it("says nothing extra when the answer changed nothing else", () => {
		render(<Equation factors={FACTORS} paid={1.4} />);

		expect(screen.queryByText(/streak lost/)).not.toBeInTheDocument();
	});
});
