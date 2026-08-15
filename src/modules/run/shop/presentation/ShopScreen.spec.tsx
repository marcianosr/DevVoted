import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";

import { draftCost } from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { MAX_SLOTS } from "~/modules/run/pipeline/domain/pipeline.model";
import type { GateStake } from "~/modules/run/run/application/runView.viewmodel";
import { STORAGE_PLANS } from "~/modules/run/run/domain/rules.model";
import {
	ShopScreen,
	shopExitAction,
} from "~/modules/run/shop/presentation/ShopScreen.ui";
import {
	createMockGateStake,
	createMockShopOffer,
} from "~/test/runView.factory";

/** Every rung unlocked, as a deep run sees the ladder. */
const plansOn = (currentTier: number, storage = 0) =>
	STORAGE_PLANS.map((plan) => ({
		...plan,
		current: plan.tier === currentTier,
		burnKb: Math.max(0, storage - plan.capKb),
		locked: false,
	}));

/**
 * The refusal panel belonging to one badge, not the offer panel it sits inside.
 * Keyed on the nested tooltip's own named group — the scoping that stops it
 * opening whenever the chip is hovered.
 */
const refusalOn = (badge: HTMLElement): HTMLElement => {
	const scope = badge.closest('[class~="group/nested"]');
	if (!(scope instanceof HTMLElement))
		throw new Error(`${badge.textContent} is not inside a nested tooltip`);
	return within(scope).getByRole("tooltip");
};

const stake = createMockGateStake({
	gateNumber: 2,
	minConfigs: 1,
	modifiers: {
		gateReward: 180,
		rewardMultiplier: 1.5,
		coverageMultiplier: 2,
		coverageAdd: 0.5,
	},
	perAnswer: {
		coveragePerCorrect: 3,
		storageKbPerCorrect: 0,
	},
});

const stakeWith = (overrides: Partial<GateStake>): GateStake => ({
	...stake,
	...overrides,
});

