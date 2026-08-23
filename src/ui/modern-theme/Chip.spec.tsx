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

	it("gives a raised chip a surface instead of a meaning", () => {
		const { container } = render(<Chip tone="raised">+90 KB</Chip>);

		expect(container.firstChild).toHaveClass(
			"bg-surface-raised",
			"text-zinc-100"
		);
	});

	it("grows a large chip in both axes so a figure reads as one", () => {
		const { container: small } = render(<Chip tone="raised">+90 KB</Chip>);
		const { container: large } = render(
			<Chip tone="raised" size="lg">
				+90 KB
			</Chip>
		);

		expect(small.firstChild).toHaveClass("px-2", "py-0.5", "rounded-md");
		expect(large.firstChild).toHaveClass("px-4", "py-2", "rounded-lg");
	});

	it("tints a category chip instead of outlining it", () => {
		const { container } = render(<Chip tone="cerulean">typescript</Chip>);

		expect(container.firstChild).toHaveClass("bg-cerulean/15", "text-cerulean");
		expect(container.firstChild).not.toHaveClass("border");
	});
});
