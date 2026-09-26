import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { SlotBox } from "./SlotBox.ui";

describe("SlotBox", () => {
	it("names the vacancy it stands in", () => {
		const { container } = render(<SlotBox />);

		expect(container.textContent).toBe("empty");
	});

	it("takes a label for a build holding nothing at all", () => {
		render(<SlotBox label="nothing installed yet" />);

		expect(screen.getByText("nothing installed yet")).toBeInTheDocument();
	});

	it("states the room left as one block rather than one box a unit", () => {
		render(<SlotBox slots={3} />);

		expect(screen.getByText("3")).toBeInTheDocument();
	});

	it("says what the block counts, for a reader who cannot see its length", () => {
		render(<SlotBox slots={3} />);

		expect(screen.getByText("3 weight free")).toHaveClass("sr-only");
	});

	it("omits the block where nothing has told it the room left", () => {
		const { container } = render(<SlotBox />);

		expect(container.querySelector(".sr-only")).toBeNull();
	});

	it("draws a dashed edge, the kit's mark for room that can still be filled", () => {
		const { container } = render(<SlotBox />);

		expect(container.firstElementChild?.className).toContain("border-dashed");
	});
});
