import { readFileSync } from "node:fs";

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Badge } from "./Badge.ui";
import { KANTO_COLORS } from "./colors";

const appCss = readFileSync("src/styles/app.css", "utf8");

describe("Badge", () => {
	it("renders its label", () => {
		render(<Badge>×2 fading</Badge>);

		expect(screen.getByText("×2 fading")).toBeInTheDocument();
	});

	it.each(KANTO_COLORS)("takes %s as its own colour", (color) => {
		render(<Badge color={color}>×2 fading</Badge>);

		expect(screen.getByText("×2 fading")).toHaveAttribute(
			"data-screen-theme",
			color
		);
	});

	it("follows the ambient theme when given no colour", () => {
		render(<Badge>×2 fading</Badge>);

		expect(screen.getByText("×2 fading")).not.toHaveAttribute(
			"data-screen-theme"
		);
	});

	it("carries the paired fill and ink as one class", () => {
		render(<Badge>×2 fading</Badge>);

		expect(screen.getByText("×2 fading")).toHaveClass("badge-theme");
	});

	it("pads 0.5rem across and 0.125rem down", () => {
		render(<Badge>×2 fading</Badge>);

		expect(screen.getByText("×2 fading")).toHaveClass("px-2", "py-0.5");
	});

	it("stays as wide as its label inside a flex column", () => {
		render(<Badge>×2 fading</Badge>);

		expect(screen.getByText("×2 fading")).toHaveClass("w-fit");
	});

	it("keeps its label on one line, with figures aligned", () => {
		render(<Badge>peek 128 KB</Badge>);

		expect(screen.getByText("peek 128 KB")).toHaveClass(
			"whitespace-nowrap",
			"tabular-nums"
		);
	});

	it("resolves to a utility app.css declares with both halves of the pair", () => {
		const utility = appCss.slice(appCss.indexOf("@utility badge-theme"));
		const body = utility.slice(0, utility.indexOf("}"));

		expect(body).toContain("background-color");
		expect(body).toContain("color:");
	});

	it("stays a plain span while it is only a label", () => {
		render(<Badge color="viridian">×2</Badge>);

		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});

	it("becomes a button once it has something to do", () => {
		render(<Badge onPress={vi.fn()}>lint 32 KB</Badge>);

		expect(
			screen.getByRole("button", { name: "lint 32 KB" })
		).toBeInTheDocument();
	});

	it("is always cerulean when pressable, so blue reads as pressable", () => {
		render(<Badge onPress={vi.fn()}>lint 32 KB</Badge>);

		expect(screen.getByRole("button")).toHaveAttribute(
			"data-screen-theme",
			"cerulean"
		);
	});

	it("wears the ring that separates a control from a label", () => {
		render(<Badge onPress={vi.fn()}>lint 32 KB</Badge>);

		expect(screen.getByRole("button")).toHaveClass(
			"ring-1",
			"ring-inset",
			"ring-theme-soft"
		);
	});

	it("measures the same as a label, so gaining a handler cannot resize a chip", () => {
		const { container: label } = render(<Badge color="viridian">×2</Badge>);
		const { container: press } = render(<Badge onPress={vi.fn()}>×2</Badge>);

		const geometry = (node: Element | null) =>
			(node?.className ?? "")
				.split(" ")
				.filter((name) => /^(p[xy]?|size|text|rounded)-/.test(name))
				.sort();

		expect(geometry(press.firstElementChild)).toEqual(
			geometry(label.firstElementChild)
		);
	});

	it("lights the armed rung for a control whose state is live", () => {
		render(
			<Badge onPress={vi.fn()} armed>
				arm A
			</Badge>
		);

		expect(screen.getByRole("button")).toHaveClass("press-theme-armed");
	});

	it("keeps an idle control off the armed rung", () => {
		render(<Badge onPress={vi.fn()}>lint 32 KB</Badge>);

		expect(screen.getByRole("button")).not.toHaveClass("press-theme-armed");
	});

	it("claims a pressed state only where there is one to claim", () => {
		const { container: toggle } = render(
			<Badge onPress={vi.fn()} armed>
				arm A
			</Badge>
		);
		const { container: spend } = render(
			<Badge onPress={vi.fn()}>lint 32 KB</Badge>
		);

		expect(toggle.firstElementChild).toHaveAttribute("aria-pressed", "true");
		expect(spend.firstElementChild).not.toHaveAttribute("aria-pressed");
	});

	it("reports the press to its handler", async () => {
		const onPress = vi.fn();
		render(<Badge onPress={onPress}>lint 32 KB</Badge>);

		await userEvent.click(screen.getByRole("button"));

		expect(onPress).toHaveBeenCalledOnce();
	});

	it("refuses the press when the action is out of reach", async () => {
		const onPress = vi.fn();
		render(
			<Badge onPress={onPress} disabled>
				peek 512 KB
			</Badge>
		);

		await userEvent.click(screen.getByRole("button"));

		expect(onPress).not.toHaveBeenCalled();
		expect(screen.getByRole("button")).toBeDisabled();
	});

	it("lets a hint say why a refused action is refused", () => {
		render(
			<Badge
				onPress={vi.fn()}
				disabled
				hint="peek · 512 KB · not enough storage"
			>
				peek 512 KB
			</Badge>
		);

		expect(
			screen.getByRole("button", { name: "peek · 512 KB · not enough storage" })
		).toBeInTheDocument();
	});

	it("names itself by its label when no hint is given", () => {
		render(<Badge onPress={vi.fn()}>arm A</Badge>);

		expect(screen.getByRole("button", { name: "arm A" })).toBeInTheDocument();
	});

	it("declares both halves of every press pair, fill and ink together", () => {
		for (const utility of ["press-theme", "press-theme-armed"]) {
			const block = appCss.slice(appCss.indexOf(`@utility ${utility} {`));
			const body = block.slice(0, block.indexOf("\n}"));

			expect(body).toContain("background-color");
		}

		const idle = appCss.slice(appCss.indexOf("@utility press-theme {"));
		expect(idle.slice(0, idle.indexOf("\n}"))).toContain("color:");
	});

	it("holds the affordance ring above the lightness the mock drew", () => {
		const block = appCss.slice(appCss.indexOf("@utility ring-theme-soft {"));
		const body = block.slice(0, block.indexOf("\n}"));

		expect(body).toContain("0.56");
		expect(body).not.toContain("0.467");
	});
});
