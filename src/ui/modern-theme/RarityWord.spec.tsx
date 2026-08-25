import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { RarityWord } from "./RarityWord.ui";

describe("RarityWord", () => {
	// The colour and the weight used to sit on the same element as Text's own
	// variants, which left the winner to Tailwind's source order and rendered the
	// word grey and unbolded.
	it("carries the rarity's own colour and weight, not the row's", () => {
		render(<RarityWord rarity="legendary" />);

		expect(screen.getByText("legendary")).toHaveClass(
			"font-bold",
			"text-legendary"
		);
	});

	it("colours each grade in its own", () => {
		render(
			<>
				<RarityWord rarity="common" />
				<RarityWord rarity="uncommon" />
				<RarityWord rarity="rare" />
			</>
		);

		expect(screen.getByText("common")).toHaveClass("text-celadon");
		expect(screen.getByText("uncommon")).toHaveClass("text-cerulean");
		expect(screen.getByText("rare")).toHaveClass("text-cinnabar");
	});

	// The middot separates the label from the grade; read aloud it would be noise
	// on every config row on the screen.
	it("keeps its separator out of the accessible name", () => {
		render(<RarityWord rarity="rare" />);

		expect(screen.getByText("rare")).toBeInTheDocument();
		expect(screen.getByText("·")).toHaveAttribute("aria-hidden", "true");
	});
});
