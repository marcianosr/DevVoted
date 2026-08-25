import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { levelUp, rarityOf } from "~/modules/run/config/domain/config.model";
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
	nextSlotUnlock: { slot: 7, gate: 6 },
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
	onChangePlan: () => {},
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

	// PriceTag opens a closed row on the first click and buys on the second, so
	// a price can never be paid without having been read.
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

	// The refusal is the reason, so it goes where the row's explanation goes
	// rather than vanishing with the button.
	it("says why an offer cannot be installed instead of hiding it", () => {
		render_({
			view: createMockRunView({
				...view,
				offers: [
					{
						...createMockShopOffer(CONFIGS.stylelint),
						installable: false,
						refusal: { reason: "no-slot" },
					},
				],
			}),
		});

		expect(
			screen.getByText("No free slot — uninstall a config first")
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

	// WTFPL lays out the whole catalog, so there is nothing left to reroll.
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

		// The refund rides in the accessible name because it is the whole decision:
		// the chip beside the row states it too, but the press is where it is spent.
		await userEvent.click(
			screen.getByRole("button", {
				name: /^Uninstall ESLint, Refunds \d+ KB$/,
			})
		);

		expect(onSell).toHaveBeenCalledWith(CONFIGS.eslint.id);
	});

	// A note tucked under the storage meter read as a footnote about the meter.
	// The shut shop is the screen's whole state, so it leads with what is shut
	// before it names the audit that shut it.
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

	// The button was gated on `config.maxLevel !== undefined`, which is optional
	// and defaults to 5 — so every Focus config in a real build silently lost its
	// Upgrade. `isUpgradable` is the domain's own answer to the same question.
	it("offers an upgrade on a config that can be bumped, and none on one that cannot", () => {
		render_();

		expect(
			screen.getByRole("button", { name: /Upgrade \.js/ })
		).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /Upgrade ESLint/ })
		).not.toBeInTheDocument();
	});

	// Storage and category coverage refuse independently, and the fix differs, so
	// the hint names whichever one is actually in the way.
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

	// A bump is a version, the way a dependency bump reads, so nothing on this
	// surface says "level" (DVTD-tt4y). Nothing asserted the copy before, which
	// is how the RPG word survived here after the vocabulary moved on.
	it("states a bumped config's version, and previews the one it would buy", () => {
		render_({
			view: createMockRunView({
				...view,
				configs: [levelUp(CONFIGS.js), CONFIGS.ts, CONFIGS.eslint],
			}),
		});

		expect(screen.getByText("v2")).toBeInTheDocument();
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

	// Sell something, or clear a slot: two different fixes, so two different
	// colours. One red shelf said "you are broke" for both.
	it("greys an offer with nowhere to go and reddens one it cannot pay for", () => {
		render_({
			view: createMockRunView({
				...view,
				offers: [
					createMockShopOffer(CONFIGS.stylelint, {
						installable: false,
						refusal: { reason: "no-slot" },
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

	// tier 5 is sold from gate 6, and the shop that first sells it is the one
	// after gate 5 — naming gate 6 put the rung a whole gate out of reach.
	it("dates the sealed rung by the clear that opens it, not by its own gate", () => {
		render_();

		expect(screen.getByText("Storage plan")).toBeInTheDocument();
		expect(screen.getByText("opens when gate 5 clears")).toBeInTheDocument();
	});

	it("switches plan from its rung", async () => {
		const onChangePlan = vi.fn();
		render_({ onChangePlan });

		await userEvent.click(screen.getByRole("radio", { name: /640 KB/ }));

		expect(onChangePlan).toHaveBeenCalledWith(2);
	});

	it("leaves the shop for the gate", async () => {
		const onContinue = vi.fn();
		render_({ onContinue });

		await userEvent.click(screen.getByRole("button", { name: "Continue →" }));

		expect(onContinue).toHaveBeenCalledOnce();
	});

	// ADR-035 deleted the width demand and the graded exit: a peeled build walks
	// to the gate and dies there if the next peel outruns it. Blocking the door
	// soft-locked a run that had been stripped to one config and could not afford
	// a replacement — there was no other way out of the shop.
	it("lets a stripped, insolvent build leave for the gate anyway", async () => {
		const onContinue = vi.fn();
		render_({
			onContinue,
			view: createMockRunView({
				...view,
				configs: [CONFIGS.js],
				canStart: false,
				storage: 0,
			}),
		});

		const exit = screen.getByRole("button", { name: "Continue →" });

		expect(exit).toBeEnabled();
		await userEvent.click(exit);
		expect(onContinue).toHaveBeenCalledOnce();
	});
});

describe("ShopView readability", () => {
	// The PriceTag dims itself. Dimming the row put the config's own name below
	// readable, which is the one thing the shelf exists to show.
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

		// Scoped to the offer's own row: the ladder's sealed `???` rung is dimmed
		// on purpose, and an unscoped query catches it instead.
		const row = screen.getByText("Stylelint").closest("summary, div");
		if (!row) throw new Error("No offer row rendered");

		expect(row).not.toHaveClass("opacity-50");
		expect(
			screen.getByRole("button", {
				name: "Stylelint 32 KB, Can't install, not enough data",
			})
		).toHaveClass("disabled:opacity-50");
	});

	// The row's explainer says the same thing, but only once the row is open. A
	// greyed price with no reason beside it reads as a bug.
	it("names the refusal on the tag itself, without opening the row", () => {
		render_({
			view: createMockRunView({
				...view,
				offers: [
					{
						...createMockShopOffer(CONFIGS.stylelint),
						installable: false,
						refusal: { reason: "no-slot" },
					},
				],
			}),
		});

		expect(screen.getByText("Can't install, no free slot")).toBeInTheDocument();
	});

	// The dot is scannable down a column; the word is what a new player can read.
	it("names the rarity beside its dot, in the rarity's own colour", () => {
		render_();

		// Offers and the pipeline column both mark rarity, and all of them alike.
		const words = screen.getAllByText(rarityOf(CONFIGS.stylelint));
		expect(words.length).toBeGreaterThan(0);
		for (const word of words)
			expect(word).toHaveClass("font-bold", "text-celadon");
	});
});
