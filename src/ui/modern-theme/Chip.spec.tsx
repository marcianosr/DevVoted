import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Chip, chipFigures } from "./Chip.ui";

describe("Chip", () => {
	it("names the config", () => {
		render(<Chip rarity="common">ESLint</Chip>);

		expect(screen.getByText("ESLint")).toBeInTheDocument();
	});

	// Keyed by the stripe, not by a ring: a config chip beside plain factor chips
	// in the equation has to read as one of them.
	it("keys each tier with its own stripe, on the same fill as its siblings", () => {
		const { container: uncommon } = render(
			<Chip rarity="uncommon">Intellisense</Chip>
		);
		const { container: rare } = render(<Chip rarity="rare">AGENTS.md</Chip>);

		expect(uncommon.querySelector(".w-1.rounded-full")).toHaveClass(
			"bg-viridian"
		);
		expect(rare.querySelector(".w-1.rounded-full")).toHaveClass("bg-cinnabar");
		expect(uncommon.firstChild).toHaveClass("bg-surface-raised");
	});

	it("sizes a rarity chip like its tone siblings, not a step up", () => {
		render(<Chip rarity="common">.js 1.25</Chip>);

		expect(screen.getByText(".js 1.25")).toHaveClass("text-xs");
	});

	it("gives legendary the gradient in its stripe, having no single colour", () => {
		const { container } = render(<Chip rarity="legendary">Freemium</Chip>);

		expect(container.querySelector(".w-1.rounded-full")).toHaveClass(
			"bg-legendary"
		);
	});

	// The rail's chip grammar: outlined is what a thing WOULD do, filled is
	// what it DID.
	it("outlines a chip instead of filling it when asked to speak in woulds", () => {
		const { container } = render(
			<Chip tone="muted" outline>
				×1.25
			</Chip>
		);

		expect(container.firstChild).toHaveClass("border", "border-edge-strong");
		expect(container.firstChild).not.toHaveClass("bg-zinc-100/10");
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
