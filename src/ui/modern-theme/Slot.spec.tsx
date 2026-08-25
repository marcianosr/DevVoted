import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Slot } from "./Slot.ui";

describe("Slot", () => {
	it("reads as empty when the run already owns the slot", () => {
		render(<Slot />);

		expect(screen.getByText("Not filled yet")).toBeInTheDocument();
	});

	it("names the gate that would open a slot the run does not own yet", () => {
		render(<Slot gate={4} />);

		expect(screen.getByText("opens when gate 4 clears")).toBeInTheDocument();
	});

	it("names the coverage total that would open a coverage-staged slot", () => {
		render(<Slot coverage={140} />);

		expect(screen.getByText("Unlocks at 140% coverage")).toBeInTheDocument();
	});

	it("offers both routes when either one opens the slot", () => {
		render(<Slot gate={10} coverage={300} />);

		expect(
			screen.getByText("Unlocks at gate 10 or 300% coverage")
		).toBeInTheDocument();
	});

	it("dims a slot that cannot be filled yet, and does not dim one that can", () => {
		const { container: locked } = render(<Slot gate={4} />);
		const { container: open } = render(<Slot />);

		expect(locked.firstChild).toHaveClass("opacity-50");
		expect(open.firstChild).not.toHaveClass("opacity-50");
	});

	it("keeps its disc out of the reading order, since the row says the same", () => {
		const { container } = render(<Slot />);

		expect(container.querySelector("[aria-hidden]")).toHaveClass(
			"border-dashed"
		);
	});
});
