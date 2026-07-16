import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { CONFIGS } from "~/modules/session-run/configs/configRoster.model";
import { ShopScreen } from "./ShopScreen.ui";

const base = {
	storage: 440,
	coverageByCategory: {},
	gateNumber: 2,
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
	gateReward: 180,
	rewardMultiplier: 1.5,
	coverageMultiplier: 2,
	coverageAdd: 0.5,
	coverage: 25,
	slotCoverageRequired: 20,
	canAddSlot: true,
	onAddSlot: vi.fn(),
	onUpgrade: vi.fn(),
	onSell: vi.fn(),
};

describe(ShopScreen, () => {
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

	it("shows the upgrade cost in a fixed config's action popover", () => {
		render(<ShopScreen {...base} configs={[CONFIGS.unitTests]} />);
		fireEvent.click(screen.getByRole("button", { name: /Unit Tests/ }));
		expect(
			screen.getByRole("button", { name: /Upgrade \(60KB\)/ })
		).toBeInTheDocument();
	});

	it("shows the projected gate reward for the current build", () => {
		render(<ShopScreen {...base} gateReward={240} rewardMultiplier={2} />);
		expect(screen.getByText(/Clears for/)).toBeInTheDocument();
		expect(screen.getByText("240KB")).toBeInTheDocument();
	});

	it("sells a config from its loadout popover", () => {
		const onSell = vi.fn();
		render(
			<ShopScreen {...base} configs={[CONFIGS.indexedDb]} onSell={onSell} />
		);
		fireEvent.click(screen.getByRole("button", { name: /IndexedDB/ }));
		fireEvent.click(screen.getByRole("button", { name: /Sell/ }));
		expect(onSell).toHaveBeenCalledWith("indexed-db");
	});

	it("shows the coverage requirement when a slot is locked", () => {
		render(
			<ShopScreen
				{...base}
				canAddSlot={false}
				coverage={12}
				slotCoverageRequired={20}
			/>
		);
		expect(
			screen.getByText(/at 20% coverage — you have 12%/)
		).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /Add slot/ })
		).not.toBeInTheDocument();
	});
});
