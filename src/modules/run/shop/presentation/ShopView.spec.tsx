import { describe, expect, it, vi } from "vitest";
import { act, render, screen, within } from "@testing-library/react";

import { renderWithNavRun } from "~/test/navRun.harness";
import userEvent from "@testing-library/user-event";

import { COMMUNITY } from "~/shared/lib/copy";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	createMockGatePayout,
	createMockRunView,
	createMockShopControls,
	createMockShopOffer,
} from "~/test/runView.factory";

import { ShopView } from "./ShopView.component";

const noop = () => {};

const handlers = {
	onDraft: noop,
	onSell: noop,
	onUpgrade: noop,
	onRebuild: noop,
	onSkip: noop,
	onExtend: noop,
	onPlantPin: noop,
	onAbandon: noop,
	onVendorLock: noop,
	onContinue: noop,
};

const view = createMockRunView({
	configs: [CONFIGS.js],
	storage: 512,
	slots: 6,
	slotsUsed: 2,
	offers: [
		createMockShopOffer(CONFIGS.linter, { priceKb: 64, installable: true }),
		createMockShopOffer(CONFIGS.ts, { priceKb: 4096, installable: false }),
	],
	gatePayout: createMockGatePayout({ clearedGateNumber: 4 }),
	shopControls: createMockShopControls({
		rebuildAvailable: true,
		canRebuild: true,
		rebuildCost: 32,
	}),
});

