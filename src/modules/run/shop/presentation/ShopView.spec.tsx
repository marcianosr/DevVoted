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
	spots: 4,
	spotsUsed: 3,
	spotsFree: 1,
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
	onRentExtraSpots: () => {},
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
		expect(screen.getByText("3 of 4 spots")).toBeInTheDocument();
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
						refusal: { reason: "no-room", spots: 1, freeSpots: 0 },
					},
				],
			}),
		});

		expect(
			screen.getByText("Needs 1 spots — 0 free. Minify or uninstall something")
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
						refusal: { reason: "no-room", spots: 1, freeSpots: 0 },
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

	it("dates a step this depth does not sell yet", () => {
		render_();

		expect(screen.getByText("Extra spots")).toBeInTheDocument();
		expect(screen.getByText("opens at gate 2")).toBeInTheDocument();
	});

	it("offers the ladder as a picker, `none` included", () => {
		render_();

		expect(screen.getAllByRole("radio").length).toBeGreaterThanOrEqual(2);
		expect(screen.getByText("none")).toBeInTheDocument();
		expect(screen.getByText("+1 spot")).toBeInTheDocument();
	});

	it("rents a step from its own radio", async () => {
		const onRentExtraSpots = vi.fn();
		render_({ onRentExtraSpots });

		await userEvent.click(
			screen.getByRole("radio", { name: /\+1 spot makes 5 8 KB a gate/ })
		);

		expect(onRentExtraSpots).toHaveBeenCalledWith(1);
	});

	it("sells the steps by radio alone, with nothing to press", () => {
		render_();

		expect(
			screen.queryByRole("button", { name: /buy/ })
		).not.toBeInTheDocument();
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
			view: createMockRunView({ ...view, spots: 4, overflowSpots: 4 }),
		});

		expect(
			screen.getByRole("button", {
				name: "Continue →, Over capacity by 4 spots. Minify, uninstall, or rent more room.",
			})
		).toBeDisabled();
	});

	it("counts the overflow in the reason rather than rounding it to 'too wide'", () => {
		render_({
			view: createMockRunView({ ...view, spots: 4, overflowSpots: 1 }),
		});

		expect(
			screen.getByRole("button", { name: /Over capacity by 1 spot\./ })
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
						refusal: { reason: "no-room", spots: 1, freeSpots: 0 },
					},
				],
			}),
		});

		expect(screen.getByText("Needs 1 spots, 0 free")).toBeInTheDocument();
	});

	it("grades every config row with its glyph, the grade named for a reader", () => {
		render_();

		const spoken = screen
			.getAllByText(rarityOf(CONFIGS.stylelint))
			.filter((grade) => grade.className.includes("sr-only"));
		expect(spoken.length).toBeGreaterThan(0);
		expect(spoken[0]?.parentElement?.querySelector("svg rect")).not.toBeNull();
	});
});

describe("ShopView room", () => {
	it("draws the pipeline as room, with the build's shape beside its capacity", () => {
		render_();

		expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "3");
		expect(screen.getByText("3 of 4 spots")).toBeInTheDocument();
		expect(screen.getByText("1 spot free · a bit fits")).toBeInTheDocument();
	});

	it("leaves the grade to the glyph rather than spelling it out beside the price", () => {
		render_();

		const spelled = screen
			.queryAllByText("bit")
			.filter((node) => !node.className.includes("sr-only"));

		expect(spelled).toEqual([]);
	});

	it("hangs a refused offer's shortfall off its price, not across the row", () => {
		render_({
			view: createMockRunView({
				...view,
				spotsFree: 0,
				offers: [
					createMockShopOffer(CONFIGS.agentsMd, {
						installable: false,
						refusal: { reason: "no-room", spots: 8, freeSpots: 0 },
					}),
				],
			}),
		});

		expect(screen.queryByText("needs a byte")).not.toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /Needs 8 spots, 0 free/ })
		).toBeDisabled();
	});

	it("keeps the install press on an offer with no room", () => {
		render_({
			view: createMockRunView({
				...view,
				spotsFree: 0,
				offers: [
					createMockShopOffer(CONFIGS.agentsMd, {
						installable: false,
						refusal: { reason: "no-room", spots: 8, freeSpots: 0 },
					}),
				],
			}),
		});

		expect(
			screen.getByRole("button", { name: /AGENTS\.md/ })
		).toBeInTheDocument();
	});

	it("states the width each step makes, and what it costs a gate", () => {
		render_();

		expect(screen.getByText("makes 5")).toBeInTheDocument();
		expect(screen.getByText("8 KB a gate")).toBeInTheDocument();
		expect(screen.getByText("free")).toBeInTheDocument();
		expect(screen.queryByText(/KB cap/)).not.toBeInTheDocument();
	});

	it("says what the rent already costs in the section's own header", () => {
		render_();

		expect(screen.getByText("renting nothing")).toBeInTheDocument();
	});
});
