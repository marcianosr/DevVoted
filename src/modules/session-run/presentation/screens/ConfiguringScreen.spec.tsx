import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { CONFIGS } from "~/modules/session-run/configs/configRoster.model";
import { ConfiguringScreen } from "./ConfiguringScreen.ui";

const base = {
	configs: [CONFIGS.unitTests, CONFIGS.js],
	slots: 3,
	bench: [CONFIGS.eslint, CONFIGS.copilot],
	victoryGate: 5,
	gateReward: 120,
	checks: [
		{
			label: "Correct",
			progress: "0/1",
			current: 0,
			target: 1,
			state: "running" as const,
			sourceConfigId: "unit-tests",
		},
	],
	onSlot: vi.fn(),
	onUnslot: vi.fn(),
};

describe("ConfiguringScreen", () => {
	it("renders both numbered steps and the run stakes", () => {
		render(<ConfiguringScreen {...base} />);
		expect(
			screen.getByRole("heading", { name: /Pick your stack/ })
		).toBeInTheDocument();
		expect(
			screen.getByRole("heading", { name: /Review your build/ })
		).toBeInTheDocument();
		expect(screen.getByText(/Run stakes/i)).toBeInTheDocument();
	});

	it("renders the bench offers", () => {
		render(<ConfiguringScreen {...base} />);
		expect(screen.getByText("ESLint")).toBeInTheDocument();
	});

	it("slots a clicked bench config", () => {
		const onSlot = vi.fn();
		render(<ConfiguringScreen {...base} onSlot={onSlot} />);
		fireEvent.click(screen.getByRole("button", { name: /ESLint/ }));
		expect(onSlot).toHaveBeenCalledWith("eslint");
	});

	it("removes a non-fixed slotted config", () => {
		const onUnslot = vi.fn();
		render(<ConfiguringScreen {...base} onUnslot={onUnslot} />);
		fireEvent.click(screen.getByRole("button", { name: /Remove \.js/ }));
		expect(onUnslot).toHaveBeenCalledWith("js");
	});
});
