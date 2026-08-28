import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Chip, chipFigures } from "./Chip.ui";

describe("Chip", () => {
	it("names the config", () => {
		render(<Chip rarity="bit">ESLint</Chip>);

		expect(screen.getByText("ESLint")).toBeInTheDocument();
	});

	it("puts a graded chip on the same fill as its tone siblings", () => {
		const { container } = render(<Chip rarity="crumb">Intellisense</Chip>);

		expect(container.firstChild).toHaveClass("bg-surface-raised");
	});

	it("sizes a graded chip like its tone siblings, not a step up", () => {
		render(<Chip rarity="bit">.js 1.25</Chip>);

		expect(screen.getByText(".js 1.25")).toHaveClass("text-xs");
	});

	it("draws the grade glyph on a large chip and not on a small one", () => {
		const { container: small } = render(<Chip rarity="byte">Freemium</Chip>);
		const { container: large } = render(
			<Chip rarity="byte" size="lg">
				Freemium
			</Chip>
		);

		expect(small.querySelector("svg")).toBeNull();
		expect(large.querySelectorAll("svg rect")).toHaveLength(8);
	});

	it("carries no grade colour, so a chip cannot be mistaken for a gate", () => {
		const { container } = render(<Chip rarity="nibble">Prefetch</Chip>);

		expect((container.firstChild as HTMLElement).className).not.toMatch(
			/cerulean|viridian|cinnabar|legendary/
		);
	});

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

	it("leaves a bare integer as prose", () => {
		const { container } = render(
			<p>
				{chipFigures("1 in 4 gate clears: a random config upgrades, free.")}
			</p>
		);

		expect(container.querySelector("span")).toBeNull();
	});
});