describe("ShopView", () => {
	it("stands the build beside the registry", () => {
		renderWithNavRun(<ShopView view={view} {...handlers} />);

		expect(screen.getByRole("heading", { name: "Build" })).toBeInTheDocument();
		expect(screen.getAllByRole("heading", { name: "Registry" })).toHaveLength(
			2
		);
	});

	it("titles the page Registry, over what it is for", () => {
		renderWithNavRun(<ShopView view={view} {...handlers} />);

		expect(
			screen.getByRole("heading", { level: 1, name: "Registry" })
		).toBeInTheDocument();
		expect(
			screen.getByText("Improve your build this run!")
		).toBeInTheDocument();
	});

	it("shuts the registry after a skip and says so", () => {
		const skipped = {
			...view,
			shopControls: { ...view.shopControls, canSkip: false, shopSkipped: true },
		};
		renderWithNavRun(<ShopView view={skipped} {...handlers} />);

		expect(screen.getByText(/You skipped this shop/)).toBeVisible();
		expect(
			screen.getByRole("button", { name: /Install Linter/ }).closest("[inert]")
		).not.toBeNull();
		expect(screen.getByText("skipped")).toBeInTheDocument();
	});

	it("installs an offer the run can afford", async () => {
		const onDraft = vi.fn();
		renderWithNavRun(<ShopView view={view} {...handlers} onDraft={onDraft} />);

		await userEvent.click(
			screen.getByRole("button", { name: /Install Linter/ })
		);
		expect(onDraft).toHaveBeenCalledWith(CONFIGS.linter.id);
	});

	it("prices the install on the button rather than in a badge beside it", () => {
		renderWithNavRun(<ShopView view={view} {...handlers} />);

		const install = screen.getByRole("button", {
			name: "Install Linter \u00b7 64 KB",
		});

		expect(install).toHaveTextContent("Install");
		expect(install).toHaveTextContent("64 KB");
	});

	it("previews what an install would leave when the offer is pointed at", async () => {
		const user = userEvent.setup();
		renderWithNavRun(<ShopView view={view} {...handlers} />);

		await user.hover(
			screen.getByRole("button", { name: "Install Linter \u00b7 64 KB" })
		);

		expect(screen.getByText(/after install/)).toBeInTheDocument();
		expect(screen.getByText("448 KB")).toBeInTheDocument();
	});

	it("drops the preview once the pointer leaves the offer", async () => {
		const user = userEvent.setup();
		renderWithNavRun(<ShopView view={view} {...handlers} />);

		const press = screen.getByRole("button", {
			name: "Install Linter \u00b7 64 KB",
		});
		await user.hover(press);
		await user.unhover(press);

		expect(screen.queryByText(/after install/)).not.toBeInTheDocument();
	});

	it("previews for a keyboard too, which never hovers anything", async () => {
		renderWithNavRun(<ShopView view={view} {...handlers} />);

		act(() => {
			screen
				.getByRole("button", { name: "Install Linter \u00b7 64 KB" })
				.focus();
		});

		expect(screen.getByText("448 KB")).toBeInTheDocument();
	});

	it("previews nothing for an offer the balance cannot cover", async () => {
		const user = userEvent.setup();
		renderWithNavRun(<ShopView view={view} {...handlers} />);

		await user.hover(screen.getByRole("button", { name: /^Install \.ts/ }));

		expect(screen.queryByText(/after install/)).not.toBeInTheDocument();
	});

	it("previews what an uninstall would hand back, counting the balance up", async () => {
		const user = userEvent.setup();
		renderWithNavRun(<ShopView view={view} {...handlers} />);

		await user.click(screen.getByRole("button", { name: "Expand .js" }));
		await user.hover(screen.getByRole("button", { name: /^Uninstall \.js/ }));

		expect(screen.getByText(/after uninstall/)).toBeInTheDocument();
		expect(screen.getByText("528 KB")).toBeInTheDocument();
	});

	it("previews the upgrade rather than the uninstall on the same card", async () => {
		const user = userEvent.setup();
		renderWithNavRun(<ShopView view={view} {...handlers} />);

		await user.click(screen.getByRole("button", { name: "Expand .js" }));
		await user.hover(
			screen.getByRole("button", { name: /^Upgrade \.js to v2/ })
		);

		expect(screen.getByText(/after upgrade/)).toBeInTheDocument();
		expect(screen.queryByText(/after uninstall/)).not.toBeInTheDocument();
	});

	it("refuses the install of an offer the run cannot afford", () => {
		renderWithNavRun(<ShopView view={view} {...handlers} />);

		expect(
			screen.getByRole("button", { name: /^Install \.ts/ })
		).toBeDisabled();
	});

	it("rebuilds the registry from its control", async () => {
		const onRebuild = vi.fn();
		renderWithNavRun(
			<ShopView view={view} {...handlers} onRebuild={onRebuild} />
		);

		await userEvent.click(
			screen.getByRole("button", { name: /Rebuild the registry/ })
		);
		expect(onRebuild).toHaveBeenCalled();
	});

	it("skips the shop from its control beside Rebuild", async () => {
		const onSkip = vi.fn();
		renderWithNavRun(<ShopView view={view} {...handlers} onSkip={onSkip} />);

		await userEvent.click(
			screen.getByRole("button", { name: /Skip the shop/ })
		);
		expect(onSkip).toHaveBeenCalled();
	});

	it("shuts the skip once the registry was touched", () => {
		const touched = {
			...view,
			shopControls: { ...view.shopControls, canSkip: false },
		};
		renderWithNavRun(<ShopView view={touched} {...handlers} />);

		expect(screen.getByText("registry touched")).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /Skip the shop/ })
		).not.toBeInTheDocument();
	});

	it("leaves for prep from the footer", async () => {
		const onContinue = vi.fn();
		renderWithNavRun(
			<ShopView view={view} {...handlers} onContinue={onContinue} />
		);

		await userEvent.click(screen.getByRole("button", { name: /To prep/ }));
		expect(onContinue).toHaveBeenCalled();
	});

	it("offers the community board beside the exit to prep", async () => {
		const onCommunity = vi.fn();
		renderWithNavRun(
			<ShopView view={view} {...handlers} onCommunity={onCommunity} />
		);

		await userEvent.click(screen.getByRole("button", { name: COMMUNITY }));
		expect(onCommunity).toHaveBeenCalled();
	});

	it("withholds the community board when the shop was given no route to it", () => {
		renderWithNavRun(<ShopView view={view} {...handlers} />);

		expect(screen.queryByRole("button", { name: COMMUNITY })).toBeNull();
	});

	it("shuts the exit while the build outweighs the space its bill covered", () => {
		render(
			<ShopView
				view={createMockRunView({
					...view,
					overflowSlots: 2,
					buildSpace: { ...view.buildSpace, coveredSpace: 8 },
				})}
				{...handlers}
			/>
		);

		expect(screen.getByRole("button", { name: /To prep/ })).toBeDisabled();
		expect(
			screen.getByText(/2 weight over the 8 the bill covered/)
		).toBeInTheDocument();
	});

	it("sells no build space, because the rung follows the build", () => {
		renderWithNavRun(<ShopView view={createMockRunView(view)} {...handlers} />);

		expect(screen.queryByText("build space")).not.toBeInTheDocument();
		expect(screen.queryByRole("button", { name: /^8 weight/ })).toBeNull();
	});

	it("installs an offer that stays inside the rung on a single press", async () => {
		const onDraft = vi.fn();
		renderWithNavRun(<ShopView view={view} {...handlers} onDraft={onDraft} />);

		await userEvent.click(
			screen.getByRole("button", { name: /Install Linter/ })
		);

		expect(onDraft).toHaveBeenCalledWith("linter");
	});

	it("arms an install that crosses a rung, and commits it on the second press", async () => {
		const onDraft = vi.fn();
		const crossing = createMockRunView({
			...view,
			offers: [
				createMockShopOffer(CONFIGS.linter, {
					priceKb: 64,
					installable: true,
					scale: { from: 4, to: 6, perGateKb: 16 },
				}),
			],
		});
		renderWithNavRun(
			<ShopView view={crossing} {...handlers} onDraft={onDraft} />
		);

		await userEvent.click(
			screen.getByRole("button", { name: /Install Linter/ })
		);
		expect(onDraft).not.toHaveBeenCalled();
		expect(screen.getByText("Doesn't fit.")).toBeInTheDocument();

		const confirm = screen.getByRole("button", {
			name: /Confirm installing Linter/,
		});
		expect(confirm).toHaveTextContent("Install · 64 KB");
		expect(confirm.closest("[data-screen-theme]")).toHaveAttribute(
			"data-screen-theme",
			"saffron"
		);

		await userEvent.click(confirm);
		expect(onDraft).toHaveBeenCalledWith("linter");
	});

	const crossingView = () =>
		createMockRunView({
			...view,
			offers: [
				createMockShopOffer(CONFIGS.linter, {
					priceKb: 64,
					installable: true,
					scale: { from: 4, to: 6, perGateKb: 16 },
				}),
			],
		});

	it("says what the crossing costs every gate, not only what it costs once", async () => {
		renderWithNavRun(<ShopView view={crossingView()} {...handlers} />);

		await userEvent.click(
			screen.getByRole("button", { name: /Install Linter/ })
		);

		expect(
			screen.getByText("upkeep", { selector: "dt" }).nextElementSibling
		).toHaveTextContent("−16 KBevery gate");
	});

	it("draws the armed config into the build bar before it is paid for", async () => {
		renderWithNavRun(<ShopView view={crossingView()} {...handlers} />);

		await userEvent.click(
			screen.getByRole("button", { name: /Install Linter/ })
		);

		expect(
			screen.getByText(
				/^preview · Linter takes \d+ weight, the build grows to 6$/
			)
		).toBeInTheDocument();
	});

	it("stands down on cancel, back to one press and no preview", async () => {
		const onDraft = vi.fn();
		renderWithNavRun(
			<ShopView view={crossingView()} {...handlers} onDraft={onDraft} />
		);

		await userEvent.click(
			screen.getByRole("button", { name: /Install Linter/ })
		);
		await userEvent.click(screen.getByRole("button", { name: "cancel" }));

		expect(screen.queryByText("Doesn't fit.")).not.toBeInTheDocument();
		expect(screen.queryByText(/^preview ·/)).not.toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /Install Linter/ })
		).toBeInTheDocument();
		expect(onDraft).not.toHaveBeenCalled();
	});
});

