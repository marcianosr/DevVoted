import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Tabs } from "./Tabs.ui";

const tabs = [
	{ id: "polls", label: "Polls", count: "3/5" },
	{ id: "configs", label: "Configs", count: "24" },
];

describe(Tabs, () => {
	it("renders each tab label with its count", () => {
		render(<Tabs tabs={tabs} activeId="polls" onSelect={() => {}} />);
		expect(screen.getByRole("tab", { name: /Polls/ })).toBeInTheDocument();
		expect(screen.getByText("· 3/5")).toBeInTheDocument();
		expect(screen.getByText("· 24")).toBeInTheDocument();
	});

	it("marks the active tab selected and the others not", () => {
		render(<Tabs tabs={tabs} activeId="polls" onSelect={() => {}} />);
		expect(screen.getByRole("tab", { name: /Polls/ })).toHaveAttribute(
			"aria-selected",
			"true"
		);
		expect(screen.getByRole("tab", { name: /Configs/ })).toHaveAttribute(
			"aria-selected",
			"false"
		);
	});

	it("calls onSelect with the tab id when an inactive tab is clicked", () => {
		const onSelect = vi.fn();
		render(<Tabs tabs={tabs} activeId="polls" onSelect={onSelect} />);
		fireEvent.click(screen.getByRole("tab", { name: /Configs/ }));
		expect(onSelect).toHaveBeenCalledWith("configs");
	});
});
