import { describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { toRunView } from "~/modules/run/run/application/runView.viewmodel";
import { answerWith, started } from "~/modules/run/run/domain/run.factory";
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
		createMockShopOffer(CONFIGS.eslint, { priceKb: 64, installable: true }),
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
	it("prices the gate ahead in answers, so a re-based percentage still reads", () => {
		const cleared = [true, true, false, false, false].reduce(
			answerWith,
			started([])
		);

		render(<ShopView view={toRunView(cleared)} {...handlers} />);

		expect(screen.getByText("21%")).toBeInTheDocument();
	});

	it("stands the build beside the registry", () => {
		render(<ShopView view={view} {...handlers} />);

		expect(screen.getByText("Build")).toBeInTheDocument();
		expect(screen.getByText("Registry")).toBeInTheDocument();
	});

	it("names the shop for the gate it is stocking for, not the one cleared", () => {
		render(<ShopView view={view} {...handlers} />);

		expect(screen.getByText(/Shop$/)).toBeInTheDocument();
		expect(screen.queryByText(/^Shop ·/)).not.toBeInTheDocument();
	});

	it("installs an offer the run can afford", async () => {
		const onDraft = vi.fn();
		render(<ShopView view={view} {...handlers} onDraft={onDraft} />);

		await userEvent.click(
			screen.getByRole("button", { name: /Install ESLint/ })
		);
		expect(onDraft).toHaveBeenCalledWith(CONFIGS.eslint.id);
	});

	it("prices the install on the button rather than in a badge beside it", () => {
		render(<ShopView view={view} {...handlers} />);

		expect(
			screen.getByRole("button", { name: "Install ESLint \u00b7 64 KB" })
		).toHaveTextContent("Install \u00b7 64 KB");
	});

	it("previews what an install would leave when the offer is pointed at", async () => {
		const user = userEvent.setup();
		render(<ShopView view={view} {...handlers} />);

		await user.hover(
			screen.getByRole("button", { name: "Install ESLint \u00b7 64 KB" })
		);

		expect(screen.getByText(/after install/)).toBeInTheDocument();
		expect(screen.getByText("448 KB")).toBeInTheDocument();
	});

	it("drops the preview once the pointer leaves the offer", async () => {
		const user = userEvent.setup();
		render(<ShopView view={view} {...handlers} />);

		const press = screen.getByRole("button", {
			name: "Install ESLint \u00b7 64 KB",
		});
		await user.hover(press);
		await user.unhover(press);

		expect(screen.queryByText(/after install/)).not.toBeInTheDocument();
	});

	it("previews for a keyboard too, which never hovers anything", async () => {
		render(<ShopView view={view} {...handlers} />);

		act(() => {
			screen
				.getByRole("button", { name: "Install ESLint \u00b7 64 KB" })
				.focus();
		});

		expect(screen.getByText("448 KB")).toBeInTheDocument();
	});

	it("previews nothing for an offer the balance cannot cover", async () => {
		const user = userEvent.setup();
		render(<ShopView view={view} {...handlers} />);

		await user.hover(screen.getByRole("button", { name: /^Install \.ts/ }));

		expect(screen.queryByText(/after install/)).not.toBeInTheDocument();
	});

	it("refuses the install of an offer the run cannot afford", () => {
		render(<ShopView view={view} {...handlers} />);

		expect(
			screen.getByRole("button", { name: /^Install \.ts/ })
		).toBeDisabled();
	});

	it("rebuilds the registry from its control", async () => {
		const onRebuild = vi.fn();
		render(<ShopView view={view} {...handlers} onRebuild={onRebuild} />);

		await userEvent.click(
			screen.getByRole("button", { name: /Rebuild the registry/ })
		);
		expect(onRebuild).toHaveBeenCalled();
	});

	it("leaves for prep from the footer", async () => {
		const onContinue = vi.fn();
		render(<ShopView view={view} {...handlers} onContinue={onContinue} />);

		await userEvent.click(screen.getByRole("button", { name: /To prep/ }));
		expect(onContinue).toHaveBeenCalled();
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
		render(<ShopView view={createMockRunView(view)} {...handlers} />);

		expect(screen.queryByText("build space")).not.toBeInTheDocument();
		expect(screen.queryByRole("button", { name: /^8 weight/ })).toBeNull();
	});

	it("installs an offer that stays inside the rung on a single press", async () => {
		const onDraft = vi.fn();
		render(<ShopView view={view} {...handlers} onDraft={onDraft} />);

		await userEvent.click(
			screen.getByRole("button", { name: /Install ESLint/ })
		);

		expect(onDraft).toHaveBeenCalledWith("eslint");
	});

	it("arms an install that crosses a rung, and commits it on the second press", async () => {
		const onDraft = vi.fn();
		const crossing = createMockRunView({
			...view,
			offers: [
				createMockShopOffer(CONFIGS.eslint, {
					priceKb: 64,
					installable: true,
					scale: { from: 4, to: 6, perGateKb: 16 },
				}),
			],
		});
		render(<ShopView view={crossing} {...handlers} onDraft={onDraft} />);

		await userEvent.click(
			screen.getByRole("button", { name: /Install ESLint/ })
		);
		expect(onDraft).not.toHaveBeenCalled();
		expect(screen.getByText("Build space scales 4 → 6")).toBeInTheDocument();

		const confirm = screen.getByRole("button", {
			name: /Confirm installing ESLint/,
		});
		expect(confirm).toHaveTextContent("Confirm");
		expect(confirm).toHaveAttribute("data-screen-theme", "saffron");

		await userEvent.click(confirm);
		expect(onDraft).toHaveBeenCalledWith("eslint");
	});

	it("says what the crossing costs every gate, not only what it costs once", async () => {
		const crossing = createMockRunView({
			...view,
			offers: [
				createMockShopOffer(CONFIGS.eslint, {
					priceKb: 64,
					installable: true,
					scale: { from: 4, to: 6, perGateKb: 16 },
				}),
			],
		});
		render(<ShopView view={crossing} {...handlers} />);

		await userEvent.click(
			screen.getByRole("button", { name: /Install ESLint/ })
		);

		expect(
			screen.getByText(
				(_, element) =>
					element?.textContent === "Upkeep becomes 16 KB a gate" &&
					element.tagName.toLowerCase() === "p"
			)
		).toBeInTheDocument();
	});
});

