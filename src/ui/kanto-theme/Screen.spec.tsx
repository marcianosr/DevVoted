import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { KANTO_COLORS } from "./colors";
import { gateRoster } from "~/test/swatchTrack.factory";

import { Screen } from "./Screen.ui";

const appCss = readFileSync("src/styles/app.css", "utf8");

describe("Screen", () => {
	it.each(KANTO_COLORS)("hands its subtree the %s colour", (name) => {
		const { container } = render(<Screen theme={name}>body</Screen>);

		expect(container.firstChild).toHaveAttribute("data-screen-theme", name);
	});

	it.each(KANTO_COLORS)("resolves %s to a theme colour in app.css", (name) => {
		expect(appCss).toContain(`[data-screen-theme="${name}"]`);
	});

	it("renders its children inside the themed element", () => {
		const { container } = render(<Screen theme="cinnabar">body</Screen>);

		expect(screen.getByText("body")).toBeInTheDocument();
		expect(container.firstChild).toHaveTextContent("body");
	});

	it("paints its own ground rather than mirroring onto the body", () => {
		const { container } = render(<Screen theme="cinnabar">body</Screen>);

		expect(container.firstChild).toHaveClass("bg-theme-faint");
		expect(document.body).not.toHaveAttribute("data-screen-theme");
	});

	it("sheds ground, edge and rounding together when asked to go bare", () => {
		const { container } = render(
			<Screen theme="cinnabar" ground="bare">
				body
			</Screen>
		);

		expect(container.firstChild).not.toHaveClass("bg-theme-faint");
		expect(container.firstChild).not.toHaveClass("border-theme-faint");
		expect(container.firstChild).not.toHaveClass("rounded-3xl");
	});

	it("keeps its width and its frame padding when bare, being still a screen", () => {
		const { container } = render(
			<Screen theme="cinnabar" ground="bare">
				body
			</Screen>
		);

		expect(container.firstChild).toHaveClass("max-w-[900px]", "mx-auto");
		expect(container.firstChild?.firstChild).toHaveClass("p-4", "sm:p-8");
	});

	it("edges itself with the faintest theme rung app.css defines", () => {
		const { container } = render(<Screen theme="cinnabar">body</Screen>);

		expect(container.firstChild).toHaveClass("border-theme-faint");
		expect(appCss).toContain("@utility border-theme-faint");
	});

	it("frames its body, widening the frame once there is room for it", () => {
		const { container } = render(<Screen theme="pallet">body</Screen>);

		expect(container.firstChild?.firstChild).toHaveClass("p-4", "sm:p-8");
	});

	it("caps its width by default, rather than running the full page", () => {
		const { container } = render(<Screen theme="pallet">body</Screen>);

		expect(container.firstChild).toHaveClass("max-w-[900px]", "mx-auto");
	});

	it("takes a narrower cap for a screen that reads as one column", () => {
		const { container } = render(
			<Screen theme="pallet" width="narrow">
				body
			</Screen>
		);

		expect(container.firstChild).toHaveClass("max-w-2xl");
		expect(container.firstChild).not.toHaveClass("max-w-[900px]");
	});

	it("wears a gate's own theme when given a gate rather than a colour", () => {
		const { container } = render(
			<Screen gate="boulder">
				<span />
			</Screen>
		);

		expect(container.firstChild).toHaveAttribute("data-gate-theme", "boulder");
		expect(container.firstChild).not.toHaveAttribute("data-screen-theme");
	});

	it("wears a colour when given one, and claims no gate", () => {
		const { container } = render(
			<Screen theme="viridian">
				<span />
			</Screen>
		);

		expect(container.firstChild).toHaveAttribute(
			"data-screen-theme",
			"viridian"
		);
		expect(container.firstChild).not.toHaveAttribute("data-gate-theme");
	});

	it.each(gateRoster.map((swatch) => swatch.theme))(
		"finds a declared ground for the %s gate",
		(theme) => {
			expect(appCss).toContain(`[data-gate-theme="${theme}"]`);
		}
	);

	it("floors the ground's chroma, so an achromatic gate still tints", () => {
		expect(appCss).toContain("--theme-ground-floor:");

		const block = appCss.slice(appCss.indexOf("@utility bg-theme-faint {"));
		const body = block.slice(0, block.indexOf("\n}"));
		expect(body).toContain("max(c * var(--theme-ground-chroma)");
		expect(body).toContain("var(--theme-ground-floor)");
	});
});
