import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Chip, chipFigures } from "./Chip.ui";

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

describe(chipFigures, () => {
	it("chips the multiplier a config's sentence quotes", () => {
		render(<p>{chipFigures("Vue polls pay 1.25× coverage.")}</p>);

		expect(screen.getByText("1.25×").closest(".text-celadon")).not.toBeNull();
	});

	it("chips every figure in a sentence that states more than one", () => {
		const { container } = render(
			<p>{chipFigures("All coverage earns ×1.25, fading ×0.9 each clear.")}</p>
		);

		expect(container.querySelectorAll("span.bg-celadon\\/15")).toHaveLength(2);
	});

	it("colours a figure by its sign, the way Delta does", () => {
		render(<p>{chipFigures("A miss costs −0.5 coverage.")}</p>);

		expect(screen.getByText("−0.5").closest(".text-cinnabar")).not.toBeNull();
	});

	it("keeps the storage suffix inside the chip rather than orphaning it", () => {
		render(<p>{chipFigures("+32KB storage on gate clear.")}</p>);

		expect(screen.getByText("+32KB")).toBeInTheDocument();
	});

	// Odds are two numbers making one fact; badging the first would read as a
	// figure the config pays out.
	it("leaves a bare integer as prose", () => {
		const { container } = render(
			<p>
				{chipFigures("1 in 4 gate clears: a random config upgrades, free.")}
			</p>
		);

		expect(container.querySelector("span")).toBeNull();
	});
});
