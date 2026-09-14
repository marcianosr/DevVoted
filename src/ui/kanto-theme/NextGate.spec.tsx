import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { kantoNextGateAt } from "~/test/kantoPoll.factory";

import { NextGate, type NextGateProps } from "./NextGate.ui";

const propsAt = (cleared = 9, unitsHeld = 41): NextGateProps => {
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
		expect(screen.getByText("80%")).toHaveAttribute(
			"data-screen-theme",
			"viridian"
		);
	});

	it("colours the coverage carried in by the band it lands in", () => {
		render(<NextGate {...props} />);

		expect(screen.getByText("74.5%")).toHaveAttribute(
			"data-screen-theme",
			"vermillion"
		);
	});

	it("wears the healthy colour once the run is already clearing", () => {
		render(<NextGate {...propsAt(9, 45)} />);

		expect(screen.getByText("81.8%")).toHaveAttribute(
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

	it("says when the gate opens, and stays quiet when nothing says", () => {
		const { rerender } = render(<NextGate {...props} />);

		expect(screen.getByText("tomorrow")).toBeInTheDocument();

		rerender(<NextGate {...props} opensAt={undefined} />);

		expect(screen.queryByText("tomorrow")).not.toBeInTheDocument();
	});
});
