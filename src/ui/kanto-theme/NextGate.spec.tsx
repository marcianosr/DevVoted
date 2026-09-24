import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { kantoNextGateAt } from "~/test/kantoPoll.factory";

import { NextGate, type NextGateProps } from "./NextGate.ui";

const propsAt = (cleared = 9, unitsHeld = 42): NextGateProps => {
	const next = kantoNextGateAt(cleared, unitsHeld);

	if (next === undefined)
		throw new Error(`gate ${cleared} has no gate after it`);

	return next;
};

const props = propsAt();

describe("NextGate", () => {
	it("titles itself the gate ahead rather than the one just cleared", () => {
		render(<NextGate {...props} />);

		expect(
			screen.getByRole("heading", { name: "Next gate" })
		).toBeInTheDocument();
		expect(screen.getByText("Gate 10 · Earth")).toBeInTheDocument();
	});

	it("states what the gate will be scored out of once it closes", () => {
		render(<NextGate {...props} />);

		expect(screen.getByText(/55 slots after it closes/)).toBeInTheDocument();
	});

	it("names the band that passes and prices it", () => {
		render(<NextGate {...props} />);

		expect(screen.getByText("HEALTHY")).toBeInTheDocument();
		expect(screen.getByText("83.6%")).toHaveAttribute(
			"data-screen-theme",
			"viridian"
		);
	});

	it("colours the coverage carried in by the band it lands in", () => {
		render(<NextGate {...props} />);

		expect(screen.getByText("76.4%")).toHaveAttribute(
			"data-screen-theme",
			"vermillion"
		);
	});

	it("wears the healthy colour once the run is already clearing", () => {
		render(<NextGate {...propsAt(9, 47)} />);

		expect(screen.getByText("85.5%")).toHaveAttribute(
			"data-screen-theme",
			"viridian"
		);
	});

	it("leaves the gate's swatch dashed, nobody having won it yet", () => {
		const { container } = render(<NextGate {...props} />);

		const swatch = container.querySelector("[data-swatch-theme]");

		expect(swatch).toHaveClass("border-dashed");
		expect(swatch).toHaveAttribute("data-swatch-theme", props.swatch.theme);
	});

	it("prices the gate ahead in answers, which no denominator can re-base", () => {
		render(<NextGate {...props} />);

		expect(screen.getByText("4 of the 5 right clears it.")).toBeInTheDocument();
	});

	it("says nothing at all when the run already carries the line in", () => {
		const { container } = render(<NextGate {...propsAt(9, 47)} />);

		expect(container.querySelector("footer")).toBeNull();
	});

	it("warns when a flawless window still would not reach the line", () => {
		render(<NextGate {...propsAt(8, 0)} />);

		expect(
			screen.getByText("5 of the 5 right will not reach it.")
		).toBeInTheDocument();
	});

	it("rounds the demand, so gate 5 reads 65% rather than a float", () => {
		render(<NextGate {...propsAt(4, 0)} />);

		expect(screen.getByText("65%")).toBeInTheDocument();
		expect(screen.queryByText(/65\.0+1/)).not.toBeInTheDocument();
	});

	it("stays quiet when nothing is owed to say", () => {
		render(<NextGate {...props} note={undefined} />);

		expect(screen.queryByText(/right clears it/)).not.toBeInTheDocument();
	});

	it("says when the gate opens, and stays quiet when nothing says", () => {
		const { rerender } = render(<NextGate {...props} />);

		expect(screen.getByText("tomorrow")).toBeInTheDocument();

		rerender(<NextGate {...props} opensAt={undefined} />);

		expect(screen.queryByText("tomorrow")).not.toBeInTheDocument();
	});
});
