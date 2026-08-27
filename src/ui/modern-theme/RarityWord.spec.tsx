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

		expect(screen.getByText("common")).toHaveClass("text-cerulean");
		expect(screen.getByText("uncommon")).toHaveClass("text-viridian");
		expect(screen.getByText("rare")).toHaveClass("text-cinnabar");
	});

	// It sits inside a dot-separated facts line the caller punctuates, so a
	// separator of its own would double up with the caller's.
	it("brings no separator of its own", () => {
		const { container } = render(<RarityWord rarity="rare" />);

		expect(container.textContent).toBe("rare");
	});
});
