import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Figures } from "./Figures.ui";

describe("Figures", () => {
	it("badges a figure and leaves the prose around it alone", () => {
		const { container } = render(<Figures text="All coverage earns ×3." />);

		expect(screen.getByText("×3")).toHaveClass("badge-theme");
		expect(container.textContent).toBe("All coverage earns ×3.");
	});

	it("paints a gain viridian", () => {
		render(<Figures text="earns ×3" />);

		expect(screen.getByText("×3")).toHaveAttribute(
			"data-screen-theme",
			"viridian"
		);
	});

	it("paints a sub-1 multiplier as a term, not a loss", () => {
		render(<Figures text="fading ×0.5 each gate clear" />);

		expect(screen.getByText("×0.5")).toHaveAttribute(
			"data-screen-theme",
			"saffron"
		);
	});

	it("paints a signed loss cinnabar", () => {
		render(<Figures text="leaking −16 KB a poll" />);

		expect(screen.getByText("−16 KB")).toHaveAttribute(
			"data-screen-theme",
			"cinnabar"
		);
	});

	it("lets the caller retone a gain without touching losses", () => {
		render(<Figures text="At ×2 now, burning −8 KB" gain="saffron" />);

		expect(screen.getByText("×2")).toHaveAttribute(
			"data-screen-theme",
			"saffron"
		);
		expect(screen.getByText("−8 KB")).toHaveAttribute(
			"data-screen-theme",
			"cinnabar"
		);
	});

	it("badges a trailing-× multiplier as well as a leading one", () => {
		render(<Figures text="pays 1.25× coverage" />);

		expect(screen.getByText("1.25×")).toHaveClass("badge-theme");
	});

	it("badges additions and percentages", () => {
		render(<Figures text="+0.5 coverage and +25% of held storage" />);

		expect(screen.getByText("+0.5")).toHaveClass("badge-theme");
		expect(screen.getByText("+25%")).toHaveClass("badge-theme");
	});

	it("badges nothing in prose that carries no figure", () => {
		const { container } = render(
			<Figures text="Cross out a wrong answer for an escalating fee." />
		);

		expect(container.querySelector(".badge-theme")).toBeNull();
	});

	it("badges a poll category, and leaves it uncoloured like a price", () => {
		render(<Figures text="JavaScript polls earn 1.25× coverage." />);

		const category = screen.getByText("JavaScript");

		expect(category).toHaveClass("badge-theme");
		expect(category).not.toHaveAttribute("data-screen-theme");
	});

	it("keeps a two-word category whole", () => {
		const { container } = render(
			<Figures text="Answer 10 General Backend polls correctly" />
		);

		expect(screen.getByText("General Backend")).toHaveClass("badge-theme");
		expect(container.textContent).toBe(
			"Answer 10 General Backend polls correctly"
		);
	});

	it("does not tear JavaScript into a badged Java", () => {
		render(<Figures text="JavaScript polls earn 1.25× coverage." />);

		expect(screen.queryByText("Java")).not.toBeInTheDocument();
	});

	it("leaves a lower-cased category alone, because that register is not a name", () => {
		const { container } = render(<Figures text="javascript 3 · ruby 2" />);

		expect(container.querySelector(".badge-theme")).toBeNull();
	});

	it("paints a band word in the ladder's own colour", () => {
		render(<Figures text="clear HEALTHY or better" />);

		expect(screen.getByText("HEALTHY")).toHaveAttribute(
			"data-screen-theme",
			"viridian"
		);
	});

	it("keeps every figure in a line that carries several", () => {
		render(<Figures text="earns ×3, fading ×0.5, deleted at ×1" />);

		expect(screen.getByText("×3")).toBeInTheDocument();
		expect(screen.getByText("×0.5")).toBeInTheDocument();
		expect(screen.getByText("×1")).toBeInTheDocument();
	});

	it("badges a price that carries no sign, and leaves it uncoloured", () => {
		render(<Figures text="8 offers · 32 KB a slot" />);

		const price = screen.getByText("32 KB");

		expect(price).toHaveClass("badge-theme");
		expect(price).not.toHaveAttribute("data-screen-theme");
	});

	it("badges an unsigned percentage the same way", () => {
		render(<Figures text="opens once a run has held 92.5%" />);

		expect(screen.getByText("92.5%")).toHaveClass("badge-theme");
	});

	it("leaves a bare count alone, since a count is not money", () => {
		const { container } = render(
			<Figures text="peeked the community split 5 times" />
		);

		expect(container.querySelector(".badge-theme")).toBeNull();
	});
});
