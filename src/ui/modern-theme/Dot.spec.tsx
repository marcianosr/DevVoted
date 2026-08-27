import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { Dot } from "./Dot.ui";

describe("Dot", () => {
	it("is hidden from assistive tech, since the legend spells the tier out", () => {
		const { container } = render(<Dot rarity="common" />);

		expect(container.firstChild).toHaveAttribute("aria-hidden");
	});

	it("fills each tier in its own colour", () => {
		const { container: common } = render(<Dot rarity="common" />);
		const { container: legendary } = render(<Dot rarity="legendary" />);

		expect(common.firstChild).toHaveClass("bg-cerulean");
		expect(legendary.firstChild).toHaveClass("bg-legendary");
	});

	it("is round unless asked for a box, which keys a chip", () => {
		const { container: disc } = render(<Dot tone="saffron" />);
		const { container: box } = render(<Dot tone="saffron" shape="box" />);

		expect(disc.firstChild).toHaveClass("rounded-full");
		expect(box.firstChild).toHaveClass("rounded-xs");
		expect(box.firstChild).not.toHaveClass("rounded-full");
	});

	// The size lives in the variant, not the base: two width utilities on one
	// element leaves the winner to Tailwind's source order.
	it("stands as a rail when asked, keying the row shape rather than a chip", () => {
		const { container } = render(<Dot rarity="rare" shape="bar" />);

		expect(container.firstChild).toHaveClass("h-4", "w-1", "bg-cinnabar");
		expect(container.firstChild).not.toHaveClass("size-1.5");
	});
});
