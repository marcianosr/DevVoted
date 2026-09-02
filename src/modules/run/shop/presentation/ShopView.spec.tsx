import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

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

const closed = createMockRunView({
	...view,
	shopControls: { ...view.shopControls, shopLocked: true },
});

describe("ShopView", () => {
	it("names the shop for the gate it sells into", () => {
		render_();

		expect(screen.getByText("Rainbow shop")).toBeInTheDocument();
		expect(screen.getByText("before gate 5")).toBeInTheDocument();
	});

	it("counts the shelf and the build separately", () => {
		render_();

		expect(screen.getByText("2 offers")).toBeInTheDocument();
		expect(screen.getByText("3 of 4 slots")).toBeInTheDocument();
	});

	it("buys an offer at its own price", async () => {
		const onDraft = vi.fn();
		render_({ onDraft });

		await userEvent.click(
			screen.getByRole("button", { name: /^Install Stylelint/ })
		);

		expect(onDraft).toHaveBeenCalledWith(CONFIGS.stylelint.id);
	});

	it("says why an offer cannot be installed instead of hiding it", () => {
		render_({
			view: createMockRunView({
				...view,
				offers: [
					createMockShopOffer(CONFIGS.stylelint, {
						refusal: { reason: "no-room", slots: 2, freeSlots: 1 },
					}),
				],
			}),
		});

		expect(screen.getByText("Stylelint")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /^Install Stylelint/ })
		).toBeDisabled();
	});

	it("leaves the shop for the gate", async () => {
		const onContinue = vi.fn();
		render_({ onContinue });

		await userEvent.click(screen.getByRole("button", { name: /^To Rainbow/ }));

		expect(onContinue).toHaveBeenCalledOnce();
	});

	// ADR-035 deleted the width demand at the shop door; only overflow shuts it.
	it("lets a build with nothing left to spend leave for the gate anyway", () => {
		render_({
			view: createMockRunView({ ...view, storage: 0, canStart: false }),
		});

		expect(screen.getByRole("button", { name: /^To Rainbow/ })).toBeEnabled();
	});

	it("shuts the exit while the build is over capacity, counting the overflow", () => {
		render_({ view: createMockRunView({ ...view, overflowSlots: 2 }) });

		expect(
			screen.getByRole("button", { name: "Over capacity by 2 slots" })
		).toBeDisabled();
	});
});

describe("ShopView build rows", () => {
	it("arms an uninstall before it happens, quoting the refund", async () => {
		const onSell = vi.fn();
		render_({ onSell });

		await userEvent.click(
			screen.getByRole("button", { name: /^Uninstall \.js/ })
		);
		expect(onSell).not.toHaveBeenCalled();

		await userEvent.click(
			screen.getByRole("button", { name: /^Confirm uninstall of \.js/ })
		);
		expect(onSell).toHaveBeenCalledWith(CONFIGS.js.id);
	});

	it("backs out of an armed uninstall without selling", async () => {
		const onSell = vi.fn();
		render_({ onSell });

		await userEvent.click(
			screen.getByRole("button", { name: /^Uninstall \.js/ })
		);
		await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

		expect(onSell).not.toHaveBeenCalled();
		expect(
			screen.queryByRole("button", { name: /^Confirm uninstall of \.js/ })
		).not.toBeInTheDocument();
	});

	it("refuses every uninstall on a build at its width floor", () => {
		render_({ view: createMockRunView({ ...view, atMinimumWidth: true }) });

		expect(
			screen.getByRole("button", { name: /^Uninstall \.js/ })
		).toBeDisabled();
	});

	it("states a bumped config's version", () => {
		render_();

		expect(screen.getAllByText("v1").length).toBeGreaterThan(0);
	});

	it("arms an upgrade before it fires", async () => {
		const onUpgrade = vi.fn();
		render_({
			view: createMockRunView({
				...view,
				storage: 4096,
				coverageByCategory: { js: 100, ts: 100 },
			}),
			onUpgrade,
		});

		await userEvent.click(
			screen.getByRole("button", { name: /^Upgrade \.js/ })
		);
		await userEvent.click(
			screen.getByRole("button", { name: /^Confirm upgrade of \.js/ })
		);

		expect(onUpgrade).toHaveBeenCalledWith(CONFIGS.js.id);
	});

	it("refuses the upgrade press while a gate is unmet", () => {
		render_({
			view: createMockRunView({ ...view, storage: 0 }),
		});

		expect(
			screen.getByRole("button", { name: /^Upgrade \.js/ })
		).toBeDisabled();
	});
});

describe("ShopView offers", () => {
	const lockable = createMockRunView({
		...view,
		shopControls: {
			...view.shopControls,
			lockAvailable: true,
			canLock: true,
			lockCost: 8,
		},
	});

	it("offers no lock while the run has not unlocked it", () => {
		render_();

		expect(
			screen.queryByRole("button", { name: /Keep Stylelint/ })
		).not.toBeInTheDocument();
	});

	it("holds an offer over for the next shop", async () => {
		const onLock = vi.fn();
		render_({ view: lockable, onLock });

		await userEvent.click(
			screen.getByRole("button", { name: /^Keep Stylelint/ })
		);

		expect(onLock).toHaveBeenCalledWith(CONFIGS.stylelint.id);
	});

	it("marks a kept offer as pressed, and counts it beside the shelf", () => {
		render_({
			view: createMockRunView({
				...lockable,
				shopControls: {
					...lockable.shopControls,
					lockedOfferIds: [CONFIGS.stylelint.id],
				},
			}),
		});

		expect(
			screen.getByRole("button", { name: /^Keep Stylelint/ })
		).toHaveAttribute("aria-pressed", "true");
		expect(screen.getByText("2 offers · 1 kept")).toBeInTheDocument();
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
					rebuildCost: 4,
				},
			}),
			onRebuild,
		});

		await userEvent.click(
			screen.getByRole("button", { name: /Rebuild offers/ })
		);

		expect(onRebuild).toHaveBeenCalledOnce();
	});

	it("refuses the reroll when a rebuild would sell nothing", () => {
		render_({
			view: createMockRunView({
				...view,
				shopControls: { ...view.shopControls, rebuildAvailable: false },
			}),
		});

		expect(
			screen.getByRole("button", { name: /Rebuild offers/ })
		).toBeDisabled();
	});
});

