import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";

import { draftCost } from "~/modules/run/configs/config.model";
import { CONFIGS } from "~/modules/run/configs/configRoster.model";
import { MAX_SLOTS } from "~/modules/run/pipeline/pipeline.model";
import { STORAGE_PLANS } from "~/modules/run/rules.model";
import { ShopScreen } from "./ShopScreen.ui";

const plansOn = (currentTier: number, storage = 0) =>
	STORAGE_PLANS.map((plan) => ({
		...plan,
		current: plan.tier === currentTier,
		burnKb: Math.max(0, storage - plan.capKb),
	}));

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
	draftOptions: [CONFIGS.eslint, CONFIGS.agentsMd],
	onDraft: vi.fn(),
	rebuildCost: 1,
	canRebuild: true,
	onRebuild: vi.fn(),
	slots: 3,
	pollsPerGate: 5,
	stripsOnFailure: 1,
	modifiers: {
		gateReward: 180,
		rewardMultiplier: 1.5,
		coverageMultiplier: 2,
		coverageAdd: 0.5,
	},
	coverage: 25,
	slotCoverageRequired: 20,
	justUnlockedSlots: [],
	onUpgrade: vi.fn(),
	onSell: vi.fn(),
	storagePlans: plansOn(1),
	onChangePlan: vi.fn(),
};

describe(ShopScreen, () => {
	it("renders the upgrade heading and draft options", () => {
		render(<ShopScreen {...base} />);
		expect(
			screen.getByRole("heading", { name: /Upgrade your pipeline/ })
		).toBeInTheDocument();
		expect(screen.getByText("ESLint")).toBeInTheDocument();
	});

	// The shop sits between gates: what you are building for is the gate ahead,
	// named after the badge clearing it awards.
	it("names the gate ahead by its badge, not by its number alone", () => {
		render(<ShopScreen {...base} />);
		expect(
			screen.getByRole("heading", {
				name: "Your pipeline for Cascade gate 2",
			})
		).toBeInTheDocument();
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
			screen.getByRole("button", { name: /Uninstall/ })
		).toBeInTheDocument();
	});

	it("parks Unit Tests' upgrade when storage can't cover it", () => {
		render(<ShopScreen {...base} configs={[CONFIGS.unitTests]} storage={40} />);
		expect(screen.getByRole("button", { name: /Upgrade/ })).toBeDisabled();
		expect(screen.getByText(/Costs 64KB — you have 40KB/)).toBeInTheDocument();
	});

	it("explains a gated upgrade on hover — next level's effect and the category-tied coverage in bold", () => {
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
		expect(screen.getByText("React")).toHaveClass("font-bold");
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

	it("shows the storage reward earnable this gate in the rewards receipt", () => {
		render(
			<ShopScreen
				{...base}
				modifiers={{ ...base.modifiers, gateReward: 240, rewardMultiplier: 2 }}
			/>
		);
		const receipt = within(screen.getByTestId("gate-stake-receipt"));
		expect(receipt.getByText("+240KB")).toBeInTheDocument();
		expect(receipt.getByText(/storage/)).toBeInTheDocument();
		expect(receipt.getByText(/coverage/)).toBeInTheDocument();
	});

	// Row order follows the config's gate role, not the prop order, so this asserts
	// every row sells its own config rather than indexing into the rendered list.
	it("sells a config from its row's deinstall button", () => {
		const onSell = vi.fn();
		render(
			<ShopScreen
				{...base}
				configs={[CONFIGS.indexedDb, CONFIGS.rb]}
				onSell={onSell}
			/>
		);
		for (const button of screen.getAllByRole("button", { name: /Uninstall/ }))
			fireEvent.click(button);
		expect(onSell.mock.calls.flat()).toEqual(
			expect.arrayContaining(["indexed-db", "rb"])
		);
	});

	// A bare pipeline can never clear a gate (ADR-017), so the shop refuses to
	// empty the build — a run only dies at a gate it failed (ADR-021).
	it("locks the deinstall button on the only installed config", () => {
		const onSell = vi.fn();
		render(
			<ShopScreen {...base} configs={[CONFIGS.indexedDb]} onSell={onSell} />
		);
		const deinstall = screen.getByRole("button", { name: /Uninstall/ });
		expect(deinstall).toBeDisabled();
		expect(
			screen.getByText(/deinstalling it would leave nothing to clear a gate/i)
		).toBeInTheDocument();
		fireEvent.click(deinstall);
		expect(onSell).not.toHaveBeenCalled();
	});

	it("shows the next slot locked with live progress — no unlock button anywhere", () => {
		render(<ShopScreen {...base} coverage={12} slotCoverageRequired={20} />);
		// Badges belong to gates now, so this row prices width and nothing else.
		expect(screen.queryByText(/Swatch/)).not.toBeInTheDocument();
		expect(screen.getByText("12% reached")).toBeInTheDocument();
		expect(
			screen.getByRole("progressbar", { name: "coverage toward slot 4" })
		).toHaveAttribute("aria-valuenow", "12");
		// Width claims itself automatically (ADR-025) — there is no purchase step.
		expect(
			screen.queryByRole("button", { name: "Unlock slot" })
		).not.toBeInTheDocument();
	});

	it("acknowledges a slot auto-widened since the last visit instead of the next lock row", () => {
		render(<ShopScreen {...base} justUnlockedSlots={[4]} />);
		expect(screen.getByText("Unlocked 4th slot")).toBeInTheDocument();
		expect(screen.queryByText(/Opens at/)).not.toBeInTheDocument();
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

	it("lists the storage-plan ladder with the current rung marked", () => {
		render(<ShopScreen {...base} />);
		expect(screen.getByText("free")).toBeInTheDocument();
		expect(screen.getByText("512KB")).toBeInTheDocument();
		expect(screen.getByText("640KB")).toBeInTheDocument();
		// Only the current (512KB) rung is plain text — the others are switch buttons.
		expect(
			screen.queryByRole("button", { name: /512KB storage plan/ })
		).not.toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /640KB storage plan/ })
		).toBeInTheDocument();
	});

	it("prices every paid rung per gate", () => {
		render(<ShopScreen {...base} />);
		expect(screen.getByText("-8KB/gate")).toBeInTheDocument();
		expect(screen.getByText("-16KB/gate")).toBeInTheDocument();
	});

	it("switches the storage plan when a rung's row is clicked", () => {
		const onChangePlan = vi.fn();
		render(<ShopScreen {...base} onChangePlan={onChangePlan} />);
		fireEvent.click(screen.getByRole("button", { name: /640KB storage plan/ }));
		expect(onChangePlan).toHaveBeenCalledWith(2);
	});

	it("names the burn a downgrade would cost on hover", () => {
		render(
			<ShopScreen {...base} storage={700} storagePlans={plansOn(3, 700)} />
		);
		const toFreeTier = screen.getByRole("button", {
			name: /512KB storage plan/,
		});
		fireEvent.mouseEnter(toFreeTier);
		expect(
			screen.getByText("Switching burns the 188KB sitting above this cap.")
		).toBeInTheDocument();
	});
});
