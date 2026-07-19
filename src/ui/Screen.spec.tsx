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

	it("mirrors the category onto <body> for the page tint, and cleans it up", () => {
		const { unmount } = render(<Screen categoryCode="css">content</Screen>);
		expect(document.body).toHaveAttribute("data-category-theme", "css");
		unmount();
		expect(document.body).not.toHaveAttribute("data-category-theme");
	});

	it("leaves <body> untinted on screens without a category", () => {
		render(<Screen>content</Screen>);
		expect(document.body).not.toHaveAttribute("data-category-theme");
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

	it("falls back to the transition prop when no action preceded the mount", () => {
		const { container } = render(<Screen transition="fade">content</Screen>);
		expect(transitionOf(container)).toBe("fade");
	});
});
