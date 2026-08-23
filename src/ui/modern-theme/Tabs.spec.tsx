import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Tabs, type TabItem } from "./Tabs.ui";

const ITEMS: readonly TabItem[] = [
	{ id: "polls", label: "Polls", count: "23/418" },
	{ id: "gates", label: "Gates", count: "1/13" },
	{ id: "bare", label: "Bare" },
];

describe("Tabs", () => {
	it("marks exactly one tab as the one you are on", () => {
		render(
			<Tabs
				items={ITEMS}
				activeId="gates"
				onSelect={() => {}}
				label="Collection"
			/>
		);

		expect(
			screen.getAllByRole("tab").map((tab) => tab.getAttribute("aria-selected"))
		).toEqual(["false", "true", "false"]);
	});

	it("reports the tab you asked for, not the one you left", async () => {
		const onSelect = vi.fn();
		render(
			<Tabs
				items={ITEMS}
				activeId="gates"
				onSelect={onSelect}
				label="Collection"
			/>
		);

		await userEvent.click(screen.getByRole("tab", { name: /Polls/ }));

		expect(onSelect).toHaveBeenCalledWith("polls");
	});

	it("speaks the tally as part of the tab, not run into its name", () => {
		render(
			<Tabs
				items={ITEMS}
				activeId="gates"
				onSelect={() => {}}
				label="Collection"
			/>
		);

		expect(
			screen.getByRole("tab", { name: "Polls 23/418" })
		).toBeInTheDocument();
	});

	it("leaves a tab with nothing to count as just its name", () => {
		render(
			<Tabs
				items={ITEMS}
				activeId="gates"
				onSelect={() => {}}
				label="Collection"
			/>
		);

		expect(screen.getByRole("tab", { name: "Bare" })).toBeInTheDocument();
	});

	it("names the bar, since a page can hold more than one", () => {
		render(
			<Tabs
				items={ITEMS}
				activeId="gates"
				onSelect={() => {}}
				label="Collection"
			/>
		);

		expect(
			screen.getByRole("tablist", { name: "Collection" })
		).toBeInTheDocument();
	});
});
