import { readFileSync } from "node:fs";

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Button, type ButtonTone } from "./Button.ui";

const appCss = readFileSync("src/styles/app.css", "utf8");

const TONES = ["ambient", "action", "danger"] as const satisfies ButtonTone[];

const themedUtilitiesOf = (element: HTMLElement) =>
	element.className
		.split(" ")
		.map((candidate) => candidate.split(":").at(-1) ?? "")
		.filter((utility) => utility.includes("-theme"));

describe("Button", () => {
	it("shows its label as the visible text when it carries no glyph", () => {
		render(<Button label="↑ v3" onPress={vi.fn()} />);

		expect(screen.getByRole("button", { name: "↑ v3" })).toBeInTheDocument();
	});

	it("shows the glyph but answers to the label, which a glyph cannot carry", () => {
		render(<Button glyph="×" label="Uninstall Cache" onPress={vi.fn()} />);

		expect(
			screen.getByRole("button", { name: "Uninstall Cache" })
		).toBeInTheDocument();
		expect(screen.getByText("×")).toBeInTheDocument();
	});

	it("keeps a glyph button square, taking no width from the shared base", () => {
		render(<Button glyph="×" label="Uninstall Cache" onPress={vi.fn()} />);

		const button = screen.getByRole("button");
		expect(button).toHaveClass("size-5");
		expect(button).not.toHaveClass("w-fit");
	});

	it("sizes a labelled button off its own content", () => {
		render(<Button label="↑ v3" onPress={vi.fn()} />);

		expect(screen.getByRole("button")).toHaveClass("w-fit", "h-5");
	});

	it("lets a hint name the control more fully than its label", () => {
		render(
			<Button
				label="↑ v3"
				hint="Upgrade Cache to v3 · needs 15 coverage"
				onPress={vi.fn()}
			/>
		);

		expect(
			screen.getByRole("button", {
				name: "Upgrade Cache to v3 · needs 15 coverage",
			})
		).toBeInTheDocument();
	});

	it("presses", async () => {
		const onPress = vi.fn();
		render(<Button label="↑ v3" onPress={onPress} />);

		await userEvent.click(screen.getByRole("button"));

		expect(onPress).toHaveBeenCalledOnce();
	});

	it("stays focusable with no handler, so a hover panel is reachable by keyboard", () => {
		render(<Button glyph="i" label="About Cache" />);

		expect(screen.getByRole("button")).toBeEnabled();
	});

	it("swallows the press while disabled", async () => {
		const onPress = vi.fn();
		render(<Button label="↑ v3" disabled onPress={onPress} />);

		await userEvent.click(screen.getByRole("button"));

		expect(onPress).not.toHaveBeenCalled();
		expect(screen.getByRole("button")).toBeDisabled();
	});

	it("dims to two fifths while disabled rather than restyling", () => {
		render(<Button label="↑ v3" disabled onPress={vi.fn()} />);

		expect(screen.getByRole("button")).toHaveClass(
			"disabled:opacity-40",
			"disabled:cursor-not-allowed"
		);
	});

	it("themes a danger button cinnabar, apart from the screen", () => {
		render(<Button label="press" tone="danger" onPress={vi.fn()} />);

		expect(screen.getByRole("button")).toHaveAttribute(
			"data-screen-theme",
			"cinnabar"
		);
	});

	it("leaves an action press on the screen's own colour", () => {
		render(<Button label="press" tone="action" onPress={vi.fn()} />);

		expect(screen.getByRole("button")).not.toHaveAttribute("data-screen-theme");
	});

	it("reddens an action press the player cannot put through", () => {
		render(<Button label="↑ v3" tone="action" disabled onPress={vi.fn()} />);

		expect(screen.getByRole("button")).toHaveAttribute(
			"data-screen-theme",
			"cinnabar"
		);
	});

	it("leaves the other tones their own colour when disabled", () => {
		render(<Button label="press" tone="danger" disabled onPress={vi.fn()} />);

		expect(screen.getByRole("button")).toHaveAttribute(
			"data-screen-theme",
			"cinnabar"
		);
	});

	it("keeps a disabled ambient press unthemed, so it still follows the screen", () => {
		render(<Button label="press" tone="ambient" disabled onPress={vi.fn()} />);

		expect(screen.getByRole("button")).not.toHaveAttribute("data-screen-theme");
	});

	it("leaves an ambient button unthemed, so it follows the screen", () => {
		render(<Button label="press" tone="ambient" onPress={vi.fn()} />);

		expect(screen.getByRole("button")).not.toHaveAttribute("data-screen-theme");
	});

	it("is ambient unless a tone says otherwise", () => {
		render(<Button label="press" onPress={vi.fn()} />);

		expect(screen.getByRole("button")).not.toHaveAttribute("data-screen-theme");
	});

	it("reports a two-state control's live arm", () => {
		render(<Button glyph="i" label="About Cache" pressed onPress={vi.fn()} />);

		expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
	});

	it("reports what it expands, rather than what it presses", () => {
		render(<Button glyph="i" label="About Cache" expanded onPress={vi.fn()} />);

		const button = screen.getByRole("button");
		expect(button).toHaveAttribute("aria-expanded", "true");
		expect(button).not.toHaveAttribute("aria-pressed");
	});

	it("claims neither state when it is a plain press", () => {
		render(<Button label="↑ v3" onPress={vi.fn()} />);

		const button = screen.getByRole("button");
		expect(button).not.toHaveAttribute("aria-pressed");
		expect(button).not.toHaveAttribute("aria-expanded");
	});

	it.each([{ pressed: true }, { expanded: true }])(
		"fills the button once it is live (%o)",
		(state) => {
			render(<Button glyph="i" label="About Cache" {...state} />);

			expect(screen.getByRole("button")).toHaveClass("bg-theme");
		}
	);

	it("leaves an idle button unfilled", () => {
		render(<Button glyph="i" label="About Cache" />);

		expect(screen.getByRole("button")).not.toHaveClass("bg-theme");
	});

	it("rings itself inside its own box, so it never grows the row", () => {
		render(<Button label="↑ v3" onPress={vi.fn()} />);

		expect(screen.getByRole("button")).toHaveClass("ring-1", "ring-inset");
		expect(screen.getByRole("button").className).not.toMatch(/\bborder\b/);
	});

	it("caps a labelled button with a boxed glyph beside the label", () => {
		render(<Button cap="↑" label="v3" tone="action" onPress={vi.fn()} />);

		expect(screen.getByText("↑")).toHaveClass("badge-theme");
		expect(screen.getByText("v3")).toBeInTheDocument();
	});

	it("keeps the cap decorative, since the label already names the press", () => {
		render(<Button cap="↑" label="v3" onPress={vi.fn()} />);

		expect(screen.getByText("↑")).toHaveAttribute("aria-hidden");
	});

	it("holds a detail back until the button is hovered", () => {
		render(<Button cap="↑" label="v3" detail="32 KB" onPress={vi.fn()} />);

		const detail = screen.getByText(/32 KB/);
		expect(detail).toHaveClass("hidden", "group-hover/press:inline");
	});

	it("folds a hover-only detail into the name, which touch can still reach", () => {
		render(<Button cap="↑" label="v3" detail="32 KB" onPress={vi.fn()} />);

		expect(
			screen.getByRole("button", { name: "v3 · 32 KB" })
		).toBeInTheDocument();
	});

	it("lets a hint outrank the detail it would otherwise announce", () => {
		render(
			<Button
				cap="↑"
				label="v3"
				detail="32 KB"
				hint="Upgrade Cache to v3 · 32 KB · needs 15 coverage"
				onPress={vi.fn()}
			/>
		);

		expect(
			screen.getByRole("button", {
				name: "Upgrade Cache to v3 · 32 KB · needs 15 coverage",
			})
		).toBeInTheDocument();
	});

	it.each([
		["sm", "h-5"],
		["md", "h-8"],
	] as const)("stands a %s labelled button %s tall", (size, height) => {
		render(<Button label="cancel" size={size} onPress={vi.fn()} />);

		expect(screen.getByRole("button")).toHaveClass(height);
	});

	it("is small unless a size says otherwise", () => {
		render(<Button label="cancel" onPress={vi.fn()} />);

		expect(screen.getByRole("button")).toHaveClass("h-5");
	});

	it("squares a glyph button to the badge's own height", () => {
		render(<Button glyph="i" label="About Cache" onPress={vi.fn()} />);

		expect(screen.getByRole("button")).toHaveClass("size-5");
	});

	it("holds a labelled button to that same height", () => {
		render(<Button label="↑ v3" onPress={vi.fn()} />);

		expect(screen.getByRole("button")).toHaveClass("h-5");
	});

	it.each(TONES)(
		"names only utilities app.css declares, at tone %s",
		(tone) => {
			render(<Button label="press" glyph="x" tone={tone} onPress={vi.fn()} />);

			const utilities = themedUtilitiesOf(screen.getByRole("button"));

			expect(utilities.length).toBeGreaterThan(0);
			for (const utility of utilities) {
				expect(appCss).toContain(`@utility ${utility}`);
			}
		}
	);

	it("declares every utility the live state paints with", () => {
		render(<Button glyph="i" label="About Cache" expanded />);

		for (const utility of themedUtilitiesOf(screen.getByRole("button"))) {
			expect(appCss).toContain(`@utility ${utility}`);
		}
	});

	describe("signed with an icon", () => {
		it("trails the label with the icon without renaming the press", () => {
			render(<Button label="To the shop" icon="shop" />);

			const press = screen.getByRole("button", { name: "To the shop" });

			expect(press.querySelector("svg")).not.toBeNull();
			expect(press.lastElementChild?.nodeName).toBe("svg");
		});

		it("keeps the icon out of the accessible name", () => {
			render(<Button label="Community" icon="community" />);

			expect(
				screen.getByRole("button", { name: "Community" }).querySelector("svg")
			).toHaveAttribute("aria-hidden", "true");
		});

		it("draws no icon when none was asked for", () => {
			render(<Button label="Review answers" />);

			expect(
				screen
					.getByRole("button", { name: "Review answers" })
					.querySelector("svg")
			).toBeNull();
		});
	});
});
