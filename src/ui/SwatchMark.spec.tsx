import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
	SwatchMark,
	swatchBorderClass,
	swatchNameClass,
} from "~/ui/SwatchMark.component";

describe("SwatchMark", () => {
	it("renders a flat finish as the plain theme swatch", () => {
		render(<SwatchMark finish="flat" />);
		expect(screen.getByTestId("swatch")).toBeInTheDocument();
	});

	it("renders a plate finish with a rim so indigo stays visible on the page", () => {
		render(<SwatchMark finish="plate" />);
		const mark = screen.getByTestId("swatch-mark");
		expect(mark.className).toContain("ring-pewter");
		expect(mark.className).toContain("bg-theme");
	});

	it("renders a fill finish with the legendary gradient, not a theme colour", () => {
		render(<SwatchMark finish="fill" />);
		const mark = screen.getByTestId("swatch-mark");
		expect(mark.className).toContain("bg-legendary");
		expect(mark.className).not.toContain("bg-theme");
	});

	it("scales the mark with the size prop", () => {
		render(<SwatchMark finish="plate" size="lg" />);
		expect(screen.getByTestId("swatch-mark").className).toContain("h-6");
	});
});

describe("swatchNameClass", () => {
	it("colours a flat swatch's name in its own theme", () => {
		expect(swatchNameClass("flat")).toBe("text-theme");
	});

	it("falls back to zinc for plate and fill, whose colours cannot carry text", () => {
		expect(swatchNameClass("plate")).toBe("text-zinc-100");
		expect(swatchNameClass("fill")).toBe("text-zinc-100");
	});
});

describe("swatchBorderClass", () => {
	it("matches each finish's border to its chip: theme, pewter rim, legendary ring", () => {
		expect(swatchBorderClass("flat")).toBe("border-theme");
		expect(swatchBorderClass("plate")).toBe("border-pewter");
		expect(swatchBorderClass("fill")).toBe("border-transparent legendary-ring");
	});
});