describe("ShopView vendor lock-in", () => {
	const holding = createMockRunView({
		configs: [CONFIGS.vendorLockIn, CONFIGS.agentsMd],
		vendorLock: { offered: true },
	});

	it("offers the lock on every config except the vendor itself", () => {
		renderWithNavRun(<ShopView view={holding} {...handlers} />);

		expect(screen.getAllByRole("button", { name: "lock in" })).toHaveLength(1);
	});

	it("names the config the player pressed", async () => {
		const onVendorLock = vi.fn();
		render(
			<ShopView view={holding} {...handlers} onVendorLock={onVendorLock} />
		);

		await userEvent.click(screen.getByRole("button", { name: "lock in" }));

		expect(onVendorLock).toHaveBeenCalledWith("agents-md");
	});

	it("offers no lock at all before the vendor is installed", () => {
		render(
			<ShopView
				view={createMockRunView({ configs: [CONFIGS.agentsMd] })}
				{...handlers}
			/>
		);

		expect(screen.queryByRole("button", { name: "lock in" })).toBeNull();
	});

	it("marks the locked config and stops offering a second lock", () => {
		render(
			<ShopView
				view={createMockRunView({
					configs: [CONFIGS.vendorLockIn, CONFIGS.agentsMd],
					vendorLock: { offered: false, lockedConfigId: "agents-md" },
				})}
				{...handlers}
			/>
		);

		expect(screen.getByText("locked in")).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "lock in" })).toBeNull();
	});

	it("takes the uninstall press off the config it locked in", async () => {
		render(
			<ShopView
				view={createMockRunView({
					configs: [CONFIGS.vendorLockIn, CONFIGS.agentsMd],
					vendorLock: { offered: false, lockedConfigId: "agents-md" },
				})}
				{...handlers}
			/>
		);

		for (const name of ["AGENTS.md", "vendor lock-in"]) {
			await userEvent.click(
				screen.getByRole("button", { name: `Expand ${name}` })
			);
		}

		expect(
			screen.queryByRole("button", { name: /^Uninstall AGENTS\.md/ })
		).toBeNull();
		expect(
			screen.getByRole("button", { name: /^Uninstall vendor lock-in/ })
		).toBeInTheDocument();
	});

	it("shuts the exit while the vendor names nobody", () => {
		renderWithNavRun(<ShopView view={holding} {...handlers} />);

		expect(screen.getByRole("button", { name: /To prep/ })).toBeDisabled();
		expect(screen.getByText(/pick the config it exempts/)).toBeInTheDocument();
	});

	it("opens the exit once a vendor is named", () => {
		render(
			<ShopView
				view={createMockRunView({
					configs: [CONFIGS.vendorLockIn, CONFIGS.agentsMd],
					vendorLock: { offered: false, lockedConfigId: "agents-md" },
				})}
				{...handlers}
			/>
		);

		expect(screen.getByRole("button", { name: /To prep/ })).toBeEnabled();
	});

	it("states the over-capacity refusal first, as the harder block of the two", () => {
		render(
			<ShopView
				view={createMockRunView({
					configs: [CONFIGS.vendorLockIn, CONFIGS.agentsMd],
					vendorLock: { offered: true },
					overflowSlots: 2,
					buildSpace: { ...holding.buildSpace, coveredSpace: 8 },
				})}
				{...handlers}
			/>
		);

		expect(
			screen.getByText(/2 weight over the 8 the bill covered/)
		).toBeInTheDocument();
		expect(screen.queryByText(/pick the config it exempts/)).toBeNull();
	});
});

