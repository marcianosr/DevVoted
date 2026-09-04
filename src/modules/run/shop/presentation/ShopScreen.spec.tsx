import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";

import {
	draftCost,
	upgradeStorageCost,
} from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import type { GateStake } from "~/modules/run/run/application/gateStake.viewmodel";
import type { ShopControls } from "~/modules/run/run/application/shopControls.viewmodel";
import {
	BASE_SLOTS,
	MAX_SLOTS,
	SLOT_PRICES_KB,
	STORAGE_PLANS,
} from "~/modules/run/run/domain/rules.model";
import {
	ShopScreen,
	shopExitAction,
} from "~/modules/run/shop/presentation/ShopScreen.ui";
import {
	createMockGateStake,
	createMockShopControls,
	createMockShopOffer,
} from "~/test/runView.factory";

const slotDealsAt = (slots = BASE_SLOTS, { storage = 500 } = {}) => {
	const bought = slots - BASE_SLOTS;
	const price = SLOT_PRICES_KB[bought];
	return {
		slots,
		maxSlots: MAX_SLOTS,
		buy: {
			...(price === undefined ? {} : { costKb: price }),
			...(price !== undefined && storage >= price
				? { makes: slots + 1 }
				: { refusal: `Costs ${price} KB, you have ${storage}.` }),
		},
		cash:
			bought > 0
				? { costKb: SLOT_PRICES_KB[bought - 1], makes: slots - 1 }
				: { refusal: "Nothing to cash — the first four slots are free." },
	};
};

const storagePlanAt = (tier = 0, storage = 500) => ({
	capKb: STORAGE_PLANS[tier].capKb,
	perGateKb: STORAGE_PLANS[tier].perGateKb,
	options: STORAGE_PLANS.map((plan) => ({
		tier: plan.tier,
		capKb: plan.capKb,
		perGateKb: plan.perGateKb,
		held: plan.tier === tier,
		burnsKb: Math.max(0, storage - plan.capKb),
		affordable: plan.tier <= tier || plan.perGateKb <= storage,
	})),
});

const refusalOn = (badge: HTMLElement): HTMLElement => {
	const scope = badge.closest('[class~="group/nested"]');
	if (!(scope instanceof HTMLElement))
		throw new Error(`${badge.textContent} is not inside a nested tooltip`);
	return within(scope).getByRole("tooltip");
};

const stake = createMockGateStake({
	gateNumber: 2,
	modifiers: {
		gateReward: 180,
		rewardMultiplier: 1.5,
		coverageMultiplier: 2,
		coverageAdd: 0.5,
	},
	perAnswer: {
		coveragePerCorrect: 3,
		coveragePerWrong: -0.3,
		storageKbPerCorrect: 0,
		streakStepMultiplier: 1.1,
		streakCapMultiplier: 2,
	},
});

const stakeWith = (overrides: Partial<GateStake>): GateStake => ({
	...stake,
	...overrides,
});

const controls = (overrides: Partial<ShopControls> = {}) =>
	createMockShopControls({
		rebuildCost: 1,
		canRebuild: true,
		lockAvailable: true,
		lockCost: 16,
		canLock: true,
		extendAvailable: true,
		extendCost: 48,
		canExtend: true,
		pinCost: 512,
		...overrides,
	});

const base = {
	storage: 440,
	coverageByCategory: {},
	stake,
	configs: [],
	atMinimumWidth: false,
	newConfigIds: [],
	offers: [CONFIGS.eslint, CONFIGS.agentsMd].map((c) => createMockShopOffer(c)),
	onDraft: vi.fn(),
	controls: controls(),
	onRebuild: vi.fn(),
	onLock: vi.fn(),
	onUnlock: vi.fn(),
	onExtend: vi.fn(),
	onPlantPin: vi.fn(),
	slots: 4,
	slotsUsed: 0,
	slotsFree: 4,
	onUpgrade: vi.fn(),
	onSell: vi.fn(),
	slotDeals: slotDealsAt(),
	storagePlan: storagePlanAt(),
	onBuySlot: vi.fn(),
	onCashSlot: vi.fn(),
	onSetStoragePlan: vi.fn(),
};

