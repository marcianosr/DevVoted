import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { levelUp, slotsOf } from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	createMockGateStake,
	createMockRunView,
	createMockShopOffer,
} from "~/test/runView.factory";

import { ShopView, type ShopViewProps } from "./ShopView.component";

const view = createMockRunView({
	gatesCleared: 4,
	configs: [CONFIGS.js, CONFIGS.ts, CONFIGS.eslint],
	slots: 4,
	slotsUsed: 3,
	slotsFree: 1,
	storage: 216,
	offers: [
		createMockShopOffer(CONFIGS.stylelint),
		createMockShopOffer(CONFIGS.unitTests),
	],
	canStart: true,
	gateStake: createMockGateStake({ gateNumber: 5 }),
});

const handlers = {
	onDraft: () => {},
	onSell: () => {},
	onUpgrade: () => {},
	onLock: () => {},
	onRebuild: () => {},
	onExtend: () => {},
	onPlantPin: () => {},
	onBuySlot: () => {},
	onCashSlot: () => {},
	onSetStoragePlan: () => {},
	onContinue: () => {},
};

const render_ = (overrides: Partial<ShopViewProps> = {}) =>
	render(<ShopView view={view} {...handlers} {...overrides} />);

describe("ShopView", () => {
	it("names the shop for the gate it sells into", () => {
		render_();

		expect(
			screen.getByRole("heading", { name: "Rainbow shop" })
		).toBeInTheDocument();
		expect(screen.getByText("gate 5")).toBeInTheDocument();
	});

	it("counts the shelf and the build separately", () => {
		render_();

		expect(screen.getByText("2 offers")).toBeInTheDocument();
		expect(screen.getByText("3 of 4 slots")).toBeInTheDocument();
	});

	it("buys an offer at its own price, once the row is open", async () => {
		const onDraft = vi.fn();
		render_({ onDraft });

		const buy = screen.getByRole("button", {
			name: "install Stylelint for 32 KB",
		});

		await userEvent.click(buy);
		expect(onDraft).not.toHaveBeenCalled();

		await userEvent.click(buy);
		expect(onDraft).toHaveBeenCalledWith(CONFIGS.stylelint.id);
	});

	it("says why an offer cannot be installed instead of hiding it", () => {
		render_({
			view: createMockRunView({
				...view,
				offers: [
					{
						...createMockShopOffer(CONFIGS.stylelint),
						installable: false,
						refusal: { reason: "no-room", slots: 1, freeSlots: 0 },
					},
				],
			}),
		});

		expect(
			screen.getByText("Needs 1 slots — 0 free. Minify or uninstall something")
		).toBeInTheDocument();
	});

	it("offers no lock while the run has not unlocked it", () => {
		render_({
			view: createMockRunView({
				...view,
				shopControls: { ...view.shopControls, lockAvailable: false },
			}),
		});

		expect(
			screen.queryByRole("button", { name: /^Lock / })
		).not.toBeInTheDocument();
	});

	it("leaves the row's front empty rather than ringing it", () => {
		render_({
			view: createMockRunView({
				...view,
				shopControls: { ...view.shopControls, lockAvailable: false },
			}),
		});

		const shelf = screen.getByText("New configs").closest("section");

		expect(shelf?.querySelectorAll(".rounded-full.border")).toHaveLength(0);
	});

	it("holds an offer over, and releases the one already held", async () => {
		const onLock = vi.fn();
		render_({
			view: createMockRunView({
				...view,
				shopControls: {
					...view.shopControls,
					lockAvailable: true,
					canLock: true,
					lockCost: 16,
					lockedOfferIds: [CONFIGS.unitTests.id],
				},
			}),
			onLock,
		});

		await userEvent.click(
			screen.getByRole("button", { name: "Lock Stylelint for 16 KB" })
		);
		expect(onLock).toHaveBeenCalledWith(CONFIGS.stylelint.id);

		await userEvent.click(
			screen.getByRole("button", { name: "Release Unit Tests" })
		);
		expect(onLock).toHaveBeenCalledWith(CONFIGS.unitTests.id);
	});

	it("says which offer the lock is keeping", () => {
		render_({
			view: createMockRunView({
				...view,
				shopControls: {
					...view.shopControls,
					lockAvailable: true,
					lockedOfferIds: [CONFIGS.unitTests.id],
				},
			}),
		});

		expect(
			screen.getByText("Unit Tests is locked and stays")
		).toBeInTheDocument();
	});

	it("hides the rebuild rather than disabling it when a reroll would sell nothing", () => {
		render_({
			view: createMockRunView({
				...view,
				shopControls: { ...view.shopControls, rebuildAvailable: false },
			}),
		});

		expect(
			screen.queryByRole("button", { name: /rebuild/ })
		).not.toBeInTheDocument();
	});

	it("rerolls the shelf at the price the run has reached", async () => {
		const onRebuild = vi.fn();
		render_({
			view: createMockRunView({
				...view,
				shopControls: {
					...view.shopControls,
					rebuildAvailable: true,
					canRebuild: true,
					rebuildCost: 8,
				},
			}),
			onRebuild,
		});

		await userEvent.click(screen.getByRole("button", { name: "rebuild 8 KB" }));

		expect(onRebuild).toHaveBeenCalledOnce();
	});

	it("refuses every uninstall on a build at its width floor", () => {
		render_({ view: createMockRunView({ ...view, atMinimumWidth: true }) });

		expect(
			screen.queryByRole("button", { name: /Uninstall/ })
		).not.toBeInTheDocument();
	});

	it("uninstalls a config from its own row, quoting the refund", async () => {
		const onSell = vi.fn();
		render_({ onSell });

		await userEvent.click(
			screen.getByRole("button", {
				name: /^Uninstall ESLint, Refunds \d+ KB$/,
			})
		);

		expect(onSell).toHaveBeenCalledWith(CONFIGS.eslint.id);
	});

	it("leads with the shop being closed when read-only has closed it", () => {
		render_({
			view: createMockRunView({
				...view,
				shopControls: { ...view.shopControls, shopLocked: true },
			}),
		});

		expect(screen.getByText(/^Shop closed\./)).toBeInTheDocument();
	});

	it("names the audit and the gate the closure lasts until", () => {
		render_({
			view: createMockRunView({
				...view,
				shopControls: { ...view.shopControls, shopLocked: true },
			}),
		});

		expect(
			screen.getByText(/Read-only audits the build you already have/)
		).toBeInTheDocument();
		expect(
			screen.getByText(/bought, sold or switched before gate 5\./)
		).toBeInTheDocument();
	});

	it("offers an upgrade on a config that can be bumped, and none on one that cannot", () => {
		render_();

		expect(
			screen.getByRole("button", { name: /Upgrade \.js/ })
		).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /Upgrade ESLint/ })
		).not.toBeInTheDocument();
	});

	it("names the category coverage an upgrade still owes", () => {
		render_();

		expect(
			screen.getByRole("button", { name: /Upgrade \.js/ })
		).toHaveAccessibleName(/Unlocks at 5% JavaScript coverage, you have 0%/);
	});

	it("names the storage shortfall when the balance is what refuses it", () => {
		render_({
			view: createMockRunView({
				...view,
				storage: 8,
				coverageByCategory: { js: 40 },
			}),
		});

		expect(
			screen.getByRole("button", { name: /Upgrade \.js/ })
		).toHaveAccessibleName(/Costs 64 KB, you have 8 KB/);
	});

	it("rings an upgrade that both gates allow, and fires it", async () => {
		const onUpgrade = vi.fn();
		render_({
			onUpgrade,
			view: createMockRunView({
				...view,
				storage: 216,
				coverageByCategory: { js: 40 },
			}),
		});

		const upgrade = screen.getByRole("button", { name: /Upgrade \.js/ });
		expect(upgrade).toHaveClass("legendary-ring");
		expect(upgrade).toBeEnabled();

		await userEvent.click(upgrade);

		expect(onUpgrade).toHaveBeenCalledWith(CONFIGS.js.id);
	});

	it("states a bumped config's version, and previews the one it would buy", () => {
		render_({
			view: createMockRunView({
				...view,
				configs: [levelUp(CONFIGS.js), CONFIGS.ts, CONFIGS.eslint],
			}),
		});

		expect(screen.getByText(/level 2/)).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /Upgrade \.js/ })
		).toHaveAccessibleName(/v3: JavaScript polls earn 1\.75× coverage/);
	});

	it("refuses the press, and drops the ring, while a gate is unmet", () => {
		render_();

		expect(screen.getByRole("button", { name: /Upgrade \.js/ })).toBeDisabled();
		expect(
			screen.getByRole("button", { name: /Upgrade \.js/ })
		).not.toHaveClass("legendary-ring");
	});

	it("greys an offer with nowhere to go and reddens one it cannot pay for", () => {
		render_({
			view: createMockRunView({
				...view,
				offers: [
					createMockShopOffer(CONFIGS.stylelint, {
						installable: false,
						refusal: { reason: "no-room", slots: 1, freeSlots: 0 },
					}),
					createMockShopOffer(CONFIGS.unitTests, {
						installable: false,
						refusal: {
							reason: "too-expensive",
							priceKb: 512,
							storageKb: 216,
						},
					}),
				],
			}),
		});

		expect(screen.getByRole("button", { name: /Stylelint/ })).toHaveClass(
			"text-zinc-500"
		);
		expect(screen.getByRole("button", { name: /Unit Tests/ })).toHaveClass(
			"text-cinnabar"
		);
	});

	it("says nothing about a closure at an open shop", () => {
		render_();

		expect(screen.queryByText(/Shop closed/)).not.toBeInTheDocument();
	});

	it("sells the next slot off the track's hatching, with no section of its own", () => {
		render_();

		expect(screen.queryByText("Slots")).not.toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /Install a new slot/ })
		).toBeInTheDocument();
	});

	it("arms the hatching on the first press and buys on the second", async () => {
		const onBuySlot = vi.fn();
		render_({ onBuySlot });

		const stub = () =>
			screen.getByRole("button", { name: /Install a new slot/ });

		await userEvent.click(stub());
		expect(onBuySlot).not.toHaveBeenCalled();
		expect(
			screen.getByText("Install a new slot · makes 5 · 16 KB · press again")
		).toBeInTheDocument();

		await userEvent.click(stub());
		expect(onBuySlot).toHaveBeenCalledOnce();
	});

	it("drops the arming once focus moves on, so a stray press cannot spend", async () => {
		const onBuySlot = vi.fn();
		render_({ onBuySlot });

		await userEvent.click(
			screen.getByRole("button", { name: /Install a new slot/ })
		);
		await userEvent.click(screen.getByRole("button", { name: /Continue/ }));

		expect(screen.getByText("1 slot free · fits up to 1")).toBeInTheDocument();
		expect(onBuySlot).not.toHaveBeenCalled();
	});

	it("cashes an empty slot from the track once the run holds more than the free four", async () => {
		const onCashSlot = vi.fn();
		render_({
			onCashSlot,
			view: createMockRunView({
				...view,
				slots: 6,
				slotsFree: 3,
				slotDeals: {
					...view.slotDeals,
					slots: 6,
					cash: { costKb: 32, makes: 5 },
				},
			}),
		});

		const cashOut = () =>
			screen.getByRole("button", {
				name: /Cash an empty slot · makes 5 · \+32 KB/,
			});

		await userEvent.click(cashOut());
		await userEvent.click(cashOut());

		expect(onCashSlot).toHaveBeenCalledOnce();
	});

	it("offers the storage plans as a picker, the free cap included", () => {
		render_();

		expect(screen.getByText("Storage plan")).toBeInTheDocument();
		expect(screen.getAllByRole("radio").length).toBeGreaterThanOrEqual(2);
		expect(screen.getByText("512 KB")).toBeInTheDocument();
		expect(screen.getByText("10 MB")).toBeInTheDocument();
	});

	it("switches plan from its own radio", async () => {
		const onSetStoragePlan = vi.fn();
		render_({ onSetStoragePlan });

		await userEvent.click(
			screen.getByRole("radio", { name: /768 KB 16 KB a gate/ })
		);

		expect(onSetStoragePlan).toHaveBeenCalledWith(1);
	});

	it("leaves the shop for the gate", async () => {
		const onContinue = vi.fn();
		render_({ onContinue });

		await userEvent.click(screen.getByRole("button", { name: "Continue →" }));

		expect(onContinue).toHaveBeenCalledOnce();
	});

	it("lets a build with nothing left to spend leave for the gate anyway", async () => {
		const onContinue = vi.fn();
		render_({
			onContinue,
			view: createMockRunView({ ...view, configs: [CONFIGS.js], storage: 0 }),
		});

		const exit = screen.getByRole("button", { name: "Continue →" });

		expect(exit).toBeEnabled();
		await userEvent.click(exit);
		expect(onContinue).toHaveBeenCalledOnce();
	});

	it("shuts the exit while the build is over capacity, and names the ways out", () => {
		render_({
			view: createMockRunView({ ...view, slots: 4, overflowSlots: 4 }),
		});

		expect(
			screen.getByRole("button", {
				name: "Continue →, Over capacity by 4 slots. Minify, uninstall, or rent more room.",
			})
		).toBeDisabled();
	});

	it("counts the overflow in the reason rather than rounding it to 'too wide'", () => {
		render_({
			view: createMockRunView({ ...view, slots: 4, overflowSlots: 1 }),
		});

		expect(
			screen.getByRole("button", { name: /Over capacity by 1 slot\./ })
		).toBeDisabled();
	});
});

