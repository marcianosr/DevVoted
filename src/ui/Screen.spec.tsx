import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Screen } from "./Screen.ui";

describe(Screen.name, () => {
	it("renders its children", () => {
		render(
			<Screen>
				<p>Gruntilda&apos;s Lair</p>
			</Screen>
		);
		expect(screen.getByText("Gruntilda's Lair")).toBeInTheDocument();
	});

	it("applies the requested width, transition and theme", () => {
		const { container } = render(
			<Screen width="narrow" transition="fade" categoryCode="js">
				content
			</Screen>
		);
		const section = container.querySelector("section");
		expect(section).toHaveAttribute("data-screen-transition", "fade");
		expect(section).toHaveAttribute("data-category-theme", "js");
		expect(section?.className).toContain("sm:max-w-2xl");
	});

	it("defaults to no transition", () => {
		const { container } = render(<Screen>content</Screen>);
		expect(container.querySelector("section")).toHaveAttribute(
			"data-screen-transition",
			"none"
		);
	});
});