describe(ShopScreen, () => {
	it("renders the upgrade heading and draft options", () => {
		render(<ShopScreen {...base} />);
		expect(
			screen.getByRole("heading", { name: /Upgrade your build/ })
		).toBeInTheDocument();
		expect(screen.getByText("ESLint")).toBeInTheDocument();
	});

	it("names the gate ahead by its badge, not by its number alone", () => {
		render(<ShopScreen {...base} />);
		expect(
			screen.getByRole("heading", {
				name: "Your build for Cascade gate 2",
			})
		).toBeInTheDocument();
	});

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

	it("shows install button in tooltip when config is selected", () => {
		render(<ShopScreen {...base} />);
		const offers = () =>
			within(screen.getByRole("group", { name: /Install configs/ }));
		expect(
			offers().getByText(`${draftCost(CONFIGS.eslint)}KB`)
		).toBeInTheDocument();
		fireEvent.click(offers().getByRole("button", { name: "ESLint" }));
		expect(
			screen.getByRole("button", { name: /Install ESLint/ })
		).toBeInTheDocument();
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

	it("refuses to install into a full build and explains on the badge", () => {
		render(
			<ShopScreen
				{...base}
				configs={[CONFIGS.js, CONFIGS.css, CONFIGS.rb]}
				slotsFree={0}
				offers={[
					createMockShopOffer(CONFIGS.eslint, {
						installable: false,
						refusal: { reason: "no-room", slots: 1, freeSlots: 0 },
					}),
					createMockShopOffer(CONFIGS.agentsMd, {
						installable: false,
						refusal: { reason: "no-room", slots: 1, freeSlots: 0 },
					}),
				]}
			/>
		);
		fireEvent.click(screen.getByRole("button", { name: "ESLint" }));
		const install = screen.getByRole("button", { name: /^Install ESLint/ });
		expect(install).toHaveAttribute("aria-disabled", "true");
		expect(refusalOn(install)).toHaveTextContent(
			"Needs 1 slots — 0 free. Minify or uninstall something"
		);
	});

	it("reveals the refusal on its own badge, not with the chip's tooltip", () => {
		render(
			<ShopScreen
				{...base}
				configs={[CONFIGS.js, CONFIGS.css, CONFIGS.rb]}
				slotsFree={0}
				offers={[
					createMockShopOffer(CONFIGS.eslint, {
						installable: false,
						refusal: { reason: "no-room", slots: 1, freeSlots: 0 },
					}),
					createMockShopOffer(CONFIGS.agentsMd, {
						installable: false,
						refusal: { reason: "no-room", slots: 1, freeSlots: 0 },
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
		expect(screen.queryAllByText(/Cross out a wrong answer/)).not.toHaveLength(
			0
		);
		const installBtn = screen.getByRole("button", { name: /Install ESLint/ });
		expect(installBtn).toHaveAttribute("aria-disabled", "true");
		fireEvent.click(installBtn);
		expect(screen.getByText(/Costs 32KB/)).toBeInTheDocument();
	});

	it("rebuilds the offers for a fee", () => {
		const onRebuild = vi.fn();
		render(<ShopScreen {...base} onRebuild={onRebuild} />);
		fireEvent.click(screen.getByRole("button", { name: /Rebuild offers/ }));
		expect(onRebuild).toHaveBeenCalled();
	});

	it("hides the rebuild control when the run's shop is not selling rerolls", () => {
		render(
			<ShopScreen {...base} controls={controls({ rebuildAvailable: false })} />
		);
		expect(
			screen.queryByRole("button", { name: /Rebuild offers/ })
		).not.toBeInTheDocument();
	});

	it("locks the selected offer when its Lock config button is pressed", () => {
		const onLock = vi.fn();
		render(<ShopScreen {...base} onLock={onLock} />);
		fireEvent.click(screen.getByRole("button", { name: "ESLint" }));
		fireEvent.click(
			screen.getByRole("button", {
				name: `Lock ESLint for ${base.controls.lockCost}KB`,
			})
		);
		expect(onLock).toHaveBeenCalledWith("eslint");
	});

	it("prices the lock's refusal when the lock is unaffordable", () => {
		render(<ShopScreen {...base} controls={controls({ canLock: false })} />);
		fireEvent.click(screen.getByRole("button", { name: "ESLint" }));
		const lock = screen.getByRole("button", {
			name: `Lock ESLint for ${base.controls.lockCost}KB`,
		});
		expect(lock).toHaveAttribute("aria-disabled", "true");
		expect(refusalOn(lock)).toHaveTextContent(
			`Holding costs ${base.controls.lockCost}KB`
		);
	});

	it("marks the held offer and releases it from its own button", () => {
		const onUnlock = vi.fn();
		render(
			<ShopScreen
				{...base}
				offers={[
					createMockShopOffer(CONFIGS.eslint, { locked: true }),
					createMockShopOffer(CONFIGS.agentsMd),
				]}
				onUnlock={onUnlock}
			/>
		);
		expect(screen.getByText("Locked")).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "ESLint" }));
		fireEvent.click(screen.getByRole("button", { name: "Release ESLint" }));
		expect(onUnlock).toHaveBeenCalledWith("eslint");
	});

	it("still offers a lock on the other offers while one is held", () => {
		render(
			<ShopScreen
				{...base}
				offers={[
					createMockShopOffer(CONFIGS.eslint, { locked: true }),
					createMockShopOffer(CONFIGS.agentsMd),
				]}
			/>
		);
		fireEvent.click(screen.getByRole("button", { name: "AGENTS.md" }));
		expect(
			screen.getByRole("button", {
				name: `Lock AGENTS.md for ${base.controls.lockCost}KB`,
			})
		).toBeInTheDocument();
	});

	it("offers no lock while yarn.lock is not in the build", () => {
		render(
			<ShopScreen {...base} controls={controls({ lockAvailable: false })} />
		);
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
		render(
			<ShopScreen {...base} controls={controls({ extendAvailable: false })} />
		);
		expect(
			screen.queryByRole("button", { name: /Extend offers/ })
		).not.toBeInTheDocument();
	});

	it("previews an installable offer inside the build, with its effect and price", () => {
		render(<ShopScreen {...base} />);
		const chip = screen.getByRole("button", { name: "ESLint" });
		fireEvent.mouseEnter(chip.parentElement as HTMLElement);

		expect(screen.queryAllByText(/Cross out a wrong answer/)).not.toHaveLength(
			0
		);
		expect(
			screen.getByRole("button", { name: "Add ESLint to your build" })
		).toBeInTheDocument();
		expect(
			screen.getAllByText(`${draftCost(CONFIGS.eslint)}KB`).length
		).toBeGreaterThan(0);
	});

	it("shows description on click but no preview when build is full", () => {
		render(
			<ShopScreen
				{...base}
				configs={[CONFIGS.js, CONFIGS.css, CONFIGS.rb]}
				slotsFree={0}
				offers={[
					createMockShopOffer(CONFIGS.eslint, {
						installable: false,
						refusal: { reason: "no-room", slots: 1, freeSlots: 0 },
					}),
					createMockShopOffer(CONFIGS.agentsMd, {
						installable: false,
						refusal: { reason: "no-room", slots: 1, freeSlots: 0 },
					}),
				]}
			/>
		);
		const chip = screen.getByRole("button", { name: "ESLint" });
		fireEvent.click(chip);
		expect(screen.queryByText(/Cross out a wrong answer/)).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /^Add .+ to your build$/ })
		).not.toBeInTheDocument();
	});

	it("prices Unit Tests' upgrade in storage, unlike free focus upgrades", () => {
		render(<ShopScreen {...base} configs={[CONFIGS.unitTests]} />);
		const upgrade = screen.getByRole("button", { name: /Upgrade/ });
		expect(upgrade).toBeEnabled();
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
		expect(screen.getByRole("button", { name: /Upgrade/ })).toBeEnabled();
		expect(
			screen.getByText("L2: JavaScript polls earn 1.5× coverage.")
		).toBeInTheDocument();
		expect(screen.queryByText(/Unlocks at 5%/)).not.toBeInTheDocument();
	});

	it("unlocks a met upgrade — prismatic ring, price on the button", () => {
		const onUpgrade = vi.fn();
		render(
			<ShopScreen
				{...base}
				configs={[CONFIGS.js]}
				coverageByCategory={{ js: 10 }}
				onUpgrade={onUpgrade}
			/>
		);
		const upgrade = screen.getByRole("button", { name: /Upgrade/ });
		expect(upgrade).toBeEnabled();
		expect(upgrade).toHaveClass("legendary-ring");
		expect(upgrade).toHaveTextContent(`${upgradeStorageCost(1)}KB`);
		fireEvent.click(upgrade);
		expect(onUpgrade).toHaveBeenCalledWith("js");
	});

	it("refuses an earned Focus upgrade the balance cannot cover", () => {
		render(
			<ShopScreen
				{...base}
				storage={0}
				configs={[CONFIGS.js]}
				coverageByCategory={{ js: 10 }}
			/>
		);
		expect(screen.getByRole("button", { name: /Upgrade/ })).toBeDisabled();
		const tooltips = screen
			.getAllByRole("tooltip")
			.map((element) => element.textContent ?? "");
		expect(tooltips).toContainEqual(
			expect.stringContaining(
				`Costs ${upgradeStorageCost(1)}KB — you have 0KB.`
			)
		);
		expect(tooltips.join(" ")).not.toContain("Unlocks at 5%");
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
	});

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

	it("carries no width demand in the build summary — only the meter judges (ADR-035)", () => {
		render(<ShopScreen {...base} configs={[CONFIGS.indexedDb, CONFIGS.rb]} />);
		const receipt = within(screen.getByTestId("gate-stake-receipt"));
		expect(receipt.queryByText(/configs/)).not.toBeInTheDocument();
	});

	it("promises no widening beside the build", () => {
		render(<ShopScreen {...base} />);
		expect(screen.queryByText(/Widens to/)).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: "Unlock slot" })
		).not.toBeInTheDocument();
	});

	it("prices the next slot and quotes the cash-out as income", () => {
		render(<ShopScreen {...base} />);

		expect(screen.getByText("Slots")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /buy a slot · 16KB/ })
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /nothing to cash/ })
		).toBeInTheDocument();
	});

	it("buys a slot when its press is clicked", () => {
		const onBuySlot = vi.fn();
		render(<ShopScreen {...base} onBuySlot={onBuySlot} />);

		fireEvent.click(screen.getByRole("button", { name: /buy a slot/ }));
		expect(onBuySlot).toHaveBeenCalledOnce();
	});

	it("cashes a slot back once one has been bought", () => {
		const onCashSlot = vi.fn();
		render(
			<ShopScreen
				{...base}
				slotDeals={slotDealsAt(BASE_SLOTS + 2)}
				onCashSlot={onCashSlot}
			/>
		);

		fireEvent.click(screen.getByRole("button", { name: /cash a slot/ }));
		expect(onCashSlot).toHaveBeenCalledOnce();
	});

	it("refuses the buy when the balance cannot cover the price", () => {
		render(
			<ShopScreen
				{...base}
				slotDeals={slotDealsAt(BASE_SLOTS, { storage: 0 })}
			/>
		);

		expect(screen.getByRole("button", { name: /buy a slot/ })).toBeDisabled();
	});

	it("lists every storage plan, the free cap included", () => {
		render(<ShopScreen {...base} />);
		const ladder = screen
			.getByText("Storage plan")
			.parentElement?.querySelector("ul");
		if (!ladder) throw new Error("No storage-plan ladder rendered");

		expect(within(ladder).getByText("512 KB")).toBeInTheDocument();
		expect(within(ladder).getByText("10 MB")).toBeInTheDocument();
	});

	it("prices the free cap at nothing and every plan by the gate", () => {
		render(<ShopScreen {...base} />);
		expect(screen.getByText("free")).toBeInTheDocument();
		expect(screen.getByText("32KB a gate")).toBeInTheDocument();
		expect(screen.getByText("768KB a gate")).toBeInTheDocument();
	});

	it("switches plan when its press is clicked", () => {
		const onSetStoragePlan = vi.fn();
		render(<ShopScreen {...base} onSetStoragePlan={onSetStoragePlan} />);

		fireEvent.click(screen.getAllByRole("button", { name: "switch" })[0]);
		expect(onSetStoragePlan).toHaveBeenCalledWith(1);
	});
});

