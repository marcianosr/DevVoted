import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Verdict } from "./Verdict.ui";

const WORD = {
	correct: "PASS",
	partial: "PART",
	wrong: "FAIL",
} as const;

describe("Verdict", () => {
	it.each([
		["correct", "PASS"],
		["partial", "PART"],
		["wrong", "FAIL"],
	] as const)("states a %s answer as %s", (outcome, word) => {
		render(<Verdict outcome={outcome} />);

		expect(screen.getByText(word)).toBeInTheDocument();
	});

	it.each([
		["correct", "viridian"],
		["partial", "saffron"],
		["wrong", "cinnabar"],
	] as const)("themes a %s answer %s", (outcome, color) => {
		render(<Verdict outcome={outcome} />);

		expect(screen.getByText(WORD[outcome])).toHaveAttribute(
			"data-screen-theme",
			color
		);
	});

	it("reads the word itself rather than hiding it behind a glyph", () => {
		render(<Verdict outcome="wrong" />);

		expect(screen.getByText("FAIL")).not.toHaveClass("sr-only");
		expect(screen.queryByText("✗")).not.toBeInTheDocument();
	});

	it("wears a badge, like every other figure on the row", () => {
		render(<Verdict outcome="correct" />);

		expect(screen.getByText("PASS")).toHaveClass("badge-theme");
	});

	it("holds every outcome in the same width so a column of them lines up", () => {
		const { container } = render(<Verdict outcome="partial" />);

		expect(container.firstElementChild).toHaveClass("w-24", "shrink-0");
	});

	it.each([
		[0.25, "PART ¼"],
		[0.5, "PART ½"],
		[0.75, "PART ¾"],
	])("names the rung a %f share earned as %s", (share, word) => {
		render(<Verdict outcome="partial" share={share} />);

		expect(screen.getByText(word)).toBeInTheDocument();
	});

	it("states a partial without its share as the bare word", () => {
		render(<Verdict outcome="partial" />);

		expect(screen.getByText("PART")).toBeInTheDocument();
	});

	it.each(["correct", "wrong"] as const)(
		"leaves a %s answer unqualified, a share being a partial's alone",
		(outcome) => {
			render(<Verdict outcome={outcome} share={0.5} />);

			expect(screen.getByText(WORD[outcome])).toBeInTheDocument();
		}
	);
});
