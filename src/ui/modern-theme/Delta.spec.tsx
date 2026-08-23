import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Delta } from "./Delta.ui";

const badgeAround = (text: string) => screen.getByText(text).parentElement;

describe("Delta", () => {
	it("badges a gain celadon and signs it", () => {
		render(<Delta kb={16} />);

		expect(badgeAround("+16 KB")).toHaveClass("bg-celadon/15");
	});

	it("badges a debt cinnabar and signs it with a minus", () => {
		render(<Delta kb={-128} />);

		expect(badgeAround("\u2212128 KB")).toHaveClass("bg-cinnabar/15");
	});

	it("keeps a flat balance muted rather than calling it a gain", () => {
		render(<Delta kb={0} />);

		expect(badgeAround("+0 KB")).toHaveClass("bg-zinc-100/10");
	});

	it("states a coverage figure bare, since KB is not what it measures", () => {
		const { container } = render(<Delta coverage={2.6} />);

		expect(badgeAround("+2.6")).toHaveClass("bg-celadon/15");
		expect(container).not.toHaveTextContent("KB");
	});

	it("reddens a coverage figure the poll lost", () => {
		render(<Delta coverage={-1.4} />);

		expect(badgeAround("\u22121.4")).toHaveClass("bg-cinnabar/15");
	});

	it("badges a multiplier as the gain it is, not as neutral trivia", () => {
		render(<Delta multiplier={1.5} />);

		expect(badgeAround("\u00d71.5")).toHaveClass("bg-celadon/15");
	});
});
