import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { CONFIGS } from "~/modules/session-run/configs/configRoster.model";
import { ShopScreen } from "./ShopScreen.ui";

const base = {
	storage: 440,
	coverageByCategory: {},
	gateNumber: 2,
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
};

describe("ShopScreen", () => {
	it("renders the upgrade heading and draft options", () => {
		render(<ShopScreen {...base} />);
		expect(
			screen.getByRole("heading", { name: /Upgrade your pipeline/ })
		).toBeInTheDocument();
		expect(screen.getByText("ESLint")).toBeInTheDocument();
	});

	it("drafts a config", () => {
		const onDraft = vi.fn();
		render(<ShopScreen {...base} onDraft={onDraft} />);
		fireEvent.click(screen.getByRole("button", { name: /ESLint/ }));
		expect(onDraft).toHaveBeenCalledWith("eslint");
	});
});
