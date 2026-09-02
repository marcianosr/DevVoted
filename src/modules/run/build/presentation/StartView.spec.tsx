import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { STARTER_STACKS } from "~/modules/run/config/domain/stack.model";
import { SLOT_PRICES_KB } from "~/modules/run/run/domain/rules.model";
import { createMockGateStake, createMockRunView } from "~/test/runView.factory";

import { StartView, type StartViewProps } from "./StartView.component";

const view = createMockRunView({
	gatesCleared: 0,
	configs: [],
	slots: 4,
	slotsUsed: 0,
	slotsFree: 4,
	available: Object.values(CONFIGS),
	gateStake: createMockGateStake({ gateNumber: 0, coverageDemand: 3 }),
});

const render_ = (overrides: Partial<StartViewProps> = {}) =>
	render(
		<StartView
			view={view}
			onToggle={() => {}}
			onPickStack={() => {}}
			onBuySlot={() => {}}
			onRefundSlot={() => {}}
			onStart={() => {}}
			{...overrides}
		/>
	);

const withArchive = (archiveKb: number, slots = 4, slotsBought = 0) =>
	createMockRunView({
		...view,
		slots,
		slotsFree: slots,
		startSlotDeals: {
			archiveKb,
			buy:
				archiveKb >= SLOT_PRICES_KB[slotsBought] * 2
					? {
							costKb: SLOT_PRICES_KB[slotsBought] * 2,
							makes: slots + 1,
						}
					: {
							costKb: SLOT_PRICES_KB[slotsBought] * 2,
							refusal: `Costs ${SLOT_PRICES_KB[slotsBought] * 2} KB of archive, you have ${archiveKb}.`,
						},
			cash:
				slotsBought === 0
					? {}
					: {
							costKb: SLOT_PRICES_KB[slotsBought - 1] * 2,
							makes: slots - 1,
						},
		},
	});

describe("StartView", () => {
	it("opens on the first gate, named", () => {
		render_();

		expect(screen.getByText("New run")).toBeInTheDocument();
		expect(screen.getByText(/^Pallet · /)).toBeInTheDocument();
	});

	it("offers every starter stack by name, with its own blurb", () => {
		render_();

		for (const stack of STARTER_STACKS) {
			expect(screen.getByText(stack.name)).toBeInTheDocument();
			expect(screen.getByText(stack.blurb)).toBeInTheDocument();
		}
	});

	it("flags the one stack a first run should take", () => {
		render_();

		expect(screen.getAllByText("recommended")).toHaveLength(1);
	});

	it("takes a whole stack in one press", async () => {
		const onPickStack = vi.fn();
		render_({ onPickStack });

		const [first] = screen.getAllByRole("button", { name: "Take this stack" });
		await userEvent.click(first);

		expect(onPickStack).toHaveBeenCalledWith(STARTER_STACKS[0].id);
	});

	it("deals the stacks' configs once each", () => {
		render_();

		expect(screen.getAllByText(".js")).toHaveLength(1);
		expect(screen.getAllByText(".jsx")).toHaveLength(1);
	});

	it("lets a config be picked outside any stack", async () => {
		const onToggle = vi.fn();
		render_({ onToggle });

		await userEvent.click(
			screen.getByRole("button", { name: "Install ESLint" })
		);

		expect(onToggle).toHaveBeenCalledWith(CONFIGS.eslint.id);
	});

	// A dealt config already installed is in the build list instead, so offering
	// it twice would let the same config be installed on top of itself.
	it("moves an installed config out of the deal and into the build", () => {
		render_({
			view: createMockRunView({
				...view,
				configs: [CONFIGS.js],
				slotsUsed: 1,
				slotsFree: 3,
			}),
		});

		expect(
			screen.queryByRole("button", { name: "Install .js" })
		).not.toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Uninstall .js" })
		).toBeInTheDocument();
	});

	it("locks a dealt config too big for the room left", () => {
		render_({
			view: createMockRunView({ ...view, slotsFree: 0 }),
		});

		expect(
			screen.getByRole("button", { name: "Install ESLint" })
		).toBeDisabled();
	});

	it("holds the run shut while the build is bare", () => {
		render_({ view: createMockRunView({ ...view, canStart: false }) });

		expect(
			screen.getByRole("button", { name: "Fill every slot to start" })
		).toBeDisabled();
	});

	it("starts once the engine says it can", async () => {
		const onStart = vi.fn();
		render_({
			view: createMockRunView({
				...view,
				configs: [CONFIGS.js, CONFIGS.ts],
				canStart: true,
			}),
			onStart,
		});

		await userEvent.click(
			screen.getByRole("button", { name: "Start the run →" })
		);

		expect(onStart).toHaveBeenCalledOnce();
	});

	it("says what the archive holds, the run having no storage of its own yet", () => {
		render_({ view: withArchive(512) });

		expect(screen.getByText("512 KB")).toBeInTheDocument();
	});

	it("sells width off the archive at the doubled rung", async () => {
		const onBuySlot = vi.fn();
		render_({ view: withArchive(512), onBuySlot });

		await userEvent.click(screen.getByRole("button", { name: /Buy slot 5/ }));

		expect(onBuySlot).toHaveBeenCalledOnce();
	});

	it("refuses a rung the archive cannot cover, saying what it holds", () => {
		render_({ view: withArchive(12) });

		expect(screen.getByRole("button", { name: /Buy slot 5/ })).toBeDisabled();
		expect(
			screen.getByText("Costs 32 KB of archive, you have 12.")
		).toBeInTheDocument();
	});

	it("hands a bought slot back, the run not having started", async () => {
		const onRefundSlot = vi.fn();
		render_({ view: withArchive(480, 5, 1), onRefundSlot });

		await userEvent.click(
			screen.getByRole("button", { name: /Refund slot 5/ })
		);

		expect(onRefundSlot).toHaveBeenCalledOnce();
	});

	it("offers no refund before the archive has bought anything", () => {
		render_({ view: withArchive(512) });

		expect(
			screen.queryByRole("button", { name: /Refund slot/ })
		).not.toBeInTheDocument();
	});
});
