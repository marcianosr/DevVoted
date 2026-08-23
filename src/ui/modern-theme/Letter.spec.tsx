import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Letter } from "./Letter.ui";

describe("Letter", () => {
	it("stays readable to assistive tech, since the review names options by letter", () => {
		render(<Letter letter="B" />);

		expect(screen.getByText("B")).toBeInTheDocument();
	});

	it("greens an expected option and reddens a wrong one", () => {
		const { container: expected } = render(
			<Letter letter="A" tone="celadon" />
		);
		const { container: wrong } = render(<Letter letter="B" tone="cinnabar" />);

		expect(expected.firstChild).toHaveClass("border-celadon", "text-celadon");
		expect(wrong.firstChild).toHaveClass("border-cinnabar", "text-cinnabar");
	});

	it("rests muted, which is how an untouched option reads", () => {
		const { container } = render(<Letter letter="C" />);

		expect(container.firstChild).toHaveClass("border-edge-strong");
	});

	it("takes the caller's classes, so a poll can drive it from its radio", () => {
		const { container } = render(
			<Letter letter="A" className="peer-checked:text-theme" />
		);

		expect(container.firstChild).toHaveClass("peer-checked:text-theme");
	});
});
