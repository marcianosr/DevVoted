import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { CONFIGS } from "~/modules/session-run/configs/configRoster.model";
import { ConfiguringScreen } from "./ConfiguringScreen.ui";

const base = {
	configs: [CONFIGS.js],
	slots: 3,
	bench: [CONFIGS.eslint, CONFIGS.copilot],
	demands: ["1 correct answer"],
	rewardMultiplier: 1,
	onSlot: vi.fn(),
	onUnslot: vi.fn(),
	onStart: vi.fn(),
};

describe("ConfiguringScreen", () => {
	it("renders the heading, the build summary, and the bench", () => {
		render(<ConfiguringScreen {...base} />);
		expect(
			screen.getByRole("heading", { name: /Configure your pipeline/ })
		).toBeInTheDocument();
		expect(screen.getByText("• 1 correct answer")).toBeInTheDocument();
		expect(screen.getByText("ESLint")).toBeInTheDocument();
	});

	it("disables Start until at least one config is slotted", () => {
		render(<ConfiguringScreen {...base} configs={[]} />);
		expect(
			screen.getByRole("button", { name: /Slot a config to start/ })
		).toBeDisabled();
	});

	it("slots a bench config and starts the climb", () => {
		const onSlot = vi.fn();
		const onStart = vi.fn();
		render(<ConfiguringScreen {...base} onSlot={onSlot} onStart={onStart} />);
		fireEvent.click(screen.getByRole("button", { name: /ESLint/ }));
		expect(onSlot).toHaveBeenCalledWith("eslint");
		fireEvent.click(screen.getByRole("button", { name: /Start the climb/ }));
		expect(onStart).toHaveBeenCalledTimes(1);
	});
});
