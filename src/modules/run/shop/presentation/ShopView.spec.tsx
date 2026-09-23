import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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
	onRebuild: noop,
	onExtend: noop,
	onPlantPin: noop,
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
		expect(screen.getByText("4 of the 5 right clears it.")).toBeInTheDocument();
	});

	it("stands the build beside the registry", () => {
		render(<ShopView view={view} {...handlers} />);

		expect(screen.getByText("Build")).toBeInTheDocument();
		expect(screen.getByText("Registry")).toBeInTheDocument();
	});

	it("names the gate the shop opened on", () => {
		render(<ShopView view={view} {...handlers} />);

		expect(screen.getByText(/^Shop/)).toBeInTheDocument();
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

	/**
	 * The only lock left on the door, and only ever after a bill the balance
	 * could not cover: the run is held to the space it actually paid for.
	 */
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

		// The press renames itself, so the second press is a different affordance
		// rather than the same one pressed twice.
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
			screen.queryByRole("button", { name: "Uninstall AGENTS.md" })
		).toBeNull();
		expect(
			screen.getByRole("button", { name: "Uninstall vendor lock-in" })
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
