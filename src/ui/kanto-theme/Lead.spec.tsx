import { gateSwatchAt } from "~/test/swatchTrack.factory";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Lead, type LeadLine, leadTextOf } from "./Lead.ui";

const VERMILION = gateSwatchAt(3);

const draw = (line: LeadLine, variant?: "paragraph") =>
	render(<Lead line={line} {...(variant === undefined ? {} : { variant })} />);

const badgeFor = (figure: string): HTMLElement | null =>
	screen.getByText(figure).closest("span");

describe("Lead sets figures inside a sentence", () => {
	it("reads as one sentence, words and figures together", () => {
		const { container } = draw([
			"You have scored ",
			{ figure: "6.2", gain: true },
			" out of ",
			{ figure: "15" },
			" slots.",
		]);

		expect(container.textContent).toBe("You have scored 6.2 out of 15 slots.");
	});

	it("greens a gain and leaves a plain figure neutral", () => {
		draw([{ figure: "6.2", gain: true }, " of ", { figure: "15" }]);

		expect(badgeFor("6.2")).toHaveAttribute("data-screen-theme", "viridian");
		expect(badgeFor("15")).toHaveAttribute("data-screen-theme", "pewter");
	});

	it("bands a figure in its own colour, so a poor score cannot read as a gain", () => {
		draw([
			{ figure: "0.0%", band: "danger" },
			" and ",
			{ figure: "6.2", gain: true },
		]);

		expect(badgeFor("0.0%")).toHaveAttribute("data-screen-theme", "cinnabar");
		expect(badgeFor("6.2")).toHaveAttribute("data-screen-theme", "viridian");
	});

	it("names a band in its own colour, so the word and the bar agree", () => {
		draw(["land in ", { band: "danger" }, " and the run ends"]);

		expect(badgeFor("DANGER")).toHaveAttribute("data-screen-theme", "cinnabar");
	});

	it("runs as a hint until a call site asks for something bigger", () => {
		const { container } = draw(["small"]);
		expect(container.firstChild).toHaveClass("text-xs");

		const { container: big } = draw(["large"], "paragraph");
		expect(big.firstChild).toHaveClass("text-base");
	});

	it("draws a line of plain words without boxing any of it", () => {
		const { container } = draw(["Nothing here is worth boxing."]);

		expect(container.querySelectorAll("[data-screen-theme]")).toHaveLength(0);
	});

	it("marks a swatch figure with the gate's own square", () => {
		const { container } = draw([
			"earns ",
			{ swatch: VERMILION, label: "Vermilion swatch" },
		]);

		expect(screen.getByText("Vermilion swatch")).toBeInTheDocument();
		expect(
			container.querySelector('[data-swatch-theme="gate-vermilion"]')
		).not.toBeNull();
	});

	it("reads a swatch figure back as its label, so a key and a screen reader agree", () => {
		expect(
			leadTextOf(["earns ", { swatch: VERMILION, label: "Vermilion swatch" }])
		).toBe("earns Vermilion swatch");
	});

	it("takes the tag a call site asks for, so a statement need not be a heading", () => {
		const { container } = render(
			<Lead line={["Finish at ", { band: "ok" }]} variant="title" as="span" />
		);

		expect(container.firstChild?.nodeName).toBe("SPAN");
		expect(container.querySelector("h2")).toBeNull();
	});
});
