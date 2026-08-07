import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { Tooltip } from "./Tooltip.component";

const tap = (element: HTMLElement) => {
	fireEvent.pointerDown(element, { pointerType: "touch" });
	fireEvent.pointerUp(element, { pointerType: "touch" });
};

describe("Tooltip", () => {
	it("renders the trigger and keeps the content in the DOM", () => {
		render(
			<Tooltip content="Banjo's move set">
				<span>Kazooie</span>
			</Tooltip>
		);
		expect(screen.getByText("Kazooie")).toBeInTheDocument();
		expect(screen.getByText("Banjo's move set")).toBeInTheDocument();
	});

	it("hides the content until hover/focus reveals it", () => {
		render(
			<Tooltip content="Grunty's lair">
				<span>trigger</span>
			</Tooltip>
		);
		expect(screen.getByRole("tooltip")).toHaveClass(
			"hidden",
			"group-hover:block"
		);
	});
});

// A touch screen has neither hover nor a reliable focus on tap, so the content
// would be unreachable — a 12px gate pip has nothing but its tooltip to read.
describe("Tooltip on touch", () => {
	const panel = () => screen.getByRole("tooltip");

	const renderTooltip = () =>
		render(
			<Tooltip content="Grunty's lair">
				<button type="button">trigger</button>
			</Tooltip>
		);

	it("pins the content open on a tap", () => {
		renderTooltip();
		tap(screen.getByRole("button"));
		expect(panel()).toHaveClass("block");
		expect(panel()).not.toHaveClass("hidden");
	});

	it("unpins it when the trigger is tapped again", () => {
		renderTooltip();
		tap(screen.getByRole("button"));
		tap(screen.getByRole("button"));
		expect(panel()).toHaveClass("hidden");
	});

	it("unpins it on a tap anywhere else", () => {
		renderTooltip();
		tap(screen.getByRole("button"));
		fireEvent.pointerDown(document.body, { pointerType: "touch" });
		expect(panel()).toHaveClass("hidden");
	});

	it("unpins it on Escape, so a keyboard is never trapped", () => {
		renderTooltip();
		tap(screen.getByRole("button"));
		fireEvent.keyDown(document, { key: "Escape" });
		expect(panel()).toHaveClass("hidden");
	});

	// Hover already covers the mouse; pinning would leave a panel hanging over
	// the page after every click on a tooltipped button.
	it("leaves a mouse click unpinned, hover being the mouse's reveal", () => {
		renderTooltip();
		fireEvent.pointerUp(screen.getByRole("button"), { pointerType: "mouse" });
		expect(panel()).toHaveClass("hidden", "group-hover:block");
	});
});
