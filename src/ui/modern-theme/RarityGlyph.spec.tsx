import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { RARITY_ORDER } from "./rarity";
import { RarityCells, RarityGlyph } from "./RarityGlyph.ui";

const cellsIn = (container: HTMLElement) =>
	container.querySelectorAll("svg rect");

describe("RarityGlyph", () => {
	it.each([
		["bit", 1],
		["crumb", 2],
		["nibble", 4],
		["byte", 8],
	] as const)("draws %s as %i cells", (rarity, cells) => {
		const { container } = render(<RarityGlyph rarity={rarity} />);

		expect(cellsIn(container)).toHaveLength(cells);
	});

	it("draws no empty cell for the smallest grade", () => {
		const { container } = render(<RarityGlyph rarity="bit" />);

		expect(cellsIn(container)).toHaveLength(1);
	});

	it("names the grade for a reader while hiding the mark", () => {
		const { container } = render(<RarityGlyph rarity="nibble" />);

		expect(screen.getByText("nibble")).toHaveClass("sr-only");
		expect(container.querySelector("svg")).toHaveAttribute("aria-hidden");
	});

	it("holds the same width whatever the grade", () => {
		const widths = RARITY_ORDER.map((rarity) => {
			const { container } = render(<RarityGlyph rarity={rarity} />);
			return container.firstElementChild?.className;
		});

		expect(new Set(widths).size).toBe(1);
	});

	it("colours the mark by its grade", () => {
		const tones = RARITY_ORDER.map((rarity) => {
			const { container } = render(<RarityGlyph rarity={rarity} />);
			return container.querySelector("svg")?.getAttribute("class");
		});

		expect(tones[0]).toContain("text-pewter");
		expect(tones[3]).toContain("text-saffron");
		expect(new Set(tones).size).toBe(RARITY_ORDER.length);
	});

	it("keeps the two status colours out of the ladder", () => {
		const tones = RARITY_ORDER.map((rarity) => {
			const { container } = render(<RarityGlyph rarity={rarity} />);
			return container.querySelector("svg")?.getAttribute("class") ?? "";
		});

		expect(tones.some((tone) => /cinnabar|celadon/.test(tone))).toBe(false);
	});

	it("draws larger where it teaches the ladder than where it grades a row", () => {
		const { container: row } = render(<RarityGlyph rarity="bit" />);
		const { container: header } = render(
			<RarityGlyph rarity="bit" size="header" />
		);

		expect(row.querySelector("svg")).toHaveClass("size-4");
		expect(header.querySelector("svg")).toHaveClass("size-6");
	});
});

describe("RarityCells", () => {
	const cells = (container: HTMLElement) =>
		container.querySelectorAll("span span");

	it.each([
		["bit", 1],
		["crumb", 2],
		["nibble", 4],
		["byte", 8],
	] as const)("lays %s out as %i cells in a line", (rarity, count) => {
		const { container } = render(<RarityCells rarity={rarity} />);

		expect(cells(container)).toHaveLength(count);
	});

	it("keeps one box width whatever the grade", () => {
		const bit = render(<RarityCells rarity="bit" />).container;
		const byte = render(<RarityCells rarity="byte" />).container;

		expect(bit.firstElementChild?.className).toContain("w-16");
		expect(byte.firstElementChild?.className).toContain("w-16");
	});

	it("takes its grade's colour, so the size and the price are one mark", () => {
		const { container } = render(<RarityCells rarity="nibble" />);

		expect(container.firstElementChild?.className).toContain("text-lavender");
	});

	it("stays out of the accessibility tree", () => {
		const { container } = render(<RarityCells rarity="byte" />);

		expect(container.firstElementChild).toHaveAttribute("aria-hidden");
	});
});
