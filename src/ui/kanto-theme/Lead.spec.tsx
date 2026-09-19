import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Lead, type LeadLine } from "./Lead.ui";

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
});
