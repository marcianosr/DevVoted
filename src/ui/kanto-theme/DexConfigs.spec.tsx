import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { dexConfigsProps } from "~/test/dexRegistry.factory";

import { DexConfigs } from "./DexConfigs.ui";

describe("DexConfigs", () => {
	it("names the collection and counts the deck against the roster", () => {
		render(<DexConfigs {...dexConfigsProps()} />);

		expect(screen.getByRole("heading", { name: "configs" })).toBeVisible();
		expect(screen.getByText("18 of 44")).toBeVisible();
	});

	it("heads each weight with its own count", () => {
		render(<DexConfigs {...dexConfigsProps()} />);

		expect(screen.getByText("2 weight · 3 of 5")).toBeVisible();
		expect(screen.getByText("1 weight · 2 of 3")).toBeVisible();
	});

	it("lays the groups out in the order given, heaviest first", () => {
		render(<DexConfigs {...dexConfigsProps()} />);

		const heavy = screen.getByText("2 weight · 3 of 5");
		const light = screen.getByText("1 weight · 2 of 3");

		expect(
			heavy.compareDocumentPosition(light) & Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
	});

	it("seats every chip under its own weight", () => {
		render(<DexConfigs {...dexConfigsProps()} />);

		const heavy = screen.getByText("2 weight · 3 of 5").parentElement;
		const light = screen.getByText("1 weight · 2 of 3").parentElement;

		expect(heavy).toHaveTextContent("Code Coverage");
		expect(heavy).not.toHaveTextContent(".js");
		expect(light).toHaveTextContent(".js");
	});

	it("draws granted, met and locked chips side by side in one row", () => {
		render(<DexConfigs {...dexConfigsProps()} />);

		expect(screen.getByText("Regression Test")).toBeVisible();
		expect(screen.getByText("Planning Poker")).toBeVisible();
		expect(screen.getAllByText("???")).toHaveLength(3);
	});

	it("pins exactly the chip named as open", () => {
		render(<DexConfigs {...dexConfigsProps({ openInfo: "js" })} />);

		expect(screen.getByRole("button", { name: "About .js" })).toHaveAttribute(
			"aria-expanded",
			"true"
		);
		expect(
			screen.getByRole("button", { name: "About ESLint" })
		).toHaveAttribute("aria-expanded", "false");
	});

	it("reports which chip's i was pressed rather than opening on its own", async () => {
		const onToggleInfo = vi.fn();
		render(<DexConfigs {...dexConfigsProps({ onToggleInfo })} />);

		await userEvent.click(screen.getByRole("button", { name: "About .js" }));

		expect(onToggleInfo).toHaveBeenCalledWith("js");
	});

	it("states the collection's rule in the footer", () => {
		render(<DexConfigs {...dexConfigsProps()} />);

		expect(
			screen.getByText(
				"Configs in the deck can be dealt into a hand or offered in the shop."
			)
		).toBeVisible();
	});
});
