import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { RarityStripe } from "./RarityStripe.ui";

describe("RarityStripe", () => {
	it("wears the tier's own colour", () => {
		const { container } = render(<RarityStripe rarity="uncommon" />);

		expect(container.querySelector(".w-1.rounded-full")).toHaveClass(
			"bg-viridian"
		);
	});

	it("gives the legendary the gradient, having no single colour to wear", () => {
		const { container } = render(<RarityStripe rarity="legendary" />);

		expect(container.querySelector(".w-1.rounded-full")).toHaveClass(
			"bg-legendary"
		);
	});

	// The bar is aria-hidden like every Dot, so the tier has to ride along as
	// text: the word left the screen, not the document.
	it("names the tier for a reader who cannot see the bar", () => {
		render(<RarityStripe rarity="rare" />);

		expect(screen.getByText("rare")).toHaveClass("sr-only");
	});

	// A bar, never a disc: the status dot beside it on the same row means
	// something else entirely.
	it("is a bar rather than a dot, so it cannot be read as a status", () => {
		const { container } = render(<RarityStripe rarity="common" />);

		const bar = container.querySelector(".w-1.rounded-full");
		expect(bar).toHaveClass("h-4");
		expect(container.querySelector(".size-1\\.5")).toBeNull();
	});
});
