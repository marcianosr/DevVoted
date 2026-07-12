import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { CONFIGS } from "~/modules/session-run/configs/configRoster.model";
import { RewardScreen } from "./RewardScreen.ui";

const base = {
	storage: 440,
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
	configs: [],
	newConfigIds: [],
	draftOptions: [CONFIGS.eslint, CONFIGS.copilot],
	onDraft: vi.fn(),
	rebuildCost: 1,
	canRebuild: true,
	onRebuild: vi.fn(),
	slots: 3,
	canAddSlot: true,
	onAddSlot: vi.fn(),
	upgradeable: [CONFIGS.js],
	onUpgrade: vi.fn(),
	onNext: vi.fn(),
};

describe("RewardScreen", () => {
	it("renders the reward header and draft options", () => {
		render(<RewardScreen {...base} />);
		expect(
			screen.getByRole("heading", { name: /build your pipeline/ })
		).toBeInTheDocument();
		expect(screen.getByText("ESLint")).toBeInTheDocument();
	});

	it("drafts a config", () => {
		const onDraft = vi.fn();
		render(<RewardScreen {...base} onDraft={onDraft} />);
		fireEvent.click(screen.getByRole("button", { name: /ESLint/ }));
		expect(onDraft).toHaveBeenCalledWith("eslint");
	});

	it("advances only on the explicit Next button", () => {
		const onNext = vi.fn();
		render(<RewardScreen {...base} onNext={onNext} />);
		fireEvent.click(screen.getByRole("button", { name: /Next/ }));
		expect(onNext).toHaveBeenCalledTimes(1);
	});
});