describe("ShopView readability", () => {
	it("leaves an unaffordable offer's row at full contrast", () => {
		render_({
			view: createMockRunView({
				...view,
				offers: [
					{
						...createMockShopOffer(CONFIGS.stylelint),
						installable: false,
						refusal: { reason: "too-expensive", priceKb: 512, storageKb: 216 },
					},
				],
			}),
		});

		const row = screen.getByText("Stylelint").closest("summary, div");
		if (!row) throw new Error("No offer row rendered");

		expect(row).not.toHaveClass("opacity-50");
		expect(
			screen.getByRole("button", {
				name: "Stylelint 32 KB, Can't install, not enough data",
			})
		).toHaveClass("disabled:opacity-50");
	});

	it("names the refusal on the tag itself, without opening the row", () => {
		render_({
			view: createMockRunView({
				...view,
				offers: [
					{
						...createMockShopOffer(CONFIGS.stylelint),
						installable: false,
						refusal: { reason: "no-room", slots: 1, freeSlots: 0 },
					},
				],
			}),
		});

		expect(screen.getByText("Needs 1 slots, 0 free")).toBeInTheDocument();
	});

	it("states every config row's size, so a price reads without a legend", () => {
		render_();

		expect(
			screen.getAllByText(`${slotsOf(CONFIGS.stylelint)} slot`).length
		).toBeGreaterThan(0);
	});
});

