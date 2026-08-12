import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { Tooltip } from "./Tooltip.component";

const tap = (element: HTMLElement) => {
	fireEvent.pointerDown(element, { pointerType: "touch" });
	fireEvent.pointerUp(element, { pointerType: "touch" });
};

const panelFor = (text: string): HTMLElement => {
	const panel = screen.getByText(text).closest('[role="tooltip"]');
	if (!(panel instanceof HTMLElement))
		throw new Error(`"${text}" is not inside a tooltip panel`);
	return panel;
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

	it("scopes a nested tooltip to its own trigger, not an outer group", () => {
		render(
			<Tooltip content="outer">
				<Tooltip content="inner" nested>
					<button type="button">trigger</button>
				</Tooltip>
			</Tooltip>
		);
		expect(panelFor("outer")).toHaveClass("group-hover:block");
		expect(panelFor("inner")).toHaveClass("group-hover/nested:block");
		expect(panelFor("inner")).not.toHaveClass("group-hover:block");
	});

	it("lets the pointer into an interactive panel only", () => {
		const { rerender } = render(
			<Tooltip content="caption">
				<span>trigger</span>
			</Tooltip>
		);
		expect(screen.getByRole("tooltip")).toHaveClass("pointer-events-none");
		rerender(
			<Tooltip content="caption" interactive>
				<span>trigger</span>
			</Tooltip>
		);
		expect(screen.getByRole("tooltip")).toHaveClass("pointer-events-auto");
	});
});

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

	it("leaves a mouse click unpinned, hover being the mouse's reveal", () => {
		renderTooltip();
		fireEvent.pointerUp(screen.getByRole("button"), { pointerType: "mouse" });
		expect(panel()).toHaveClass("hidden", "group-hover:block");
	});

	it("stays pinned when the panel itself is tapped", () => {
		render(
			<Tooltip content={<button type="button">install</button>} interactive>
				<button type="button">trigger</button>
			</Tooltip>
		);
		tap(screen.getByRole("button", { name: "trigger" }));
		fireEvent.pointerDown(screen.getByRole("button", { name: "install" }), {
			pointerType: "touch",
		});
		expect(panel()).toHaveClass("block");
	});
});

describe("Tooltip with a parent-owned pin", () => {
	const panel = () => screen.getByRole("tooltip");

	it("shows and hides the panel as the parent flips pinned", () => {
		const { rerender } = render(
			<Tooltip content="Grunty's lair" pinned={false}>
				<button type="button">trigger</button>
			</Tooltip>
		);
		expect(panel()).toHaveClass("hidden");
		rerender(
			<Tooltip content="Grunty's lair" pinned>
				<button type="button">trigger</button>
			</Tooltip>
		);
		expect(panel()).toHaveClass("block");
	});

	it("reports an outside tap through onDismiss instead of closing itself", () => {
		const onDismiss = vi.fn();
		render(
			<Tooltip content="Grunty's lair" pinned onDismiss={onDismiss}>
				<button type="button">trigger</button>
			</Tooltip>
		);
		fireEvent.pointerDown(document.body, { pointerType: "touch" });
		expect(onDismiss).toHaveBeenCalled();
		expect(panel()).toHaveClass("block");
	});

	it("reports Escape through onDismiss", () => {
		const onDismiss = vi.fn();
		render(
			<Tooltip content="Grunty's lair" pinned onDismiss={onDismiss}>
				<button type="button">trigger</button>
			</Tooltip>
		);
		fireEvent.keyDown(document, { key: "Escape" });
		expect(onDismiss).toHaveBeenCalled();
	});

	it("ignores the internal tap-to-pin while controlled", () => {
		render(
			<Tooltip content="Grunty's lair" pinned={false}>
				<button type="button">trigger</button>
			</Tooltip>
		);
		tap(screen.getByRole("button"));
		expect(panel()).toHaveClass("hidden");
	});
});
