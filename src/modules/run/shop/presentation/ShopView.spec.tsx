import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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
	nextSlotGate: 6,
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
		render_({ view: createMockRunView({ ...view, lockAvailable: false }) });

		expect(
			screen.queryByRole("button", { name: /^Lock / })
		).not.toBeInTheDocument();
	});

	it("holds an offer over, and releases the one already held", async () => {
		const onLock = vi.fn();
		render_({
			view: createMockRunView({
				...view,
				lockAvailable: true,
				canLock: true,
				lockCost: 16,
				lockedOfferIds: [CONFIGS.unitTests.id],
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
				lockAvailable: true,
				lockedOfferIds: [CONFIGS.unitTests.id],
			}),
		});

		expect(
			screen.getByText("Unit Tests is locked and stays")
		).toBeInTheDocument();
	});

	// WTFPL lays out the whole catalog, so there is nothing left to reroll.
	it("hides the rebuild rather than disabling it when a reroll would sell nothing", () => {
		render_({ view: createMockRunView({ ...view, rebuildAvailable: false }) });

		expect(
			screen.queryByRole("button", { name: /rebuild/ })
		).not.toBeInTheDocument();
	});

	it("rerolls the shelf at the price the run has reached", async () => {
		const onRebuild = vi.fn();
		render_({
			view: createMockRunView({
				...view,
				rebuildAvailable: true,
				canRebuild: true,
				rebuildCost: 8,
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
			screen.getByRole("button", { name: "Uninstall ESLint +16 KB" })
		);

		expect(onSell).toHaveBeenCalledWith(CONFIGS.eslint.id);
	});

	it("marks the shop shut when read-only has closed it", () => {
		render_({ view: createMockRunView({ ...view, shopLocked: true }) });

		expect(
			screen.getByText("Read-only: this shop is shut for the coming gate.")
		).toBeInTheDocument();
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

	// ADR-027: an under-width build is turned away at the door, and told why.
	it("blocks the exit of a build that cannot start the gate", () => {
		render_({
			view: createMockRunView({ ...view, canStart: false, slots: 4 }),
		});

		expect(
			screen.getByRole("button", { name: "Fill 3 slots to continue" })
		).toBeDisabled();
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
});