describe("ShopView room", () => {
	it("draws the build as room, with the build's shape beside its capacity", () => {
		render_();

		expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "3");
		expect(screen.getByText("3 of 4 slots")).toBeInTheDocument();
		expect(screen.getByText("1 slot free · fits up to 1")).toBeInTheDocument();
	});

	it("names no grade anywhere, since a config's price is its size", () => {
		render_();

		for (const grade of ["bit", "crumb", "nibble", "byte"])
			expect(screen.queryByText(grade)).not.toBeInTheDocument();
	});

	it("hangs a refused offer's shortfall off its price, not across the row", () => {
		render_({
			view: createMockRunView({
				...view,
				slotsFree: 0,
				offers: [
					createMockShopOffer(CONFIGS.agentsMd, {
						installable: false,
						refusal: { reason: "no-room", slots: 8, freeSlots: 0 },
					}),
				],
			}),
		});

		expect(screen.queryByText("needs a byte")).not.toBeInTheDocument();
		expect(screen.queryByText("8 slots free")).not.toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /Needs 8 slots, 0 free/ })
		).toBeDisabled();
	});

	it("keeps the install press on an offer with no room", () => {
		render_({
			view: createMockRunView({
				...view,
				slotsFree: 0,
				offers: [
					createMockShopOffer(CONFIGS.agentsMd, {
						installable: false,
						refusal: { reason: "no-room", slots: 8, freeSlots: 0 },
					}),
				],
			}),
		});

		expect(
			screen.getByRole("button", { name: /AGENTS\.md/ })
		).toBeInTheDocument();
	});

	it("states the width the next slot makes, and what each plan bills a gate", () => {
		render_();

		expect(
			screen.getByRole("button", {
				name: /Install a new slot · makes 5 · 16 KB/,
			})
		).toBeInTheDocument();
		expect(screen.getByText("16 KB a gate")).toBeInTheDocument();
		expect(screen.getByText("free")).toBeInTheDocument();
	});

	it("says which cap the run is on in the plan section's own header", () => {
		render_();

		expect(screen.getByText("512 KB cap · free")).toBeInTheDocument();
	});
});
