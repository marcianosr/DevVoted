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

	it("buys an offer from its row's install button", () => {
		const onDraft = vi.fn();
		render(<ShopScreen {...base} onDraft={onDraft} />);
		fireEvent.click(screen.getAllByRole("button", { name: /Install/ })[0]);
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
		for (const buy of screen.getAllByRole("button", { name: /Install/ })) {
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
			screen.queryByRole("button", { name: /Install/ })
		).not.toBeInTheDocument();
		expect(screen.getAllByText(/need/).length).toBeGreaterThan(0);
	});

	it("rerolls the offers for a fee", () => {
		const onRebuild = vi.fn();
		render(<ShopScreen {...base} onRebuild={onRebuild} />);
		fireEvent.click(screen.getByRole("button", { name: /Reroll offers/ }));
		expect(onRebuild).toHaveBeenCalled();
	});

	it("prices Unit Tests' upgrade in storage, unlike free focus upgrades", () => {
		render(<ShopScreen {...base} configs={[CONFIGS.unitTests]} />);
		const upgrade = screen.getByRole("button", { name: /Upgrade/ });
		expect(upgrade).toBeEnabled(); // base storage 440 covers the 64KB
		expect(upgrade).toHaveTextContent("64KB");
		expect(
			screen.getByRole("button", { name: /Deinstall/ })
		).toBeInTheDocument();
	});

	it("parks Unit Tests' upgrade when storage can't cover it", () => {
		render(<ShopScreen {...base} configs={[CONFIGS.unitTests]} storage={40} />);
		expect(screen.getByRole("button", { name: /Upgrade/ })).toBeDisabled();
		expect(screen.getByText(/Costs 64KB — you have 40KB/)).toBeInTheDocument();
	});

	it("explains a gated upgrade on hover — next level's effect and the category-tied coverage in its own color", () => {
		render(
			<ShopScreen
				{...base}
				configs={[CONFIGS.jsx]}
				coverageByCategory={{ react: 2 }}
			/>
		);
		expect(screen.getByRole("button", { name: /Upgrade/ })).toBeDisabled();
		expect(
			screen.getByText(/L2: React polls earn 1\.5× coverage/)
		).toBeInTheDocument();
		expect(screen.getByText(/Unlocks at 5%/)).toBeInTheDocument();
		expect(screen.getByText(/you have 2%/)).toBeInTheDocument();
		const category = screen.getByText("React");
		expect(category).toHaveClass("text-theme");
		expect(category).toHaveAttribute("data-category-theme", "react");
	});

	it("previews the next level's effect on hover once the upgrade is unlocked", () => {
		render(
			<ShopScreen
				{...base}
				configs={[CONFIGS.js]}
				coverageByCategory={{ js: 10 }}
			/>
		);
		expect(screen.getByRole("button", { name: "Upgrade" })).toBeEnabled();
		expect(
			screen.getByText(
				"L2: JavaScript polls earn 1.5× coverage — but if JavaScript shows, you must get 2 right."
			)
		).toBeInTheDocument();
		// The upgrade's own gate line is gone; "Unlocks at" may still appear in
		// the slot-swatch row, so the check pins the upgrade's 5% threshold.
		expect(screen.queryByText(/Unlocks at 5%/)).not.toBeInTheDocument();
	});

	it("unlocks a met upgrade — prismatic ring, no coverage price on the button", () => {
		const onUpgrade = vi.fn();
		render(
			<ShopScreen
				{...base}
				configs={[CONFIGS.js]}
				coverageByCategory={{ js: 10 }}
				onUpgrade={onUpgrade}
			/>
		);
		const upgrade = screen.getByRole("button", { name: "Upgrade" });
		expect(upgrade).toBeEnabled();
		expect(upgrade).toHaveClass("legendary-ring");
		fireEvent.click(upgrade);
		expect(onUpgrade).toHaveBeenCalledWith("js");
	});

	it("keeps the ring off a gated upgrade button", () => {
		render(
			<ShopScreen
				{...base}
				configs={[CONFIGS.jsx]}
				coverageByCategory={{ react: 2 }}
			/>
		);
		expect(screen.getByRole("button", { name: /Upgrade/ })).not.toHaveClass(
			"legendary-ring"
		);
	});

	it("shows the storage reward earnable this gate below the pipeline", () => {
		render(<ShopScreen {...base} gateReward={240} rewardMultiplier={2} />);
		expect(screen.getByText("+240KB")).toBeInTheDocument();
		expect(screen.getByText(/storage this gate/)).toBeInTheDocument();
	});

	it("sells a config from its row's deinstall button", () => {
		const onSell = vi.fn();
		render(
			<ShopScreen {...base} configs={[CONFIGS.indexedDb]} onSell={onSell} />
		);
		fireEvent.click(screen.getByRole("button", { name: /Deinstall/ }));
		expect(onSell).toHaveBeenCalledWith("indexed-db");
	});

	it("shows the next swatch locked with live progress — no unlock button below the gate", () => {
		render(
			<ShopScreen
				{...base}
				canAddSlot={false}
				coverage={12}
				slotCoverageRequired={20}
			/>
		);
		expect(screen.getByText("Boulder Swatch")).toBeInTheDocument();
		expect(screen.getByText(/· slot 4 · opens gate 1/)).toBeInTheDocument();
		expect(screen.getByText("12%")).toBeInTheDocument();
		expect(
			screen.getByRole("progressbar", {
				name: "coverage toward Boulder Swatch",
			})
		).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: "Unlock slot" })
		).not.toBeInTheDocument();
	});

	it("unlocks the next slot once its coverage gate is met", () => {
		const onAddSlot = vi.fn();
		render(<ShopScreen {...base} onAddSlot={onAddSlot} />);
		fireEvent.click(screen.getByRole("button", { name: "Unlock slot" }));
		expect(onAddSlot).toHaveBeenCalled();
	});

	it("advances the row to the next swatch as the pipeline widens", () => {
		render(<ShopScreen {...base} slots={4} />);
		expect(screen.getByText("Cascade Swatch")).toBeInTheDocument();
		expect(screen.queryByText("Boulder Swatch")).not.toBeInTheDocument();
	});

	it("retires the swatch row at the slot cap", () => {
		render(<ShopScreen {...base} slots={12} slotCoverageRequired={Infinity} />);
		expect(screen.queryByText(/Swatch$/)).not.toBeInTheDocument();
	});
});
