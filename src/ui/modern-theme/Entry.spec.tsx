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

	// On the whole card, not the summary strip: an open row keeps its rarity
	// rather than losing it the moment the explainer appears.
	it("rails an expandable row with its rarity, body included", () => {
		render(
			<Entry label=".ts" mark="pass" rarity="uncommon" explainer="TS polls." />
		);

		const card = screen.getByRole("group");
		expect(card).toHaveClass("relative");
		expect(card.querySelector(".bg-cerulean")).toBeInTheDocument();
	});

	it("rails a row that has nothing to expand", () => {
		const { container } = render(
			<Entry label=".ts" mark="pass" rarity="common" />
		);

		expect(container.firstElementChild).toHaveClass("relative");
		expect(container.querySelector(".bg-celadon")).toBeInTheDocument();
	});

	// Only the legendary earns a fill: eight tinted rows in a column read as
	// eight statuses rather than as a grade.
	it("washes the row for a legendary and for nothing else", () => {
		const { container: rare } = render(
			<Entry label="Intellisense" mark="pass" rarity="rare" />
		);
		expect(rare.firstElementChild).not.toHaveClass("legendary-shimmer");

		const { container: legendary } = render(
			<Entry label="WTFPL" mark="pass" rarity="legendary" />
		);
		expect(legendary.firstElementChild).toHaveClass("legendary-shimmer");
	});

	it("leaves a row with no rarity unrailed", () => {
		const { container } = render(<Entry label="empty" mark="idle" />);

		expect(container.querySelector(".rounded-full.w-1")).toBeNull();
	});
});
