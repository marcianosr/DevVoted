import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DexScreen } from "./DexScreen.ui";

const TABS = [
	{ id: "polls", label: "polls" },
	{ id: "runs", label: "runs" },
] as const;

const noop = () => {};

const renderScreen = (props: Partial<Parameters<typeof DexScreen>[0]> = {}) =>
	render(
		<DexScreen
			tabs={TABS}
			activeId="polls"
			onSelect={noop}
			theme="cerulean"
			archive="8.2 MB archive"
			{...props}
		>
			<p>the polls panel</p>
		</DexScreen>
	);

describe("DexScreen", () => {
	it("titles itself apart from the shop's registry", () => {
		renderScreen();

		expect(screen.getByRole("heading", { name: "Dex Registry" })).toBeVisible();
	});

	it("reads out what the account is holding", () => {
		renderScreen();

		expect(screen.getByText("8.2 MB archive")).toBeVisible();
	});

	it("shows the panel it was handed", () => {
		renderScreen();

		expect(screen.getByRole("tabpanel")).toHaveTextContent("the polls panel");
	});

	it("wears the colour of the tab being read", () => {
		const { container } = renderScreen({ theme: "lavender" });

		expect(container.querySelector("section")).toHaveAttribute(
			"data-screen-theme",
			"lavender"
		);
	});

	it("passes a tab press up", async () => {
		const onSelect = vi.fn();
		renderScreen({ onSelect });

		await userEvent.click(screen.getByRole("tab", { name: "runs" }));

		expect(onSelect).toHaveBeenCalledWith("runs");
	});
});
