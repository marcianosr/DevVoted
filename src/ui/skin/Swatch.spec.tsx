import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { Swatch } from "./Swatch.ui";

describe("Swatch", () => {
	it("fills an earned square and outlines the current one", () => {
		const { container, unmount } = render(<Swatch state="earned" />);
		expect(container.firstElementChild).toHaveClass("bg-theme");
		unmount();

		const current = render(<Swatch state="current" />);
		expect(current.container.firstElementChild).toHaveClass("border-theme");
	});

	it("greys a square that has not been earned", () => {
		const { container } = render(<Swatch state="locked" />);

		expect(container.firstElementChild).toHaveClass("bg-zinc-800");
	});

	it("sizes up for a header without changing what it means", () => {
		const { container } = render(<Swatch state="earned" size="badge" />);

		expect(container.firstElementChild).toHaveClass("size-6", "bg-theme");
	});

	it("overrides the ambient colour only when given its own gate", () => {
		const { container, unmount } = render(
			<Swatch state="earned" theme="cascade" />
		);
		expect(container.firstElementChild).toHaveAttribute(
			"data-swatch-theme",
			"cascade"
		);
		unmount();

		const ambient = render(<Swatch state="earned" />);
		expect(ambient.container.firstElementChild).not.toHaveAttribute(
			"data-swatch-theme"
		);
	});
});