const base = {
	storage: 440,
	coverageByCategory: {},
	stake,
	checks: [
		{
			label: "Correct",
			progress: { kind: "answers" as const, current: 0, target: 1 },
			current: 0,
			target: 1,
			state: "running" as const,
		},
	],
	configs: [],
	atMinimumWidth: false,
	newConfigIds: [],
	offers: [CONFIGS.eslint, CONFIGS.agentsMd].map((c) => createMockShopOffer(c)),
	onDraft: vi.fn(),
	rebuildCost: 1,
	canRebuild: true,
	onRebuild: vi.fn(),
	lockAvailable: true,
	lockCost: 16,
	canLock: true,
	onLock: vi.fn(),
	extendAvailable: true,
	extendCost: 48,
	canExtend: true,
	onExtend: vi.fn(),
	slots: 3,
	nextSlotGate: 1,
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

	// Two taps, not one: a chip is a big target next to other big targets, and on
	// a phone brushing one used to spend up to 384KB with no way back.
	it("spends nothing when an offer chip is tapped", () => {
		const onDraft = vi.fn();
		const onLock = vi.fn();
		render(<ShopScreen {...base} onDraft={onDraft} onLock={onLock} />);
		fireEvent.click(screen.getByRole("button", { name: "ESLint" }));
		expect(onDraft).not.toHaveBeenCalled();
		expect(onLock).not.toHaveBeenCalled();
	});

	it("installs the selected offer when its own Install button is pressed", () => {
		const onDraft = vi.fn();
		render(<ShopScreen {...base} onDraft={onDraft} />);
		fireEvent.click(screen.getByRole("button", { name: "ESLint" }));
		fireEvent.click(
			screen.getByRole("button", {
				name: `Install ESLint for ${draftCost(CONFIGS.eslint)}KB`,
			})
		);
		expect(onDraft).toHaveBeenCalledWith("eslint");
	});

	// The badge carries all three states in one spot: price → install → owned.
	// Scoped to the offers panel, since the pipeline beside it draws its own chips
	// (and the ghost row repeats the price the offer stopped showing).
	it("shows install button in tooltip when config is selected", () => {
		render(<ShopScreen {...base} />);
		const offers = () =>
			within(screen.getByRole("group", { name: /Install configs/ }));
		// Price badge visible by default
		expect(
			offers().getByText(`${draftCost(CONFIGS.eslint)}KB`)
		).toBeInTheDocument();
		// Clicking the chip makes the tooltip appear
		fireEvent.click(offers().getByRole("button", { name: "ESLint" }));
		// Tooltip contains the install button
		expect(
			screen.getByRole("button", { name: /Install ESLint/ })
		).toBeInTheDocument();
		// Price badge stays visible (not replaced)
		expect(
			offers().getByText(`${draftCost(CONFIGS.eslint)}KB`)
		).toBeInTheDocument();
	});

	it("marks an offer already installed as owned and stops selling it", () => {
		render(
			<ShopScreen
				{...base}
				configs={[CONFIGS.eslint]}
				offers={[
					createMockShopOffer(CONFIGS.eslint, {
						owned: true,
						installable: false,
					}),
					createMockShopOffer(CONFIGS.agentsMd),
				]}
			/>
		);
		const offers = within(
			screen.getByRole("group", { name: /Install configs/ })
		);
		expect(offers.getByText("owned")).toBeInTheDocument();
		expect(offers.getByRole("button", { name: "ESLint" })).toBeDisabled();
		expect(
			screen.queryByRole("button", { name: /^Install ESLint/ })
		).not.toBeInTheDocument();
	});

	// Hover only hints — the buttons stay behind the click that selects the chip,
	// so a pointer sweeping the shelf never crosses live spend controls.
	it("hints on hover and keeps the install button behind the click", () => {
		render(<ShopScreen {...base} />);
		expect(screen.getAllByText("Click to install").length).toBeGreaterThan(0);
		expect(
			screen.queryByRole("button", { name: /^Install ESLint/ })
		).not.toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "ESLint" }));
		expect(
			screen.getByRole("button", { name: /^Install ESLint/ })
		).toBeInTheDocument();
	});

	it("closes the action tooltip when the selected chip is clicked again", () => {
		render(<ShopScreen {...base} />);
		const chip = screen.getByRole("button", { name: "ESLint" });
		fireEvent.click(chip);
		expect(
			screen.getByRole("button", { name: /^Install ESLint/ })
		).toBeInTheDocument();
		fireEvent.click(chip);
		expect(
			screen.queryByRole("button", { name: /^Install ESLint/ })
		).not.toBeInTheDocument();
	});

	it("prices each offer chip in storage", () => {
		render(<ShopScreen {...base} />);
		expect(screen.getAllByText(`${draftCost(CONFIGS.eslint)}KB`).length).toBe(
			1
		);
	});

	// The badge refuses via aria-disabled, not the disabled attribute: a disabled
	// button fires no pointer events, so it could neither be tapped for its own
	// explanation nor hovered for one.
	it("refuses to install into a full pipeline and explains on the badge", () => {
		render(
			<ShopScreen
				{...base}
				configs={[CONFIGS.js, CONFIGS.css, CONFIGS.rb]}
				slots={3}
				offers={[
					createMockShopOffer(CONFIGS.eslint, {
						installable: false,
						refusal: { reason: "no-slot" },
					}),
					createMockShopOffer(CONFIGS.agentsMd, {
						installable: false,
						refusal: { reason: "no-slot" },
					}),
				]}
			/>
		);
		fireEvent.click(screen.getByRole("button", { name: "ESLint" }));
		const install = screen.getByRole("button", { name: /^Install ESLint/ });
		expect(install).toHaveAttribute("aria-disabled", "true");
		expect(refusalOn(install)).toHaveTextContent(
			"No free slot — uninstall a config first"
		);
	});

	// The refusal used to share the chip's unnamed hover group, so it opened over
	// the shop the instant the chip was hovered, next to an offer it had not
	// refused. It reveals on its own badge or not at all.
	it("reveals the refusal on its own badge, not with the chip's tooltip", () => {
		render(
			<ShopScreen
				{...base}
				configs={[CONFIGS.js, CONFIGS.css, CONFIGS.rb]}
				slots={3}
				offers={[
					createMockShopOffer(CONFIGS.eslint, {
						installable: false,
						refusal: { reason: "no-slot" },
					}),
					createMockShopOffer(CONFIGS.agentsMd, {
						installable: false,
						refusal: { reason: "no-slot" },
					}),
				]}
			/>
		);
		fireEvent.click(screen.getByRole("button", { name: "ESLint" }));
		const install = screen.getByRole("button", { name: /^Install ESLint/ });
		expect(refusalOn(install)).toHaveClass("group-hover/nested:block");
		expect(refusalOn(install)).not.toHaveClass("group-hover:block");
	});

	it("does not install when the refusing badge is pressed", () => {
		const onDraft = vi.fn();
		render(
			<ShopScreen
				{...base}
				storage={8}
				offers={[
					createMockShopOffer(CONFIGS.eslint, {
						installable: false,
						refusal: {
							reason: "too-expensive",
							priceKb: draftCost(CONFIGS.eslint),
							storageKb: 8,
						},
					}),
					createMockShopOffer(CONFIGS.agentsMd),
				]}
				onDraft={onDraft}
			/>
		);
		fireEvent.click(screen.getByRole("button", { name: "ESLint" }));
		fireEvent.click(screen.getByRole("button", { name: /^Install ESLint/ }));
		expect(onDraft).not.toHaveBeenCalled();
	});

	// An offer you cannot afford stays readable — a chip that refuses the tap can't
	// be inspected either.
	it("keeps an unaffordable offer selectable and prices the refusal", () => {
		render(
			<ShopScreen
				{...base}
				storage={8}
				offers={[
					createMockShopOffer(CONFIGS.eslint, {
						installable: false,
						refusal: {
							reason: "too-expensive",
							priceKb: draftCost(CONFIGS.eslint),
							storageKb: 8,
						},
					}),
					createMockShopOffer(CONFIGS.agentsMd),
				]}
			/>
		);
		const chip = screen.getByRole("button", { name: "ESLint" });
		expect(chip).toBeEnabled();
		fireEvent.click(chip);
		const install = screen.getByRole("button", { name: /^Install ESLint/ });
		expect(install).toHaveAttribute("aria-disabled", "true");
		expect(refusalOn(install)).toHaveTextContent(
			`Costs ${draftCost(CONFIGS.eslint)}KB — you have 8KB`
		);
	});

	it("shows description and install button on click, with refusal on disabled click", () => {
		render(
			<ShopScreen
				{...base}
				storage={8}
				offers={[
					createMockShopOffer(CONFIGS.eslint, {
						installable: false,
						refusal: {
							reason: "too-expensive",
							priceKb: draftCost(CONFIGS.eslint),
							storageKb: 8,
						},
					}),
					createMockShopOffer(CONFIGS.agentsMd),
				]}
			/>
		);
		const chip = screen.getByRole("button", { name: "ESLint" });
		fireEvent.click(chip);
		// Selecting shows description and install button in tooltip
		expect(screen.queryAllByText(/Cross out a wrong answer/)).not.toHaveLength(
			0
		);
		// Install button appears (disabled due to storage)
		const installBtn = screen.getByRole("button", { name: /Install ESLint/ });
		expect(installBtn).toHaveAttribute("aria-disabled", "true");
		// Clicking the disabled button reveals the refusal message
		fireEvent.click(installBtn);
		expect(screen.getByText(/Costs 32KB/)).toBeInTheDocument();
	});

	it("rebuilds the offers for a fee", () => {
		const onRebuild = vi.fn();
		render(<ShopScreen {...base} onRebuild={onRebuild} />);
		fireEvent.click(screen.getByRole("button", { name: /Rebuild offers/ }));
		expect(onRebuild).toHaveBeenCalled();
	});

	it("locks the selected offer when its Lock config button is pressed", () => {
		const onLock = vi.fn();
		render(<ShopScreen {...base} onLock={onLock} />);
		fireEvent.click(screen.getByRole("button", { name: "ESLint" }));
		fireEvent.click(
			screen.getByRole("button", { name: `Lock ESLint for ${base.lockCost}KB` })
		);
		expect(onLock).toHaveBeenCalledWith("eslint");
	});

	// The price still shows on a lock the run cannot afford — a control the player
	// never sees is a control they never learn.
	it("prices the lock's refusal when the lock is unaffordable", () => {
		render(<ShopScreen {...base} canLock={false} />);
		fireEvent.click(screen.getByRole("button", { name: "ESLint" }));
		const lock = screen.getByRole("button", {
			name: `Lock ESLint for ${base.lockCost}KB`,
		});
		expect(lock).toHaveAttribute("aria-disabled", "true");
		expect(refusalOn(lock)).toHaveTextContent(
			`Holding costs ${base.lockCost}KB`
		);
	});

	it("marks the held offer and stops offering more locks once one is spent", () => {
		render(
			<ShopScreen
				{...base}
				offers={[
					createMockShopOffer(CONFIGS.eslint, { locked: true }),
					createMockShopOffer(CONFIGS.agentsMd),
				]}
				lockAvailable={false}
			/>
		);
		expect(screen.getByText("Locked")).toBeInTheDocument();
		// Selecting the other offer must not turn up a second lock to buy.
		fireEvent.click(screen.getByRole("button", { name: "AGENTS.md" }));
		expect(
			screen.getByRole("button", { name: /^Install AGENTS/ })
		).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /^Lock / })
		).not.toBeInTheDocument();
	});

	it("offers no lock at all before the lock's gate", () => {
		render(<ShopScreen {...base} lockAvailable={false} />);
		fireEvent.click(screen.getByRole("button", { name: "ESLint" }));
		expect(
			screen.getByRole("button", { name: /^Install ESLint/ })
		).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /^Lock / })
		).not.toBeInTheDocument();
	});

	it("extends the offers for a fee", () => {
		const onExtend = vi.fn();
		render(<ShopScreen {...base} onExtend={onExtend} />);
		fireEvent.click(screen.getByRole("button", { name: /Extend offers/ }));
		expect(onExtend).toHaveBeenCalled();
	});

	it("hides the extend control before its gate", () => {
		render(<ShopScreen {...base} extendAvailable={false} />);
		expect(
			screen.queryByRole("button", { name: /Extend offers/ })
		).not.toBeInTheDocument();
	});

	it("previews an installable offer inside the pipeline, with its effect and price", () => {
		render(<ShopScreen {...base} />);
		const chip = screen.getByRole("button", { name: "ESLint" });
		fireEvent.mouseEnter(chip.parentElement as HTMLElement);

		// Description appears on hover, carried by the pipeline's ghost row
		expect(screen.queryAllByText(/Cross out a wrong answer/)).not.toHaveLength(
			0
		);
		// Preview row appears in the pipeline
		expect(
			screen.getByRole("button", { name: "Add ESLint to your pipeline" })
		).toBeInTheDocument();
		expect(
			screen.getAllByText(`${draftCost(CONFIGS.eslint)}KB`).length
		).toBeGreaterThan(0);
	});

	it("shows description on click but no preview when pipeline is full", () => {
		render(
			<ShopScreen
				{...base}
				configs={[CONFIGS.js, CONFIGS.css, CONFIGS.rb]}
				slots={3}
				offers={[
					createMockShopOffer(CONFIGS.eslint, {
						installable: false,
						refusal: { reason: "no-slot" },
					}),
					createMockShopOffer(CONFIGS.agentsMd, {
						installable: false,
						refusal: { reason: "no-slot" },
					}),
				]}
			/>
		);
		const chip = screen.getByRole("button", { name: "ESLint" });
		fireEvent.click(chip);
		// Description appears in the pinned tooltip; a full pipeline draws no ghost row
		expect(screen.queryByText(/Cross out a wrong answer/)).toBeInTheDocument();
		// But preview row doesn't appear when pipeline is full
		expect(
			screen.queryByRole("button", { name: /^Add .+ to your pipeline$/ })
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
				stake={stakeWith({
					modifiers: { ...stake.modifiers, gateReward: 240 },
				})}
			/>
		);
		const receipt = within(screen.getByTestId("gate-stake-receipt"));
		expect(receipt.getByText("+240KB")).toBeInTheDocument();
		expect(
			receipt.getByText("×2 +0.5% coverage this gate")
		).toBeInTheDocument();
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

	// The gate ahead only admits a build over its width demand (ADR-027), so
	// the shop refuses to sell below it — a run only dies at a gate it failed
	// (ADR-021).
	it("locks every deinstall once the build sits at the gate's width demand", () => {
		const onSell = vi.fn();
		render(
			<ShopScreen
				{...base}
				configs={[CONFIGS.indexedDb, CONFIGS.rb]}
				stake={stakeWith({ minConfigs: 2 })}
				atMinimumWidth
				onSell={onSell}
			/>
		);
		const deinstalls = screen.getAllByRole("button", { name: /Uninstall/ });
		for (const button of deinstalls) {
			expect(button).toBeDisabled();
			fireEvent.click(button);
		}
		expect(onSell).not.toHaveBeenCalled();
		expect(
			screen.getAllByText(
				/Gate 2 demands 2 configs — uninstalling would sink the build below it/i
			)
		).toHaveLength(deinstalls.length);
	});

	// The early gates demand less than one config, so ADR-021's last-config
	// rule stays the hard bottom with its own plain wording.
	it("locks the deinstall button on the only installed config", () => {
		const onSell = vi.fn();
		render(
			<ShopScreen
				{...base}
				configs={[CONFIGS.indexedDb]}
				atMinimumWidth
				onSell={onSell}
			/>
		);
		const deinstall = screen.getByRole("button", { name: /Uninstall/ });
		expect(deinstall).toBeDisabled();
		expect(
			screen.getByText(/uninstalling it would leave nothing to clear a gate/i)
		).toBeInTheDocument();
		fireEvent.click(deinstall);
		expect(onSell).not.toHaveBeenCalled();
	});

	it("mentions the coming gate's width demand in the build summary", () => {
		render(
			<ShopScreen
				{...base}
				configs={[CONFIGS.indexedDb, CONFIGS.rb]}
				stake={stakeWith({ minConfigs: 2 })}
			/>
		);
		const receipt = within(screen.getByTestId("gate-stake-receipt"));
		expect(receipt.getByText(/2\+ configs/)).toBeInTheDocument();
	});

	it("names the shortfall in the build summary when the build is under the gate's demand", () => {
		render(
			<ShopScreen
				{...base}
				configs={[CONFIGS.indexedDb]}
				stake={stakeWith({ minConfigs: 4 })}
			/>
		);
		const receipt = within(screen.getByTestId("gate-stake-receipt"));
		expect(
			receipt.getByText(
				"Demands 4 configs — the build holds 1. Install 3 more to climb on."
			)
		).toHaveClass("text-cinnabar");
	});

	it("names the gate that opens the next slot — no unlock button anywhere", () => {
		render(<ShopScreen {...base} />);
		// Badges belong to gates now, so this row prices width and nothing else —
		// scoped to the row, since the stake receipt does name the gate's swatch.
		const slotRow = screen.getByText(/Opens when/);
		expect(slotRow).toHaveTextContent("Gate 1");
		expect(slotRow).not.toHaveTextContent(/Swatch/);
		// Gates grant slots on the clear (ADR-034) — there is no purchase step.
		expect(
			screen.queryByRole("button", { name: "Unlock slot" })
		).not.toBeInTheDocument();
	});

	it("acknowledges a slot granted since the last visit, alongside the gate holding the next one", () => {
		render(<ShopScreen {...base} justUnlockedSlots={[4]} nextSlotGate={2} />);
		expect(screen.getByText("Unlocked 4th slot")).toBeInTheDocument();
		// The acknowledgment names slot 4 — it must not also relabel it as the
		// still-held next slot. The preview resumes one slot further on.
		expect(screen.getByText("Gate 2")).toBeInTheDocument();
	});

	it("retires the unlock row at the slot cap", () => {
		render(<ShopScreen {...base} slots={MAX_SLOTS} nextSlotGate={null} />);
		expect(screen.queryByText(/Opens when/)).not.toBeInTheDocument();
	});

	it("lists the storage-plan ladder with the current rung marked", () => {
		render(<ShopScreen {...base} />);
		expect(screen.getByText("Free")).toBeInTheDocument();
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
		expect(screen.getByText("8KB / gate")).toBeInTheDocument();
		expect(screen.getByText("16KB / gate")).toBeInTheDocument();
	});

	it("writes the deep rungs in MB", () => {
		render(<ShopScreen {...base} />);
		expect(screen.getByText("1MB")).toBeInTheDocument();
		expect(screen.getByText("1.5MB")).toBeInTheDocument();
		expect(screen.getByText("3MB")).toBeInTheDocument();
	});

	// The rung ahead is shown so the ladder reads as going somewhere, but it is a
	// row, not a button — and it says what opens it.
	it("shows the next rung as unbuyable, naming the gate that opens it", () => {
		const staged = plansOn(1).map((plan) => ({
			...plan,
			locked: plan.tier === 3,
		}));
		render(<ShopScreen {...base} storagePlans={staged} />);
		expect(screen.getByText("Opens after gate 2")).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /768KB storage plan/ })
		).not.toBeInTheDocument();
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

describe("the shop door's wording (DVTD-52f2)", () => {
	it("points at the coming gate while the build meets the demand", () => {
		const action = shopExitAction({ state: "open", gate: 4 });
		expect(action.label).toBe("Continue to gate 4 →");
		expect(action.disabled).toBe(false);
		expect(action.hint).toBeUndefined();
	});

	it("keeps the same label but disables it and says what is missing", () => {
		const action = shopExitAction({
			state: "blocked",
			gate: 4,
			demand: 4,
			shortfall: 3,
		});
		expect(action.label).toBe("Continue to gate 4 →");
		expect(action.disabled).toBe(true);
		expect(action.hint).toBe(
			"Gate 4 demands 4 configs — install 3 more before you can climb on."
		);
	});

	it("renames the door and turns it dangerous once the build is stuck", () => {
		const action = shopExitAction({ state: "stuck", gate: 4, demand: 4 });
		expect(action.label).toBe("End run — gate 4 demands 4 configs →");
		expect(action.variant).toBe("danger");
		expect(action.disabled).toBe(false);
	});
});
