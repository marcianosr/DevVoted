import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Slot } from "./Slot.ui";

describe("Slot", () => {
	it("reads as empty when the run already owns the slot", () => {
		render(<Slot />);

		expect(screen.getByText("empty")).toBeInTheDocument();
	});

	it("names the gate that would open a slot the run does not own yet", () => {
		render(<Slot gate={4} />);

		expect(screen.getByText("opens at gate 4")).toBeInTheDocument();
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
