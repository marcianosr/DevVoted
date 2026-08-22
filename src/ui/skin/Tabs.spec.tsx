import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Tabs, type Tab } from "./Tabs.ui";

const tabs: readonly Tab[] = [
	{ id: "question", label: "Question", state: "active" },
	{ id: "source", label: "Source" },
	{ id: "explanation", label: "Explanation", state: "disabled" },
];

describe("Tabs", () => {
	it("names the strip and marks only the active tab as selected", () => {
		render(<Tabs tabs={tabs} label="Poll detail" />);

		expect(
			screen.getByRole("tablist", { name: "Poll detail" })
		).toBeInTheDocument();
		expect(screen.getByRole("tab", { selected: true })).toHaveTextContent(
			"Question"
		);
	});

	it("underlines the active tab in the gate colour", () => {
		render(<Tabs tabs={tabs} label="Poll detail" />);

		expect(screen.getByRole("tab", { name: "Question" })).toHaveClass(
			"border-theme"
		);
	});

	it("reports the tab that was clicked", async () => {
		const onSelect = vi.fn();
		render(<Tabs tabs={tabs} onSelect={onSelect} label="Poll detail" />);

		await userEvent.click(screen.getByRole("tab", { name: "Source" }));

		expect(onSelect).toHaveBeenCalledWith("source");
	});

	it("answers the mouse on a tab with nothing behind it, and refuses the click", async () => {
		const onSelect = vi.fn();
		render(<Tabs tabs={tabs} onSelect={onSelect} label="Poll detail" />);

		const blocked = screen.getByRole("tab", { name: "Explanation" });
		expect(blocked).toHaveClass("cursor-not-allowed");

		await userEvent.click(blocked);
		expect(onSelect).not.toHaveBeenCalled();
	});
});
