import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Screen } from "./Screen.ui";
import { clearScreenNavDirection } from "./screenNavDirection";

const transitionOf = (container: HTMLElement) =>
	container.querySelector("section")?.getAttribute("data-screen-transition");

describe(Screen.name, () => {
	// Module-level nav direction leaks between tests otherwise.
	afterEach(() => clearScreenNavDirection());

	it("renders its children", () => {
		render(
			<Screen>
				<p>Gruntilda&apos;s Lair</p>
			</Screen>
		);
		expect(screen.getByText("Gruntilda's Lair")).toBeInTheDocument();
	});

	it("applies the requested width and gate theme", () => {
		const { container } = render(
			<Screen width="narrow" gateTheme="marsh">
				content
			</Screen>
		);
		const section = container.querySelector("section");
		expect(section).toHaveAttribute("data-gate-theme", "marsh");
		expect(section?.className).toContain("sm:max-w-2xl");
	});

	it("mirrors the gate theme onto <body> for the page tint, and cleans it up", () => {
		const { unmount } = render(<Screen gateTheme="cascade">content</Screen>);
		expect(document.body).toHaveAttribute("data-gate-theme", "cascade");
		unmount();
		expect(document.body).not.toHaveAttribute("data-gate-theme");
	});

	it("leaves <body> untinted on screens without a gate theme", () => {
		render(<Screen>content</Screen>);
		expect(document.body).not.toHaveAttribute("data-gate-theme");
	});

	it("defaults to no transition", () => {
		const { container } = render(<Screen>content</Screen>);
		expect(container.querySelector("section")).toHaveAttribute(
			"data-screen-transition",
			"none"
		);
	});

	it("renders both edge actions and fires their handlers", () => {
		const onLeft = vi.fn();
		const onRight = vi.fn();
		render(
			<Screen
				leftAction={{ label: "← Review answer", onClick: onLeft }}
				rightAction={{ label: "Go to shop →", onClick: onRight }}
			>
				content
			</Screen>
		);
		fireEvent.click(screen.getByRole("button", { name: /Review answer/ }));
		fireEvent.click(screen.getByRole("button", { name: /Go to shop/ }));
		expect(onLeft).toHaveBeenCalledOnce();
		expect(onRight).toHaveBeenCalledOnce();
	});

	it("pins a lone action to the right edge", () => {
		const { container } = render(
			<Screen rightAction={{ label: "Continue →", onClick: () => {} }}>
				content
			</Screen>
		);
		expect(container.querySelector(".justify-end")).toBeInTheDocument();
	});

	it("slides the next screen in from the right after a right action fires", () => {
		const { unmount } = render(
			<Screen rightAction={{ label: "Go to shop →", onClick: () => {} }}>
				content
			</Screen>
		);
		fireEvent.click(screen.getByRole("button", { name: /Go to shop/ }));
		unmount();

		const { container } = render(<Screen>next</Screen>);
		expect(transitionOf(container)).toBe("slide-right");
	});

	it("slides the next screen in from the left after a left action fires", () => {
		const { unmount } = render(
			<Screen leftAction={{ label: "← Back", onClick: () => {} }}>
				content
			</Screen>
		);
		fireEvent.click(screen.getByRole("button", { name: /Back/ }));
		unmount();

		const { container } = render(<Screen>prev</Screen>);
		expect(transitionOf(container)).toBe("slide-left");
	});

	// The nav direction is the only source now: a screen mounted without one
	// simply does not animate.
	it("does not animate when no action preceded the mount", () => {
		const { container } = render(<Screen>content</Screen>);
		expect(transitionOf(container)).toBe("none");
	});
});
