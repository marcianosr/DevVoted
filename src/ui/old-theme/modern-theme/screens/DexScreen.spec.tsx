import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DexScreen } from "./DexScreen.ui";

const TABS = [
	{ id: "polls", label: "Polls", count: "23/418" },
	{ id: "gates", label: "Gates", count: "1/13" },
];

describe("DexScreen", () => {
	it("names the collection it is showing", () => {
		render(
			<DexScreen tabs={TABS} activeId="gates" onSelect={() => {}}>
				<p>the gates</p>
			</DexScreen>
		);

		expect(screen.getByRole("heading", { name: "Dex" })).toBeInTheDocument();
	});

	it("hands the chosen tab back by id", async () => {
		const onSelect = vi.fn();
		render(
			<DexScreen tabs={TABS} activeId="gates" onSelect={onSelect}>
				<p>the gates</p>
			</DexScreen>
		);

		await userEvent.click(screen.getByRole("tab", { name: /Polls/ }));

		expect(onSelect).toHaveBeenCalledWith("polls");
	});

	it("puts the panel in a region the tabs are understood to govern", () => {
		render(
			<DexScreen tabs={TABS} activeId="gates" onSelect={() => {}}>
				<p>the gates</p>
			</DexScreen>
		);

		expect(screen.getByRole("tabpanel")).toHaveTextContent("the gates");
	});
});
