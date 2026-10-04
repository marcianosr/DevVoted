import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Logo } from "./Logo.ui";

describe("Logo", () => {
	it("spells the product name in lowercase", () => {
		render(<Logo />);

		expect(screen.getByText("devvoted")).toBeInTheDocument();
	});

	it("keeps the name readable to a screen reader when only the mark shows", () => {
		render(<Logo markOnly />);

		expect(screen.getByText("devvoted")).toHaveClass("sr-only");
	});

	it("holds the mark out of the accessibility tree, so the name is spoken once", () => {
		const { container } = render(<Logo />);

		expect(container.querySelector("svg")).toHaveAttribute("aria-hidden");
	});

	it.each([
		["sm", "text-sm"],
		["md", "text-xl"],
		["lg", "text-display"],
	] as const)(
		"scales the whole lockup from the %s font size",
		(size, expected) => {
			const { container } = render(<Logo size={size} />);

			expect(container.firstChild).toHaveClass(expected);
		}
	);

	it("stands at the mock size unless told otherwise", () => {
		const { container } = render(<Logo />);

		expect(container.firstChild).toHaveClass("text-xl");
	});

	it("breaks the mark twelve times round, so the cell reads as unfilled", () => {
		const { container } = render(<Logo />);

		const rect = container.querySelector("rect");
		expect(rect).toHaveAttribute("stroke-dasharray", "4.41 2.21");
		expect(rect).toHaveAttribute("stroke-dashoffset", "2.21");
	});

	it("stands the word alone when nothing is slotted beneath it", () => {
		render(<Logo />);

		expect(screen.getByText("devvoted").parentElement?.tagName).toBe("SPAN");
		expect(screen.queryByText("a tagline")).not.toBeInTheDocument();
	});

	it("stacks the slotted line under the word, sharing one column", () => {
		render(<Logo below={<span>a tagline</span>} />);

		const column = screen.getByText("devvoted").parentElement;
		expect(column).toHaveClass("flex-col");
		expect(column).toContainElement(screen.getByText("a tagline"));
	});

	it("keeps the mark beside the column rather than inside it", () => {
		const { container } = render(<Logo below={<span>a tagline</span>} />);

		const column = screen.getByText("devvoted").parentElement;
		expect(column?.querySelector("svg")).toBeNull();
		expect(container.firstChild).toContainElement(
			container.querySelector("svg")
		);
	});

	it("keeps its own brand colours instead of taking the screen's theme", () => {
		const { container } = render(<Logo />);

		expect(container.firstChild).not.toHaveAttribute("data-screen-theme");
		expect(screen.getByText("devvoted")).toHaveClass("text-brand-bone");
		expect(container.querySelector("svg")).toHaveClass("text-brand-sand");
	});
});
