import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Screen } from "./Screen.ui";

describe("Screen", () => {
	it("hands its subtree the gate's colour", () => {
		const { container } = render(<Screen theme="lavender">body</Screen>);

		expect(container.firstChild).toHaveAttribute("data-gate-theme", "lavender");
	});

	// :root already sets --theme-color, so an unthemed screen inherits cerulean
	// rather than rendering colourless.
	it("claims no gate when none is given", () => {
		const { container } = render(<Screen>body</Screen>);

		expect(container.firstChild).not.toHaveAttribute("data-gate-theme");
	});

	it("is one article, so a screen is one landmark", () => {
		render(<Screen theme="volcano">body</Screen>);

		expect(screen.getByRole("article")).toHaveTextContent("body");
	});

	// A row with its label at one edge and its figure at the other stops reading
	// as one row on a wide monitor.
	it("caps and centres its content, rather than running the full page", () => {
		const { container } = render(<Screen>body</Screen>);

		expect(container.firstChild?.firstChild).toHaveClass(
			"max-w-6xl",
			"mx-auto",
			"w-full"
		);
	});

	// The tint is the page's atmosphere, so it reaches both edges while the
	// content it sits behind stays capped.
	it("spreads the gate's tint the full width of the page", () => {
		const { container } = render(<Screen theme="volcano">body</Screen>);

		expect(container.firstChild).toHaveClass("w-full", "bg-theme-faint");
		expect(container.firstChild).not.toHaveClass("max-w-6xl");
	});
});
