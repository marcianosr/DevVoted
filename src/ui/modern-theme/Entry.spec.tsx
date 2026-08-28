import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Entry } from "./Entry.ui";

describe("Entry", () => {
	it("carries the config's verdict, name and price on one row", () => {
		render(<Entry label="IndexedDB" mark="pass" value="+16" />);

		expect(screen.getByRole("img", { name: "passing" })).toBeInTheDocument();
		expect(screen.getByText("IndexedDB")).toBeInTheDocument();
		expect(screen.getByText("+16")).toBeInTheDocument();
	});

	it("reads under the fold heading it sits below, never level with it", () => {
		render(<Entry label="IndexedDB" mark="pass" />);

		expect(screen.getByText("IndexedDB")).toHaveClass("text-xs");
	});

	it("stays a plain row when the config has nothing to explain", () => {
		const { container } = render(<Entry label=".ts" mark="idle" />);

		expect(container.querySelector("details")).not.toBeInTheDocument();
	});

	it("opens into a sentence when the config is doing something to this poll", () => {
		render(
			<Entry
				label="ESLint"
				mark="warn"
				summary="Common · blocking 1 option on poll 3"
				explainer="Strikes out one wrong answer per gate."
				defaultOpen
			/>
		);

		expect(
			screen.getByText("Common · blocking 1 option on poll 3")
		).toBeInTheDocument();
		expect(
			screen.getByText("Strikes out one wrong answer per gate.")
		).toBeInTheDocument();
	});

	it("starts shut so the rail stays scannable", () => {
		const { container } = render(
			<Entry
				label="ESLint"
				mark="warn"
				explainer="Strikes out one wrong answer per gate."
			/>
		);

		expect(container.querySelector("details")).not.toHaveAttribute("open");
	});

	it("opens on click, so the whole row is the hit target rather than a caret", async () => {
		const { container } = render(
			<Entry
				label="ESLint"
				mark="warn"
				explainer="Strikes out one wrong answer per gate."
			/>
		);

		await userEvent.click(screen.getByText("ESLint"));

		expect(container.querySelector("details")).toHaveAttribute("open");
	});

	it("fades a config that is not firing", () => {
		render(<Entry label=".ts" mark="idle" dimmed />);

		expect(screen.getByText(".ts").closest("div")).toHaveClass("opacity-50");
	});

	it("reads the explainer brighter than the summary but at the same size", () => {
		render(
			<Entry
				label="ESLint"
				mark="warn"
				summary="Common · blocking 1 option on poll 3"
				explainer="Strikes out one wrong answer per gate."
				defaultOpen
			/>
		);

		expect(screen.getByText(/blocking 1 option/)).toHaveClass("text-zinc-400");
		const explainer = screen.getByText(/Strikes out one wrong/);
		expect(explainer).toHaveClass("text-zinc-100");
		expect(explainer).toHaveClass("text-xs");
	});

	it("offers a priced button instead of a value when the config is spendable", () => {
		render(
			<Entry
				label="ESLint"
				mark="warn"
				actions={[{ label: "Use", cost: "16 KB", onUse: vi.fn() }]}
			/>
		);

		expect(
			screen.getByRole("button", { name: "Use 16 KB" })
		).toBeInTheDocument();
	});

	it("spends without opening the row it sits in", async () => {
		const onUse = vi.fn();
		const user = userEvent.setup();
		render(
			<Entry
				label="ESLint"
				mark="warn"
				actions={[{ label: "Use", cost: "16 KB", onUse }]}
				summary="Common · blocking 1 option on poll 3"
				explainer="Strikes out one wrong answer per gate."
			/>
		);

		await user.click(screen.getByRole("button", { name: "Use 16 KB" }));

		expect(onUse).toHaveBeenCalledOnce();
		expect(screen.getByRole("group")).not.toHaveAttribute("open");
	});

	it("leads the name with its grade glyph, expandable or not", () => {
		const { container: flat } = render(
			<Entry label=".ts" mark="pass" rarity="bit" />
		);
		expect(flat.querySelectorAll("svg rect")).toHaveLength(1);

		const { container: open } = render(
			<Entry
				label="AGENTS.md"
				mark="pass"
				rarity="byte"
				explainer="All coverage ×2."
			/>
		);
		expect(open.querySelectorAll("svg rect")).toHaveLength(8);
	});

	it("draws no glyph where there is no grade to state", () => {
		const { container } = render(<Entry label="empty" mark="idle" />);

		expect(container.querySelector("svg rect")).toBeNull();
	});

	it("tints an opened row in no grade colour at all", () => {
		render(
			<Entry
				label="WTFPL"
				mark="pass"
				rarity="byte"
				explainer="Buy the shop."
			/>
		);

		expect(screen.getByRole("group").className).not.toMatch(
			/bg-(cerulean|viridian|cinnabar)|legendary/
		);
	});
});