describe("the shop door", () => {
	it("always opens toward the coming gate — nothing grades the build (ADR-035)", () => {
		const action = shopExitAction(4, 0);
		expect(action.label).toBe("Continue to gate 4 →");
		expect(action.disabled).toBe(false);
		expect(action.hint).toBeUndefined();
	});

	it("holds shut while the build sits over capacity, and says which ways out exist", () => {
		const action = shopExitAction(4, 2);
		expect(action.label).toBe("Continue to gate 4 →");
		expect(action.disabled).toBe(true);
		expect(action.hint).toBe(
			"Over capacity by 2 slots. Minify, uninstall, or buy a slot."
		);
	});

	it("counts a single slot of overflow in the singular", () => {
		expect(shopExitAction(4, 1).hint).toBe(
			"Over capacity by 1 slot. Minify, uninstall, or buy a slot."
		);
	});
});

describe("a shop shut by Read-only", () => {
	const locked = {
		...base,
		controls: controls({ shopLocked: true }),
		configs: [CONFIGS.js, CONFIGS.eslint],
	};

	it("states the rule and names the gate that closed it", () => {
		render(<ShopScreen {...locked} />);
		expect(
			screen.getByText(/Read-only: gate \d+ audits the build/)
		).toBeInTheDocument();
	});

	it("refuses the install behind the offer's own press", () => {
		const onDraft = vi.fn();
		render(<ShopScreen {...locked} onDraft={onDraft} />);
		const offers = within(
			screen.getByRole("group", { name: /Install configs/ })
		);
		fireEvent.click(offers.getByRole("button", { name: "ESLint" }));
		const install = screen.getByRole("button", { name: /Install ESLint/ });
		expect(install).toHaveAttribute("aria-disabled", "true");
		fireEvent.click(install);
		expect(onDraft).not.toHaveBeenCalled();
	});

	it("refuses the shop's controls", () => {
		render(<ShopScreen {...locked} />);
		expect(
			screen.getByRole("button", { name: /Rebuild offers/ })
		).toBeDisabled();
		expect(
			screen.getByRole("button", { name: /Extend offers/ })
		).toBeDisabled();
	});

	it("refuses buying and cashing slots too", () => {
		render(<ShopScreen {...locked} />);

		expect(screen.getByRole("button", { name: /buy a slot/ })).toBeDisabled();
		screen
			.getAllByRole("button", { name: "switch" })
			.forEach((press) => expect(press).toBeDisabled());
	});

	it("leaves the offers legible — the next gate still has to be planned", () => {
		render(<ShopScreen {...locked} />);
		expect(screen.getAllByText("ESLint").length).toBeGreaterThan(0);
	});

	it("says nothing about Read-only at an open shop", () => {
		render(<ShopScreen {...base} />);
		expect(screen.queryByText(/Read-only/)).not.toBeInTheDocument();
	});
});

