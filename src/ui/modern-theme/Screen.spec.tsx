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

		expect(container.firstChild?.firstChild).toHaveClass("max-w-6xl", "w-full");
	});

	// The tint is the page's atmosphere, so it fills the page while the content it
	// sits behind stays capped and centred in it.
	it("fills the page with the gate's tint and centres the content in it", () => {
		const { container } = render(<Screen theme="volcano">body</Screen>);

		expect(container.firstChild).toHaveClass(
			"min-h-[var(--screen-floor,100vh)]",
			"w-full",
			"items-center",
			"justify-center",
			"bg-theme-faint"
		);
		expect(container.firstChild).not.toHaveClass("max-w-6xl");
	});

	// The viewport is not always the screen's alone: /proto-run stacks a dev rig
	// under it. A page that does sets --screen-floor to 0, and flex-1 is what
	// hands the screen the rest of the height instead.
	it("takes the height its page leaves it, rather than always a full viewport", () => {
		const { container } = render(<Screen>body</Screen>);

		expect(container.firstChild).toHaveClass("flex-1");
	});
});