describe("ShopView — the two upgrade presses (ADR-097 decision 6)", () => {
	const upgradable = createMockRunView({
		configs: [CONFIGS.mooresLaw],
		storage: 512,
		slots: 6,
		slotsUsed: 2,
		offers: [
			createMockShopOffer(
				{ ...CONFIGS.telemetry, level: 2 },
				{ priceKb: 32, installable: true, heldLevel: 1 }
			),
		],
		gatePayout: createMockGatePayout({ clearedGateNumber: 4 }),
	});

	const armBuildUpgrade = async () => {
		await userEvent.click(
			screen.getByRole("button", { name: "Expand Moore's Law" })
		);
		await userEvent.click(
			screen.getByRole("button", { name: /Upgrade Moore's Law to v2/ })
		);
	};

	it("sells an installed config's next version through the upgrade action", async () => {
		const onUpgrade = vi.fn();
		renderWithNavRun(
			<ShopView view={upgradable} {...handlers} onUpgrade={onUpgrade} />
		);

		await armBuildUpgrade();
		await userEvent.click(
			screen.getByRole("button", { name: /^Confirm upgrading Moore's Law/ })
		);

		expect(onUpgrade).toHaveBeenCalledWith("moores-law");
	});

	it("arms the build upgrade in the card, stating what v2 changes before it is paid for", async () => {
		const onUpgrade = vi.fn();
		renderWithNavRun(
			<ShopView view={upgradable} {...handlers} onUpgrade={onUpgrade} />
		);

		await armBuildUpgrade();

		expect(onUpgrade).not.toHaveBeenCalled();
		expect(screen.getByText("Upgrade to v2.")).toBeInTheDocument();
		expect(
			screen.getByText("effect", { selector: "dt" }).nextElementSibling
		).toHaveTextContent("+2%→+4%");
	});

	it("stands the armed upgrade down once it is bought", async () => {
		renderWithNavRun(<ShopView view={upgradable} {...handlers} />);

		await armBuildUpgrade();
		await userEvent.click(
			screen.getByRole("button", { name: /^Confirm upgrading Moore's Law/ })
		);

		expect(screen.queryByText("Upgrade to v2.")).not.toBeInTheDocument();
	});

	it("sells the registry's rolled upgrade through the draft action after it is confirmed", async () => {
		const onDraft = vi.fn();
		renderWithNavRun(
			<ShopView view={upgradable} {...handlers} onDraft={onDraft} />
		);

		await userEvent.click(
			screen.getByRole("button", { name: /Upgrade Telemetry to v2/ })
		);
		expect(onDraft).not.toHaveBeenCalled();
		expect(
			screen.getByText("effect", { selector: "dt" }).nextElementSibling
		).toHaveTextContent("split only→with sample size");

		await userEvent.click(
			screen.getByRole("button", { name: /^Confirm upgrading Telemetry/ })
		);

		expect(onDraft).toHaveBeenCalledWith("telemetry");
	});

	it("stands the registry's upgrade down on cancel", async () => {
		renderWithNavRun(<ShopView view={upgradable} {...handlers} />);

		await userEvent.click(
			screen.getByRole("button", { name: /Upgrade Telemetry to v2/ })
		);
		await userEvent.click(screen.getByRole("button", { name: "cancel" }));

		expect(screen.queryByText("Upgrade to v2.")).not.toBeInTheDocument();
	});

	it("arms only the card pressed when the build and the registry hold the same config", async () => {
		renderWithNavRun(
			<ShopView
				view={createMockRunView({
					...upgradable,
					configs: [CONFIGS.telemetry],
				})}
				{...handlers}
			/>
		);

		await userEvent.click(
			screen.getByRole("button", { name: "Expand Telemetry" })
		);
		await userEvent.click(
			screen.getAllByRole("button", { name: /Upgrade Telemetry to v2/ })[0]
		);

		expect(screen.getAllByText("Upgrade to v2.")).toHaveLength(1);
	});

	it("disarms a pending install when an upgrade arms, so one card asks at a time", async () => {
		renderWithNavRun(
			<ShopView
				view={createMockRunView({
					...upgradable,
					offers: [
						createMockShopOffer(CONFIGS.linter, {
							priceKb: 64,
							installable: true,
							scale: { from: 4, to: 6, perGateKb: 16 },
						}),
					],
				})}
				{...handlers}
			/>
		);

		await userEvent.click(
			screen.getByRole("button", { name: /Install Linter/ })
		);
		expect(screen.getByText("Doesn't fit.")).toBeInTheDocument();

		await armBuildUpgrade();

		expect(screen.queryByText("Doesn't fit.")).not.toBeInTheDocument();
		expect(screen.getByText("Upgrade to v2.")).toBeInTheDocument();
	});

	it("leaves a card's disclosure alone when its upgrade arms", async () => {
		renderWithNavRun(<ShopView view={upgradable} {...handlers} />);

		const chevron = () =>
			screen.getByRole("button", { name: /(Expand|Collapse) Moore's Law/ });
		await userEvent.click(chevron());
		const before = chevron().getAttribute("aria-expanded");

		await userEvent.click(
			screen.getByRole("button", { name: /Upgrade Moore's Law to v2/ })
		);

		expect(chevron()).toHaveAttribute("aria-expanded", before);
		expect(
			screen.getByRole("button", { name: /^Confirm upgrading Moore's Law/ })
		).toBeInTheDocument();
	});
});

describe("ShopView services (ADR-116)", () => {
	const gateFour = createMockRunView({
		storage: 512,
		gatePayout: createMockGatePayout({ clearedGateNumber: 4 }),
		warmBoot: { storageKb: 0, serviceIds: ["extend", "pin"], archiveBytes: 0 },
		shopControls: createMockShopControls({
			rebuildAvailable: true,
			canRebuild: true,
			extendAvailable: true,
			canExtend: true,
			pinAvailable: true,
			canPin: true,
		}),
	});

	it("hides a service the account has not earned", () => {
		render(
			<ShopView view={{ ...gateFour, unlockedServiceIds: [] }} {...handlers} />
		);

		expect(screen.queryByText("Extend the registry")).not.toBeInTheDocument();
		expect(screen.queryByText("git tag")).not.toBeInTheDocument();
		expect(screen.queryByText(/locked service/)).not.toBeInTheDocument();
	});

	it("marks a service unlocked during this run as new", () => {
		render(
			<ShopView
				view={{
					...gateFour,
					unlockedServiceIds: ["extend"],
					unlockedServiceIdsThisRun: ["extend"],
				}}
				{...handlers}
			/>
		);

		expect(
			within(
				screen.getByRole("button", { name: /Extend the registry/ })
			).getByText("new")
		).toBeInTheDocument();
	});

	it("names an unlocked service the run did not carry in, says where it is carried, and takes no press (ADR-153)", () => {
		render(
			<ShopView
				view={{
					...gateFour,
					unlockedServiceIds: ["extend", "pin"],
					warmBoot: null,
				}}
				{...handlers}
			/>
		);

		expect(screen.getByText("Extend the registry")).toBeVisible();
		expect(screen.getByText("new run · 64 KB")).toBeVisible();
		expect(screen.getByText("git tag")).toBeVisible();
		expect(screen.getByText("new run · 128 KB")).toBeVisible();
		expect(
			screen.queryByRole("button", { name: /Extend the registry/ })
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /git tag/ })
		).not.toBeInTheDocument();
	});

	it("still sells the starter service to an account that has earned nothing", () => {
		render(
			<ShopView view={{ ...gateFour, unlockedServiceIds: [] }} {...handlers} />
		);

		expect(
			screen.getByRole("button", { name: /Rebuild the registry/ })
		).toBeEnabled();
	});

	it("sells an earned service like any other, and leaves the unearned ones out", () => {
		render(
			<ShopView
				view={{ ...gateFour, unlockedServiceIds: ["extend"] }}
				{...handlers}
			/>
		);

		expect(
			screen.getByRole("button", { name: /Extend the registry/ })
		).toBeEnabled();
		expect(screen.queryByText("git tag")).not.toBeInTheDocument();
		expect(screen.queryByText("new")).not.toBeInTheDocument();
	});

	it("lists only what the shop sells: an archive service never appears, earned or not", () => {
		render(
			<ShopView
				view={{ ...gateFour, unlockedServiceIds: ["bootCache", "dockerImage"] }}
				{...handlers}
			/>
		);

		expect(screen.queryByText("Boot Cache")).not.toBeInTheDocument();
		expect(screen.queryByText("Docker Image")).not.toBeInTheDocument();
		expect(screen.queryByText(/Bank 256 KB/)).not.toBeInTheDocument();
	});

	it("renders nothing for an earned service that has no press yet, rather than a dead row", () => {
		render(
			<ShopView
				view={{ ...gateFour, unlockedServiceIds: ["hotReload"] }}
				{...handlers}
			/>
		);

		expect(screen.queryByText("Hot reload one offer")).not.toBeInTheDocument();
	});
});

describe("ShopView kill -9", () => {
	const gateSix = createMockRunView({
		storage: 512,
		gatePayout: createMockGatePayout({ clearedGateNumber: 6 }),
		shopControls: createMockShopControls({
			rebuildAvailable: true,
			canRebuild: true,
		}),
	});

	it("stays out of the shop until gate 5 is cleared", () => {
		render(
			<ShopView view={{ ...gateSix, unlockedServiceIds: [] }} {...handlers} />
		);

		expect(screen.queryByText("kill -9")).not.toBeInTheDocument();
	});

	it("ends the run on the second press only, the first arming the row", async () => {
		const onAbandon = vi.fn();
		render(
			<ShopView
				view={{ ...gateSix, unlockedServiceIds: ["abandon"] }}
				{...handlers}
				onAbandon={onAbandon}
			/>
		);

		await userEvent.click(screen.getByRole("button", { name: "kill -9" }));
		expect(onAbandon).not.toHaveBeenCalled();
		expect(screen.getByText("press again to end the run")).toBeVisible();

		await userEvent.click(screen.getByRole("button", { name: "kill -9" }));
		expect(onAbandon).toHaveBeenCalledOnce();
	});

	it("disarms when another service is pressed instead", async () => {
		const onAbandon = vi.fn();
		render(
			<ShopView
				view={{ ...gateSix, unlockedServiceIds: ["abandon"] }}
				{...handlers}
				onAbandon={onAbandon}
			/>
		);

		await userEvent.click(screen.getByRole("button", { name: "kill -9" }));
		await userEvent.click(
			screen.getByRole("button", { name: /Rebuild the registry/ })
		);
		expect(
			screen.queryByText("press again to end the run")
		).not.toBeInTheDocument();

		await userEvent.click(screen.getByRole("button", { name: "kill -9" }));
		expect(onAbandon).not.toHaveBeenCalled();
	});

	it("carries no price, since the press costs nothing", () => {
		render(
			<ShopView
				view={{ ...gateSix, unlockedServiceIds: ["abandon"] }}
				{...handlers}
			/>
		);

		expect(screen.getByRole("button", { name: "kill -9" })).toBeEnabled();
	});
});
