import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { Glyph, type GlyphName } from "./Glyph.ui";

const NAMES = [
	"rebuild",
	"extend",
	"tag",
	"uninstall",
	"fold",
] as const satisfies readonly GlyphName[];

describe("Glyph", () => {
	it.each(NAMES)("draws %s without announcing it", (name) => {
		const { container } = render(<Glyph name={name} />);

		const svg = container.querySelector("svg");
		expect(svg).toHaveAttribute("aria-hidden");
		expect(svg?.childElementCount).toBeGreaterThan(0);
	});

	it("takes the colour of whatever it sits in", () => {
		const { container } = render(<Glyph name="rebuild" />);

		expect(container.querySelector("svg")).toHaveAttribute(
			"stroke",
			"currentColor"
		);
	});
});
