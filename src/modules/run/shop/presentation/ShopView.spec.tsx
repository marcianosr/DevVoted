import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

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
	onExtend: noop,
	onPlantPin: noop,
	onBuySlot: noop,
	onCashSlot: noop,
	onSetStoragePlan: noop,
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

	it("shows an unaffordable offer without a press", () => {
		render(<ShopView view={view} {...handlers} />);

		expect(
			screen.queryByRole("button", { name: /Install TypeScript/ })
		).not.toBeInTheDocument();
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

	it("shuts the exit while the build is over capacity", () => {
		render(
			<ShopView
				view={createMockRunView({ ...view, overflowSlots: 2 })}
				{...handlers}
			/>
		);

		expect(screen.getByRole("button", { name: /To prep/ })).toBeDisabled();
		expect(screen.getByText(/over capacity by 2/)).toBeInTheDocument();
	});
});