describe("ShopScreen room", () => {
	const cramped = {
		...base,
		configs: [CONFIGS.intellisense, CONFIGS.js, CONFIGS.ts],
		slots: 8,
		slotsUsed: 6,
		slotsFree: 2,
		offers: [
			createMockShopOffer(CONFIGS.agentsMd, {
				installable: false,
				refusal: { reason: "no-room" as const, slots: 8, freeSlots: 2 },
			}),
		],
	};

	it("badges an offer with no room by its size instead of its price", () => {
		render(<ShopScreen {...cramped} />);

		expect(screen.getByText("needs 8 slots")).toBeInTheDocument();
		expect(
			screen.queryByText(`${draftCost(CONFIGS.agentsMd)}KB`)
		).not.toBeInTheDocument();
	});

	it("keeps badging the price when price is what is short", () => {
		render(
			<ShopScreen
				{...base}
				offers={[
					createMockShopOffer(CONFIGS.agentsMd, {
						installable: false,
						refusal: {
							reason: "too-expensive" as const,
							priceKb: 256,
							storageKb: 8,
						},
					}),
				]}
			/>
		);

		expect(screen.getByText("256KB")).toBeInTheDocument();
		expect(screen.queryByText(/needs a/)).not.toBeInTheDocument();
	});

	it("keeps the shortfall on the offer that is refused, not beside the build", () => {
		render(<ShopScreen {...cramped} />);

		expect(screen.queryByText(/·\s*minify /)).not.toBeInTheDocument();
		expect(screen.queryByText(/move to a bigger plan/)).not.toBeInTheDocument();
	});
});