describe("ShopView storage plan", () => {
	it("offers the storage plans as a picker, saying which cap is held", () => {
		render_();

		expect(screen.getByText(/^The /)).toBeInTheDocument();
		expect(screen.getAllByText(/KB a gate|free/).length).toBeGreaterThan(0);
	});

	it("switches plan from its own row", async () => {
		const onSetStoragePlan = vi.fn();
		render_({ onSetStoragePlan });

		const [plan] = screen.getAllByRole("button", { name: /^Switch to the / });
		if (plan === undefined) throw new Error("No plan row rendered");
		await userEvent.click(plan);

		expect(onSetStoragePlan).toHaveBeenCalled();
	});
});

describe("ShopView when read-only has closed it", () => {
	it("leads with the shop being closed, naming the audit and the gate", () => {
		render_({ view: closed });

		expect(
			screen.getByText(/Shop closed\. 405 Method Not Allowed/)
		).toBeInTheDocument();
		expect(screen.getByText(/before gate 5\.$/)).toBeInTheDocument();
	});

	it("says nothing about a closure at an open shop", () => {
		render_();

		expect(screen.queryByText(/Shop closed/)).not.toBeInTheDocument();
	});

	// ADR-038: the closure is stated once, not repeated on seven controls, but
	// every write still has to actually refuse.
	it("refuses every write while it is shut", () => {
		render_({ view: closed });

		expect(
			screen.getByRole("button", { name: /^Install Stylelint/ })
		).toBeDisabled();
		expect(
			screen.getByRole("button", { name: /^Uninstall \.js/ })
		).toBeDisabled();
		expect(
			screen.getByRole("button", { name: /Rebuild offers/ })
		).toBeDisabled();
	});

	it("still lets the run walk to the gate", () => {
		render_({ view: closed });

		expect(screen.getByRole("button", { name: /^To Rainbow/ })).toBeEnabled();
	});
});

describe("ShopView slots", () => {
	it("sells the next slot beside the build", async () => {
		const onBuySlot = vi.fn();
		render_({
			view: createMockRunView({
				...view,
				slotDeals: { ...view.slotDeals, buy: { costKb: 32, makes: 5 } },
			}),
			onBuySlot,
		});

		await userEvent.click(screen.getByRole("button", { name: /Buy slot 5/ }));

		expect(onBuySlot).toHaveBeenCalledOnce();
	});

	it("cashes a slot back once the run holds more than the free four", async () => {
		const onCashSlot = vi.fn();
		render_({
			view: createMockRunView({
				...view,
				slotDeals: { ...view.slotDeals, cash: { costKb: 32, makes: 3 } },
			}),
			onCashSlot,
		});

		await userEvent.click(screen.getByRole("button", { name: /Cash slot 4/ }));

		expect(onCashSlot).toHaveBeenCalledOnce();
	});

	it("refuses a slot the balance cannot cover, saying so", () => {
		render_({
			view: createMockRunView({
				...view,
				slotDeals: {
					...view.slotDeals,
					buy: { costKb: 512, refusal: "Costs 512 KB, you have 216." },
				},
			}),
		});

		expect(screen.getByRole("button", { name: /Buy slot 5/ })).toBeDisabled();
		expect(screen.getByText("Costs 512 KB, you have 216.")).toBeInTheDocument();
	});
});

describe("ShopView git tag", () => {
	const taggable = createMockRunView({
		...view,
		shopControls: {
			...view.shopControls,
			pinAvailable: true,
			canPin: true,
			pinCost: 64,
		},
	});

	it("sells the tag, naming the gate the next run would start at", async () => {
		const onPlantPin = vi.fn();
		render_({ view: taggable, onPlantPin });

		expect(
			screen.getByText(/checks out at gate 5 instead of gate 0/)
		).toBeInTheDocument();
		await userEvent.click(
			screen.getByRole("button", { name: /Buy a git tag/ })
		);

		expect(onPlantPin).toHaveBeenCalledOnce();
	});

	it("offers no tag while the run has not unlocked it", () => {
		render_();

		expect(
			screen.queryByRole("button", { name: /git tag/ })
		).not.toBeInTheDocument();
	});
});

describe("ShopView extend", () => {
	it("sells one more offer for every shop after this one", async () => {
		const onExtend = vi.fn();
		render_({
			view: createMockRunView({
				...view,
				shopControls: {
					...view.shopControls,
					extendAvailable: true,
					canExtend: true,
					extendCost: 48,
				},
			}),
			onExtend,
		});

		const extend = screen.getByText(
			"one more offer, here and every shop after"
		).parentElement;
		if (!extend) throw new Error("No extend row rendered");

		await userEvent.click(within(extend).getByRole("button"));

		expect(onExtend).toHaveBeenCalledOnce();
	});
});
