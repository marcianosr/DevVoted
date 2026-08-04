import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { CONFIGS } from "~/modules/run/configs/configRoster.model";
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

	it("buys an offer from its row's buy button", () => {
		const onDraft = vi.fn();
		render(<ShopScreen {...base} onDraft={onDraft} />);
		fireEvent.click(screen.getAllByRole("button", { name: /buy/ })[0]);
		expect(onDraft).toHaveBeenCalledWith("eslint");
	});

	it("parks the buy button behind a make-room tooltip when the pipeline is full", () => {
		render(
			<ShopScreen
				{...base}
				configs={[CONFIGS.js, CONFIGS.css, CONFIGS.rb]}
				slots={3}
			/>
		);
		for (const buy of screen.getAllByRole("button", { name: /buy/ })) {
			expect(buy).toBeDisabled();
		}
		expect(
			screen.getAllByText(
				"Add a new slot to upgrade or sell an existing config"
			).length
		).toBeGreaterThan(0);
	});

	it("dims an offer the run can't afford and prices the gap instead", () => {
		render(<ShopScreen {...base} storage={8} />);
		expect(
			screen.queryByRole("button", { name: /buy/ })
		).not.toBeInTheDocument();
		expect(screen.getAllByText(/need/).length).toBeGreaterThan(0);
	});

	it("rerolls the offers for a fee", () => {
		const onRebuild = vi.fn();
		render(<ShopScreen {...base} onRebuild={onRebuild} />);
		fireEvent.click(screen.getByRole("button", { name: /Reroll offers/ }));
		expect(onRebuild).toHaveBeenCalled();
	});

	it("offers no upgrade control on Unit Tests — only focus configs level", () => {
		render(<ShopScreen {...base} configs={[CONFIGS.unitTests]} />);
		expect(
			screen.queryByRole("button", { name: /upgrade/ })
		).not.toBeInTheDocument();
		expect(screen.queryByText("maxed")).not.toBeInTheDocument();
		expect(screen.getByRole("button", { name: /sell/ })).toBeInTheDocument();
	});

	it("explains a gated upgrade on hover — next level and the category-tied coverage", () => {
		render(
			<ShopScreen
				{...base}
				configs={[CONFIGS.jsx]}
				coverageByCategory={{ react: 2 }}
			/>
		);
		expect(screen.getByRole("button", { name: /upgrade/ })).toBeDisabled();
		expect(
			screen.getByText(
				"Upgrade this to L2 for a stronger effect. You need 5% coverage in React for this — you have 2%."
			)
		).toBeInTheDocument();
	});

	it("prices a focus config's upgrade in coverage on its row button", () => {
		const onUpgrade = vi.fn();
		render(
			<ShopScreen
				{...base}
				configs={[CONFIGS.js]}
				coverageByCategory={{ js: 10 }}
				onUpgrade={onUpgrade}
			/>
		);
		const upgrade = screen.getByRole("button", { name: /upgrade 5% cov/ });
		expect(upgrade).toBeEnabled();
		fireEvent.click(upgrade);
		expect(onUpgrade).toHaveBeenCalledWith("js");
	});

	it("shows the storage reward earnable this gate below the pipeline", () => {
		render(<ShopScreen {...base} gateReward={240} rewardMultiplier={2} />);
		expect(screen.getByText("+240KB")).toBeInTheDocument();
		expect(screen.getByText(/storage this gate/)).toBeInTheDocument();
	});

	it("sells a config from its row's sell button", () => {
		const onSell = vi.fn();
		render(
			<ShopScreen {...base} configs={[CONFIGS.indexedDb]} onSell={onSell} />
		);
		fireEvent.click(screen.getByRole("button", { name: /sell/ }));
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
