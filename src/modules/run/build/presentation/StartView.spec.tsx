import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { SLOT_PRICES_KB } from "~/modules/run/run/domain/rules.model";
import { createMockGateStake, createMockRunView } from "~/test/runView.factory";

import { StartView, type StartViewProps } from "./StartView.component";

const dealt = [
	CONFIGS.js,
	CONFIGS.ts,
	CONFIGS.unitTests,
	CONFIGS.eslint,
	CONFIGS.codeCoverage,
];

const view = createMockRunView({
	gatesCleared: 0,
	configs: [],
	slots: 4,
	slotsUsed: 0,
	slotsFree: 4,
	available: dealt,
	gateStake: createMockGateStake({ gateNumber: 0, coverageDemand: 3 }),
});

const render_ = (overrides: Partial<StartViewProps> = {}) =>
	render(
		<StartView
			view={view}
			onToggle={() => {}}
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

	it("deals every config as one toggleable row", () => {
		render_();

		for (const config of dealt) {
			expect(
				screen.getByRole("button", { name: `Install ${config.label}` })
			).toHaveAttribute("aria-pressed", "false");
		}
	});

	it("picks a dealt config on press", async () => {
		const onToggle = vi.fn();
		render_({ onToggle });

		await userEvent.click(
			screen.getByRole("button", { name: "Install ESLint" })
		);

		expect(onToggle).toHaveBeenCalledWith(CONFIGS.eslint.id);
	});

	it("keeps a picked config in the deal, marked as picked", () => {
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
		).toHaveAttribute("aria-pressed", "true");
	});

	it("counts the picks against the deal", () => {
		render_({
			view: createMockRunView({
				...view,
				configs: [CONFIGS.js, CONFIGS.ts],
				slotsUsed: 2,
				slotsFree: 2,
			}),
		});

		expect(screen.getByText("2 of 5 picked")).toBeInTheDocument();
	});

	it("locks a dealt config too big for the room left", () => {
		render_({
			view: createMockRunView({ ...view, slotsFree: 0 }),
		});

		expect(
			screen.getByRole("button", { name: "Install ESLint" })
		).toBeDisabled();
	});

	it("keeps a picked config unpickable even with no room left", () => {
		render_({
			view: createMockRunView({
				...view,
				configs: [CONFIGS.js],
				slotsUsed: 4,
				slotsFree: 0,
			}),
		});

		expect(
			screen.getByRole("button", { name: "Uninstall .js" })
		).toBeEnabled();
	});

	it("holds the run shut while the build is bare", () => {
		render_({ view: createMockRunView({ ...view, canStart: false }) });

		expect(
			screen.getByRole("button", { name: "Pick a config to start" })
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
			screen.getByRole("button", { name: /Hand slot 5 back/ })
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

describe("the suggested opening (ADR-057)", () => {
	it("marks the suggested rows without pressing them", () => {
		render_({
			view: createMockRunView({
				...view,
				recommendedConfigIds: [CONFIGS.js.id, CONFIGS.ts.id],
			}),
		});

		expect(screen.getAllByText("suggested")).toHaveLength(2);
		expect(
			screen.getByRole("button", { name: "Install .js" })
		).toHaveAttribute("aria-pressed", "false");
	});

	it("drops the mark once the row is picked", () => {
		render_({
			view: createMockRunView({
				...view,
				configs: [CONFIGS.js],
				slotsUsed: 1,
				slotsFree: 3,
				recommendedConfigIds: [CONFIGS.js.id, CONFIGS.ts.id],
			}),
		});

		expect(screen.getAllByText("suggested")).toHaveLength(1);
	});

	it("marks nothing when the deal suggests nothing", () => {
		render_();

		expect(screen.queryByText("suggested")).not.toBeInTheDocument();
	});
});
