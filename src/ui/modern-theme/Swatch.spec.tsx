import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { Swatch } from "./Swatch.ui";

describe("Swatch", () => {
	it("wears the ambient gate colour when no theme is named", () => {
		const { container } = render(<Swatch />);

		expect(container.firstChild).toHaveClass("bg-theme");
		expect(container.firstChild).not.toHaveAttribute("data-swatch-theme");
	});

	it("overrides the ambient colour for this square only", () => {
		const { container } = render(<Swatch theme="volcano" />);

		expect(container.firstChild).toHaveAttribute(
			"data-swatch-theme",
			"volcano"
		);
	});

	it("draws a pip smaller and less rounded than a badge", () => {
		const { container: pip } = render(<Swatch size="pip" />);
		const { container: badge } = render(<Swatch size="badge" />);

		expect(pip.firstChild).toHaveClass("size-4");
		expect(badge.firstChild).toHaveClass("size-5", "rounded-md");
	});
});
