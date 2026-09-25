import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Tabs } from "./Tabs.ui";

const ITEMS = [
	{ id: "polls", label: "polls" },
	{ id: "configs", label: "configs" },
	{ id: "runs", label: "runs" },
] as const;

const noop = () => {};

describe("Tabs", () => {
	it("names the bar so several on a page stay distinguishable", () => {
		render(
			<Tabs
				items={ITEMS}
				activeId="polls"
				onSelect={noop}
				label="Dex collections"
			/>
		);

		expect(screen.getByRole("tablist")).toHaveAccessibleName("Dex collections");
	});

	it("renders one tab per item", () => {
		render(<Tabs items={ITEMS} activeId="polls" onSelect={noop} label="Dex" />);

		expect(screen.getAllByRole("tab")).toHaveLength(3);
	});

	it("marks only the active tab as selected", () => {
		render(
			<Tabs items={ITEMS} activeId="configs" onSelect={noop} label="Dex" />
		);

		expect(screen.getByRole("tab", { name: "configs" })).toHaveAttribute(
			"aria-selected",
			"true"
		);
		expect(screen.getByRole("tab", { name: "polls" })).toHaveAttribute(
			"aria-selected",
			"false"
		);
	});

	it("merges the active tab into the panel below it", () => {
		render(<Tabs items={ITEMS} activeId="runs" onSelect={noop} label="Dex" />);

		expect(screen.getByRole("tab", { name: "runs" })).toHaveClass(
			"bg-theme-faint"
		);
		expect(screen.getByRole("tab", { name: "polls" })).not.toHaveClass(
			"bg-theme-faint"
		);
	});

	it("reports the tab that was pressed", async () => {
		const onSelect = vi.fn();
		render(
			<Tabs items={ITEMS} activeId="polls" onSelect={onSelect} label="Dex" />
		);

		await userEvent.click(screen.getByRole("tab", { name: "runs" }));

		expect(onSelect).toHaveBeenCalledWith("runs");
	});
});
