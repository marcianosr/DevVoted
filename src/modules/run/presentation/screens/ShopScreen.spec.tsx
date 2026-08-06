import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { draftCost } from "~/modules/run/configs/config.model";
import { CONFIGS } from "~/modules/run/configs/configRoster.model";
import { MAX_SLOTS } from "~/modules/run/pipeline/pipeline.model";
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

	it("installs an offer when its chip is clicked", () => {
		const onDraft = vi.fn();
		render(<ShopScreen {...base} onDraft={onDraft} />);
		fireEvent.click(screen.getByRole("button", { name: /ESLint/ }));
		expect(onDraft).toHaveBeenCalledWith("eslint");
	});

	it("prices each offer chip in storage", () => {
		render(<ShopScreen {...base} />);
		expect(screen.getAllByText(`${draftCost(CONFIGS.eslint)}KB`).length).toBe(
			1
		);
	});

	it("parks the offer chips behind a make-room tooltip when the pipeline is full", () => {
		render(
			<ShopScreen
				{...base}
				configs={[CONFIGS.js, CONFIGS.css, CONFIGS.rb]}
				slots={3}
			/>
		);
		expect(screen.getByRole("button", { name: /ESLint/ })).toBeDisabled();
		expect(
			screen.getAllByText(
				"Add a new slot to upgrade or sell an existing config"
			).length
		).toBeGreaterThan(0);
	});

	it("disables an offer the run can't afford and previews nothing on hover", () => {
		render(<ShopScreen {...base} storage={8} />);
		const chip = screen.getByRole("button", { name: /ESLint/ });
		expect(chip).toBeDisabled();
		fireEvent.mouseEnter(chip.parentElement as HTMLElement);
		// No ghost row: previewing an offer you cannot buy read as if it had been
		// installed. The chip's own price tag carries the refusal.
		expect(
			screen.queryByText(/Cross out a wrong answer/)
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /^Add .+ to your pipeline$/ })
		).not.toBeInTheDocument();
	});

	it("rebuilds the offers for a fee", () => {
		const onRebuild = vi.fn();
		render(<ShopScreen {...base} onRebuild={onRebuild} />);
		fireEvent.click(screen.getByRole("button", { name: /Rebuild offers/ }));
		expect(onRebuild).toHaveBeenCalled();
	});

	it("previews an installable offer inside the pipeline, with its effect and price", () => {
		render(<ShopScreen {...base} />);
		const chip = screen.getByRole("button", { name: /ESLint/ });
		fireEvent.mouseEnter(chip.parentElement as HTMLElement);

		expect(screen.getByText(/Cross out a wrong answer/)).toBeInTheDocument();
		// The row is the button; the trailing text is purely the price.
		expect(
			screen.getByRole("button", { name: "Add ESLint to your pipeline" })
		).toBeInTheDocument();
		expect(
			screen.getAllByText(`${draftCost(CONFIGS.eslint)}KB`).length
		).toBeGreaterThan(0);
	});

	it("previews nothing when the pipeline has no room for the offer", () => {
		render(
			<ShopScreen
				{...base}
				configs={[CONFIGS.js, CONFIGS.css, CONFIGS.rb]}
				slots={3}
			/>
		);
		const chip = screen.getByRole("button", { name: /ESLint/ });
		fireEvent.mouseEnter(chip.parentElement as HTMLElement);
		// A full pipeline has no slot to draw the ghost into, so none is drawn.
		expect(
			screen.queryByText(/Cross out a wrong answer/)
		).not.toBeInTheDocument();
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
		// The upgrade's own gate line is gone; "Opens at" may still appear in the
		// slot unlock row, so the check pins the upgrade's 5% threshold.
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

	it("shows the storage reward earnable this gate in the gate modifier strip", () => {
		render(<ShopScreen {...base} gateReward={240} rewardMultiplier={2} />);
		expect(screen.getByText("+240KB")).toBeInTheDocument();
		expect(screen.getByText("reward on clear")).toBeInTheDocument();
		expect(screen.getByText("coverage ×")).toBeInTheDocument();
	});

	it("sells a config from its row's deinstall button", () => {
		const onSell = vi.fn();
		render(
			<ShopScreen {...base} configs={[CONFIGS.indexedDb]} onSell={onSell} />
		);
		fireEvent.click(screen.getByRole("button", { name: /Deinstall/ }));
		expect(onSell).toHaveBeenCalledWith("indexed-db");
	});

	it("shows the next slot locked with live progress — no unlock button below the rung", () => {
		render(
			<ShopScreen
				{...base}
				canAddSlot={false}
				coverage={12}
				slotCoverageRequired={20}
			/>
		);
		// Badges belong to gates now, so this row prices width and nothing else.
		expect(screen.queryByText(/Swatch/)).not.toBeInTheDocument();
		expect(screen.getByText("12% reached")).toBeInTheDocument();
		expect(
			screen.getByRole("progressbar", { name: "coverage toward slot 4" })
		).toHaveAttribute("aria-valuenow", "12");
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

	it("advances the row to the next slot as the pipeline widens", () => {
		render(<ShopScreen {...base} slots={4} />);
		expect(
			screen.getByRole("progressbar", { name: "coverage toward slot 5" })
		).toBeInTheDocument();
	});

	it("retires the unlock row at the slot cap", () => {
		render(
			<ShopScreen {...base} slots={MAX_SLOTS} slotCoverageRequired={Infinity} />
		);
		expect(screen.queryByText(/reached/)).not.toBeInTheDocument();
	});
});
