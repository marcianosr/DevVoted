import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { NavDisclosure } from "./NavDisclosure.ui";

const renderOpenMenu = () => {
	const view = render(
		<div>
			<button type="button">elsewhere</button>
			<NavDisclosure summary="Account">
				<a href="/profile">Profile</a>
			</NavDisclosure>
		</div>
	);
	fireEvent.click(screen.getByText("Account"));
	return view.container.querySelector("details");
};

describe("NavDisclosure", () => {
	it("closes when the player presses outside the menu", () => {
		const details = renderOpenMenu();
		expect(details).toHaveAttribute("open");

		fireEvent.pointerDown(screen.getByText("elsewhere"));

		expect(details).not.toHaveAttribute("open");
	});

	it("stays open when the player presses inside the menu", () => {
		const details = renderOpenMenu();

		fireEvent.pointerDown(screen.getByText("Profile"));

		expect(details).toHaveAttribute("open");
	});
});
