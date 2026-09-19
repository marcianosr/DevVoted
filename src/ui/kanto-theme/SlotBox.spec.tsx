import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { SlotBox } from "./SlotBox.ui";

describe("SlotBox", () => {
	it("names the vacancy it stands in", () => {
		const { container } = render(<SlotBox />);

		expect(container.textContent).toBe("empty slot");
	});

	it("takes a label for a build holding nothing at all", () => {
		render(<SlotBox label="nothing installed yet" />);

		expect(screen.getByText("nothing installed yet")).toBeInTheDocument();
	});

	it("stays out of the accessibility tree, being decoration", () => {
		const { container } = render(<SlotBox />);

		expect(container.firstElementChild).toHaveAttribute("aria-hidden");
	});

	it("draws a dashed edge, the kit's mark for room that can still be filled", () => {
		const { container } = render(<SlotBox />);

		expect(container.firstElementChild?.className).toContain("border-dashed");
	});
});
