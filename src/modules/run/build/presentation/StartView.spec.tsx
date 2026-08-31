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

		expect(
			screen.getByRole("heading", { name: "New run" })
		).toBeInTheDocument();
		expect(screen.getByText("Pallet gate")).toBeInTheDocument();
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

		expect(screen.getAllByText("Recommended")).toHaveLength(1);
	});

	it("takes a whole stack in one press", async () => {
		const onPickStack = vi.fn();
		render_({ onPickStack });

		const [first] = screen.getAllByRole("button", { name: "take these" });
		await userEvent.click(first);

		expect(onPickStack).toHaveBeenCalledWith(STARTER_STACKS[0].id);
	});

	it("deals the stacks' configs once each", () => {
		render_();

		expect(screen.getAllByText(".js")).toHaveLength(1);
		expect(screen.getAllByText(".jsx")).toHaveLength(1);
		expect(screen.getByText(/dealt from/)).toBeInTheDocument();
	});

	it("lets a config be picked outside any stack", async () => {
		const onToggle = vi.fn();
		render_({ onToggle });

		await userEvent.click(screen.getByRole("checkbox", { name: /ESLint/ }));

		expect(onToggle).toHaveBeenCalledWith(CONFIGS.eslint.id);
	});

	it("states each dealt config's size in slots", () => {
		render_();

		const row = screen.getByText(".js").closest("li");
		expect(row?.textContent).toContain("1 slot");
		expect(screen.queryByText("common")).not.toBeInTheDocument();
	});

	it("holds the run shut while the build is bare", () => {
		render_({ view: createMockRunView({ ...view, canStart: false }) });

		expect(
			screen.getByRole("button", { name: "Pick a config to start" })
		).toBeDisabled();
	});

	it("starts with slots to spare, once the engine says it can", async () => {
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

	it("names no seed, the prototype dealing an unseeded hand", () => {
		render_();

		expect(screen.queryByText(/^seed/)).not.toBeInTheDocument();
	});

	it("badges each config's headline figure beside its name", () => {
		render_();

		expect(screen.getAllByText("×1.25").length).toBeGreaterThan(1);
		expect(screen.getAllByText("+0.5").length).toBeGreaterThan(0);
	});

	it("badges nothing for a config that prices in something else", () => {
		render_();

		const row = screen.getByText("ESLint").closest("li");
		if (!row) throw new Error("No ESLint row rendered");

		expect(row.querySelector(".bg-celadon\\/15")).not.toBeInTheDocument();
	});

	it("says what the archive holds, the run having no storage of its own yet", () => {
		render_({ view: withArchive(512) });

		expect(screen.getByText("512 KB")).toBeInTheDocument();
	});

	it("sells width off the hatching at the archive's doubled rung", () => {
		render_({ view: withArchive(512) });

		expect(
			screen.getByRole("button", {
				name: /Install a new slot from the archive · makes 5 · 32 KB/,
			})
		).toBeInTheDocument();
	});

	it("arms before it spends, the archive being the only purse open here", async () => {
		const onBuySlot = vi.fn();
		render_({ view: withArchive(512), onBuySlot });

		const stub = () => screen.getByRole("button", { name: /Install a new slot/ });

		await userEvent.click(stub());
		expect(onBuySlot).not.toHaveBeenCalled();

		await userEvent.click(stub());
		expect(onBuySlot).toHaveBeenCalledOnce();
	});

	it("refuses a rung the archive cannot cover, saying what it holds", () => {
		render_({ view: withArchive(12) });

		expect(
			screen.getByRole("button", {
				name: /Costs 32 KB of archive, you have 12\./,
			})
		).toBeDisabled();
	});

	it("hands a bought slot back for what it cost, the run not having started", async () => {
		const onRefundSlot = vi.fn();
		render_({ view: withArchive(480, 5, 1), onRefundSlot });

		const back = () =>
			screen.getByRole("button", {
				name: /Refund the slot to the archive · makes 4 · \+32 KB/,
			});

		await userEvent.click(back());
		await userEvent.click(back());

		expect(onRefundSlot).toHaveBeenCalledOnce();
	});

	it("offers no refund before the archive has bought anything", () => {
		render_({ view: withArchive(512) });

		expect(screen.queryByRole("button", { name: /Refund/ })).not.toBeInTheDocument();
	});
});
