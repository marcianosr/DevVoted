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
});
