import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Modal } from "./Modal.ui";
import { Panel } from "./Panel.ui";

describe("Panel", () => {
	it("renders what it was handed", () => {
		render(<Panel>body</Panel>);

		expect(screen.getByText("body")).toBeInTheDocument();
	});

	it("sits on the screen's own ground, edged rather than filled", () => {
		const { container } = render(<Panel>body</Panel>);

		expect(container.firstChild).toHaveClass(
			"bg-theme-faint",
			"border-theme-faint",
			"rounded-2xl"
		);
		expect(container.firstChild).not.toHaveClass("bg-theme-raised");
	});

	it("stacks its children in a padded column", () => {
		const { container } = render(<Panel>body</Panel>);

		expect(container.firstChild).toHaveClass(
			"flex",
			"flex-col",
			"gap-4",
			"px-4"
		);
	});

	it("takes a width from the call site without shedding the chrome", () => {
		const { container } = render(<Panel className="w-80">body</Panel>);

		expect(container.firstChild).toHaveClass("w-80", "bg-theme-faint", "px-4");
	});

	it("is the surface a modal's dialog wears", () => {
		render(<Modal label="Uninstall">body</Modal>);

		expect(screen.getByRole("dialog")).toHaveClass(
			"bg-theme-faint",
			"border-theme-faint",
			"rounded-2xl"
		);
	});
});
