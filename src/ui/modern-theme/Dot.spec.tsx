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

		expect(common.firstChild).toHaveClass("bg-celadon");
		expect(legendary.firstChild).toHaveClass("bg-legendary");
	});
});
