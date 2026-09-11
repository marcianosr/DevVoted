import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Version } from "./Version.ui";

describe("Version", () => {
	it("prefixes the number with v", () => {
		render(<Version version={3} />);

		expect(screen.getByText("v3")).toBeInTheDocument();
	});

	it("reads as the version alone, so the dot cannot be spoken", () => {
		const { container } = render(<Version version={3} />);

		expect(container.textContent).toBe("v3");
	});

	it("notches its left edge into a point", () => {
		render(<Version version={3} />);

		expect(screen.getByText("v3").className).toContain("clip-path");
	});

	it("holds the dot out of the accessibility tree", () => {
		const { container } = render(<Version version={2} />);

		expect(container.querySelector("[aria-hidden]")).toHaveClass(
			"rounded-full"
		);
	});

	it("is a held version unless told otherwise", () => {
		render(<Version version={2} />);

		expect(screen.getByText("v2")).toHaveClass("badge-theme");
	});

	it.each(["owned", "future"] as const)(
		"lets a %s version take the screen's own accent",
		(state) => {
			render(<Version version={2} state={state} />);

			expect(screen.getByText("v2")).not.toHaveAttribute("data-screen-theme");
			expect(screen.getByText("v2")).toHaveClass("badge-theme");
		}
	);

	it("greens the version on offer, which is the one a press would buy", () => {
		render(<Version version={3} state="offered" />);

		const tag = screen.getByText("v3");
		expect(tag).toHaveAttribute("data-screen-theme", "viridian");
		expect(tag).toHaveClass("badge-theme");
	});

	it("reddens an offer the player cannot pay for", () => {
		render(<Version version={3} state="unaffordable" />);

		const tag = screen.getByText("v3");
		expect(tag).toHaveAttribute("data-screen-theme", "cinnabar");
		expect(tag).toHaveClass("badge-theme");
	});

	it("keeps an unaffordable offer at full strength, since it is not out of reach", () => {
		render(<Version version={3} state="unaffordable" />);

		expect(screen.getByText("v3")).not.toHaveClass("opacity-60");
	});

	it("dims a version still out of reach", () => {
		render(<Version version={5} state="future" />);

		expect(screen.getByText("v5")).toHaveClass("opacity-60");
	});

	it("leaves the version it is on undimmed", () => {
		render(<Version version={2} state="owned" />);

		expect(screen.getByText("v2")).not.toHaveClass("opacity-60");
	});

	it("stands the same height as a badge, so a chip's row stays level", () => {
		render(<Version version={2} />);

		expect(screen.getByText("v2")).toHaveClass("h-5");
	});
});
