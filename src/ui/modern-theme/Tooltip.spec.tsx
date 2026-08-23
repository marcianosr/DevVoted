import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Tooltip } from "./Tooltip.ui";

describe("Tooltip", () => {
	it("leaves the trigger to the caller rather than wrapping one of its own", () => {
		render(
			<Tooltip hint="Remove these and open the shop">
				<button type="button">Remove and go to shop</button>
			</Tooltip>
		);

		expect(screen.getAllByRole("button")).toHaveLength(1);
	});

	it("keeps the panel hidden until the trigger is hovered or focused", () => {
		render(
			<Tooltip hint="This didn't run">
				<span />
			</Tooltip>
		);

		// jsdom loads no stylesheet, so the reveal is asserted on the classes that
		// carry it rather than by hovering.
		expect(screen.getByText("This didn't run").parentElement).toHaveClass(
			"hidden",
			"group-hover/tip:block",
			"group-focus-within/tip:block"
		);
	});

	it("hangs the hover off its own wrapper, so a disabled trigger still explains itself", () => {
		const { container } = render(
			<Tooltip hint="Pick 1 more config to remove">
				<button type="button" disabled>
					Remove and go to shop
				</button>
			</Tooltip>
		);

		expect(container.firstChild).toHaveClass("group/tip");
	});

	it("does not read the hint twice, once as a label and once as a panel", () => {
		render(
			<Tooltip hint="This ran and failed">
				<span />
			</Tooltip>
		);

		expect(
			screen.getByText("This ran and failed").parentElement
		).toHaveAttribute("aria-hidden");
	});
});