describe("ShopView vendor lock-in", () => {
	const holding = createMockRunView({
		configs: [CONFIGS.vendorLockIn, CONFIGS.agentsMd],
		vendorLock: { offered: true },
	});

	it("offers the lock on every config except the vendor itself", () => {
		render(<ShopView view={holding} {...handlers} />);

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

	it("takes the uninstall press off the config it locked in", () => {
		render(
			<ShopView
				view={createMockRunView({
					configs: [CONFIGS.vendorLockIn, CONFIGS.agentsMd],
					vendorLock: { offered: false, lockedConfigId: "agents-md" },
				})}
				{...handlers}
			/>
		);

		expect(
			screen.queryByRole("button", { name: /^Uninstall AGENTS\.md/ })
		).toBeNull();
		expect(
			screen.getByRole("button", { name: /^Uninstall vendor lock-in/ })
		).toBeInTheDocument();
	});

	it("shuts the exit while the vendor names nobody", () => {
		render(<ShopView view={holding} {...handlers} />);

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

	it("sells an installed config's next version through the upgrade action", async () => {
		const onUpgrade = vi.fn();
		render(<ShopView view={upgradable} {...handlers} onUpgrade={onUpgrade} />);

		await userEvent.click(
			screen.getByRole("button", { name: /Upgrade Moore's Law to v2/ })
		);
		await userEvent.click(screen.getByRole("button", { name: /^Buy v2/ }));

		expect(onUpgrade).toHaveBeenCalledWith("moores-law");
	});

	it("sells the registry's rolled upgrade through the draft action instead", async () => {
		const onDraft = vi.fn();
		render(<ShopView view={upgradable} {...handlers} onDraft={onDraft} />);

		await userEvent.click(
			screen.getByRole("button", { name: /Upgrade Telemetry to v2/ })
		);
		await userEvent.click(screen.getByRole("button", { name: /^Buy v2/ }));

		expect(onDraft).toHaveBeenCalledWith("telemetry");
	});

	it("leaves a card's disclosure alone when its upgrade panel opens", async () => {
		render(<ShopView view={upgradable} {...handlers} />);

		const chevron = () =>
			screen.getByRole("button", { name: /(Expand|Collapse) Moore's Law/ });
		const before = chevron().getAttribute("aria-expanded");

		await userEvent.click(
			screen.getByRole("button", { name: /Upgrade Moore's Law to v2/ })
		);

		expect(chevron()).toHaveAttribute("aria-expanded", before);
		expect(screen.getByRole("button", { name: /^Buy v2/ })).toBeInTheDocument();
	});
});

describe("ShopView services (ADR-116)", () => {
	const gateFour = createMockRunView({
		storage: 512,
		gatePayout: createMockGatePayout({ clearedGateNumber: 4 }),
		shopControls: createMockShopControls({
			rebuildAvailable: true,
			canRebuild: true,
			extendAvailable: true,
			canExtend: true,
			pinAvailable: true,
			canPin: true,
		}),
	});

	it("names a service the account has not earned, with the line that earns it and no press", () => {
		render(
			<ShopView view={{ ...gateFour, unlockedServiceIds: [] }} {...handlers} />
		);

		expect(screen.getByText("Extend the registry")).toBeVisible();
		expect(screen.getByText("unlock · Reach Cascade")).toBeVisible();
		expect(screen.getByText("git tag")).toBeVisible();
		expect(screen.getByText("unlock · Reach gate 4")).toBeVisible();
		expect(
			screen.queryByRole("button", { name: /Extend the registry/ })
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

	it("sells an earned service like any other, with no press on the locked ones", () => {
		render(
			<ShopView
				view={{ ...gateFour, unlockedServiceIds: ["extend"] }}
				{...handlers}
			/>
		);

		expect(
			screen.getByRole("button", { name: /Extend the registry/ })
		).toBeEnabled();
		expect(screen.getByText("unlock · Reach gate 4")).toBeVisible();
		expect(screen.getAllByRole("button", { name: /registry/ })).toHaveLength(2);
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

	it("reads its unlock line until gate 5 is cleared", () => {
		render(
			<ShopView view={{ ...gateSix, unlockedServiceIds: [] }} {...handlers} />
		);

		expect(screen.getByText("kill -9")).toBeVisible();
		expect(screen.getByText("unlock · Clear gate 5")).toBeVisible();
		expect(
			screen.queryByRole("button", { name: /kill -9/ })
		).not.toBeInTheDocument();
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
