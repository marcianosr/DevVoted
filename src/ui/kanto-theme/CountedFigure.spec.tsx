import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { CountedFigure } from "./CountedFigure.ui";

const digitsOf = (container: HTMLElement) =>
	container.querySelector(".figure-count");

describe("CountedFigure", () => {
	it("rides the figure on the property the stylesheet tweens", () => {
		const { container } = render(<CountedFigure value={320} />);

		expect(digitsOf(container)).toHaveStyle({ "--figure-count": "320" });
	});

	it("moves the figure rather than replacing it, so the digits can travel", () => {
		const { container, rerender } = render(<CountedFigure value={320} />);
		rerender(<CountedFigure value={312} />);

		expect(digitsOf(container)).toHaveStyle({ "--figure-count": "312" });
	});

	it("states the figure for a reader, the digits being drawn by CSS", () => {
		render(<CountedFigure value={320} />);

		expect(screen.getByText("320")).toHaveClass("sr-only");
	});

	it("keeps the drawn digits out of the accessibility tree, to say it once", () => {
		const { container } = render(<CountedFigure value={320} />);

		expect(digitsOf(container)).toHaveAttribute("aria-hidden");
	});

	it("names what the figure counts, after it", () => {
		render(<CountedFigure value={320} unit="KB left" />);

		expect(screen.getByText("KB left")).toBeInTheDocument();
	});
});
