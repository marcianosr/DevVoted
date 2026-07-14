import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { CONFIGS } from "~/modules/session-run/configs/configRoster.model";
import { ConfiguringScreen } from "./ConfiguringScreen.ui";

const base = {
	configs: [CONFIGS.js],
	slots: 3,
	bench: [CONFIGS.eslint, CONFIGS.copilot],
	gateNumber: 1,
	pollsToGate: 5,
	gateReward: 120,
	checks: [
		{
			label: "Correct",
			progress: "0/1",
			current: 0,
			target: 1,
			state: "running" as const,
		},
	],
	onSlot: vi.fn(),
	onUnslot: vi.fn(),
};

describe("ConfiguringScreen", () => {
	it("renders the heading, the build summary, and the bench", () => {
		render(<ConfiguringScreen {...base} />);
		expect(
			screen.getByRole("heading", { name: /Configure your pipeline/ })
		).toBeInTheDocument();
		expect(screen.getByText("Correct")).toBeInTheDocument();
		expect(screen.getByText("ESLint")).toBeInTheDocument();
	});

	it("slots a clicked bench config", () => {
		const onSlot = vi.fn();
		render(<ConfiguringScreen {...base} onSlot={onSlot} />);
		fireEvent.click(screen.getByRole("button", { name: /ESLint/ }));
		expect(onSlot).toHaveBeenCalledWith("eslint");
	});
});
