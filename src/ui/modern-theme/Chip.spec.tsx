import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Chip } from "./Chip.ui";

describe("Chip", () => {
	it("names the config", () => {
		render(<Chip rarity="common">ESLint</Chip>);

		expect(screen.getByText("ESLint")).toBeInTheDocument();
	});

	it("borders each tier in its own colour", () => {
		const { container: uncommon } = render(
			<Chip rarity="uncommon">Intellisense</Chip>
		);
		const { container: rare } = render(<Chip rarity="rare">AGENTS.md</Chip>);

		expect(uncommon.firstChild).toHaveClass("border-cerulean");
		expect(rare.firstChild).toHaveClass("border-cinnabar");
	});

	it("gives legendary the gradient ring instead of a single colour", () => {
		const { container } = render(<Chip rarity="legendary">Freemium</Chip>);

		expect(container.firstChild).toHaveClass(
			"legendary-ring",
			"border-transparent"
		);
	});

	it("tints a category chip instead of outlining it", () => {
		const { container } = render(<Chip tone="cerulean">typescript</Chip>);

		expect(container.firstChild).toHaveClass("bg-cerulean/15", "text-cerulean");
		expect(container.firstChild).not.toHaveClass("border");
	});
});
