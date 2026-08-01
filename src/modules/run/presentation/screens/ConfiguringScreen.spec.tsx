import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { CONFIGS } from "~/modules/run/configs/configRoster.model";
import { ConfiguringScreen } from "./ConfiguringScreen.ui";

const base = {
	configs: [CONFIGS.unitTests, CONFIGS.js],
	slots: 3,
	bench: [CONFIGS.eslint, CONFIGS.copilot],
	gateReward: 80,
	rewardMultiplier: 1,
	coverageMultiplier: 1,
	coverageAdd: 0,
	checks: [
		{
			label: "Correct",
			progress: "0/1",
			current: 0,
			target: 1,
			state: "running" as const,
			sourceConfigId: "unit-tests",
			description: "1 correct answer",
		},
	],
	onSlot: vi.fn(),
	onUnslot: vi.fn(),
};

describe(ConfiguringScreen, () => {
	it("renders the bench and pipeline columns side by side", () => {
		render(<ConfiguringScreen {...base} />);
		expect(
			screen.getByRole("heading", { name: "Available configs" })
		).toBeInTheDocument();
		expect(
			screen.getByRole("heading", { name: "Your pipeline" })
		).toBeInTheDocument();
	});

	it("shows what a pipeline config gives and needs", () => {
		render(<ConfiguringScreen {...base} />);
		expect(screen.getByText("+32KB on clear")).toBeInTheDocument();
		expect(screen.getByText("1 correct answer")).toBeInTheDocument();
	});

	it("marks pipeline rows with a state dot instead of a status badge", () => {
		render(<ConfiguringScreen {...base} />);
		expect(screen.getByRole("img", { name: "running" })).toBeInTheDocument();
		expect(screen.queryByText("RUN")).not.toBeInTheDocument();
	});

	it("counts the used slots in the pipeline subtitle", () => {
		render(<ConfiguringScreen {...base} />);
		expect(screen.getByText("2 of 3 slots used")).toBeInTheDocument();
	});

	it("shows the gate reward and multipliers", () => {
		render(<ConfiguringScreen {...base} />);
		expect(screen.getByText("+80KB")).toBeInTheDocument();
		expect(screen.getAllByText("×1")).toHaveLength(2);
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
