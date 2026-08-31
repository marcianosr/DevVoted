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

	// Standing on a gate is not clearing it, so the one square the player is on
	// shows the shape and the colour of what it would pay, and no fill.
	it("rings the current gate without filling it", () => {
		const { container } = render(<Swatch state="current" />);

		expect(container.firstChild).toHaveClass("outline-theme");
		expect(container.firstChild).not.toHaveClass("bg-theme");
	});

	it("fills only the swatch a gate has actually handed over", () => {
		const { container } = render(<Swatch state="earned" />);

		expect(container.firstChild).toHaveClass("bg-theme");
	});

	it("draws a pip smaller and less rounded than a badge", () => {
		const { container: pip } = render(<Swatch size="pip" />);
		const { container: badge } = render(<Swatch size="badge" />);

		expect(pip.firstChild).toHaveClass("size-3");
		expect(badge.firstChild).toHaveClass("size-5", "rounded-md");
	});

	it("hollows a gate reached but not won, and fills one that is yours", () => {
		const { container: pending } = render(<Swatch state="pending" />);
		const { container: earned } = render(<Swatch state="earned" />);

		expect(pending.firstChild).toHaveClass("border-dashed");
		expect(pending.firstChild).not.toHaveClass("bg-theme");
		expect(earned.firstChild).toHaveClass("bg-theme");
	});

	it("glows only at award size, where the square is big enough to carry it", () => {
		const { container: pip } = render(<Swatch size="pip" />);
		const { container: award } = render(<Swatch size="award" />);

		expect(pip.firstChild).not.toHaveClass("glow-theme");
		expect(award.firstChild).toHaveClass("size-24", "glow-theme");
	});

	it("takes the Kanto gradient for the one swatch app.css gives no colour", () => {
		const { container: flat } = render(<Swatch theme="volcano" />);
		const { container: fill } = render(
			<Swatch theme="champion" finish="fill" />
		);

		expect(flat.firstChild).not.toHaveClass("bg-legendary");
		expect(fill.firstChild).toHaveClass("bg-legendary");
	});
});
