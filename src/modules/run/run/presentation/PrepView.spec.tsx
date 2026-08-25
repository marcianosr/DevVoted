import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { createMockGateStake, createMockRunView } from "~/test/runView.factory";

import { PrepView, type PrepViewProps } from "./PrepView.component";

const view = createMockRunView({
	gatesCleared: 4,
	configs: [CONFIGS.js, CONFIGS.ts],
	slots: 4,
	nextSlotUnlock: { slot: 7, gate: 6 },
	storage: 184,
	gateStake: createMockGateStake({ gateNumber: 4, coverageDemand: 60 }),
});

const render_ = (overrides: Partial<PrepViewProps> = {}) =>
	render(
		<PrepView
			view={view}
			onStart={() => {}}
			onBackToShop={() => {}}
			onCommunity={() => {}}
			{...overrides}
		/>
	);

describe("PrepView", () => {
	it("wears the gate it is about to run", () => {
		render_();

		expect(
			screen.getByRole("heading", { name: "Gate 4 · Lavender" })
		).toBeInTheDocument();
	});

	// PrepScreen reads the width off configs + slots, so the rows have to be
	// exactly what the run holds or the header overstates the build.
	it("counts the build against the width the gate grants", () => {
		render_();

		expect(screen.getByText("2 / 4")).toBeInTheDocument();
	});

	it("shows room to fill rather than the next gate while there is any", () => {
		render_();

		expect(screen.queryByText(/opens when gate/)).not.toBeInTheDocument();
	});

	// The promised slot sits beside the count, never inside it: a build at its cap
	// reads full, and the gate that widens it is the note next to that.
	it("points at the next slot once the build is at the granted cap", () => {
		render_({ view: createMockRunView({ ...view, slots: 2 }) });

		expect(screen.getByText("2 / 2")).toBeInTheDocument();
		expect(screen.getByText("opens when gate 6 clears")).toBeInTheDocument();
	});

	it("stops promising slots at the cap, where none are left to grant", () => {
		render_({
			view: createMockRunView({ ...view, slots: 2, nextSlotUnlock: null }),
		});

		expect(screen.getByText("2 / 2")).toBeInTheDocument();
		expect(screen.queryByText(/opens when gate/)).not.toBeInTheDocument();
	});

	it("states what the gate asks of the attempt", () => {
		render_();

		expect(
			screen.getByText("Earn 60% coverage in this window")
		).toBeInTheDocument();
	});

	// The plan bills on every attempt; a config subscription waits for a clear.
	it("qualifies the bill that waits for the clear, and only that one", () => {
		render_({
			view: createMockRunView({
				...view,
				gateStake: createMockGateStake({
					gateNumber: 4,
					subscriptions: {
						lines: [
							{
								id: "plan",
								label: "Storage plan, tier 2",
								kb: 8,
								billedOnMiss: true,
							},
							{
								id: "freemium",
								label: "Freemium",
								kb: 128,
								billedOnMiss: false,
							},
						],
						totalKb: 136,
						onMissKb: 8,
						shortfallKb: 0,
					},
				}),
			}),
		});

		expect(screen.getByText("on clear")).toBeInTheDocument();
		expect(screen.queryByText("pass or fail")).not.toBeInTheDocument();
		expect(screen.getByText("−8 KB on a miss")).toBeInTheDocument();
	});

	it("warns when the balance cannot cover what is owed", () => {
		render_({
			view: createMockRunView({
				...view,
				gateStake: createMockGateStake({
					gateNumber: 4,
					subscriptions: {
						lines: [
							{
								id: "plan",
								label: "Storage plan, tier 2",
								kb: 8,
								billedOnMiss: true,
							},
						],
						totalKb: 8,
						onMissKb: 8,
						shortfallKb: 56,
					},
				}),
			}),
		});

		expect(
			screen.getByText("56 KB short. What you cannot pay lapses.")
		).toHaveClass("text-cinnabar");
	});

	it("keeps a suppressed audit on the receipt, struck rather than hidden", () => {
		render_({
			view: createMockRunView({
				...view,
				gateStake: createMockGateStake({
					gateNumber: 4,
					audits: [
						{
							id: "timeout-4",
							name: "Timeout",
							description: "On the clock.",
							suppressed: true,
						},
					],
				}),
			}),
		});

		const fold = screen.getByText("Audits").closest("details");
		if (!fold) throw new Error("No Audit fold rendered");

		expect(within(fold).getByText("Timeout")).toHaveClass("line-through");
	});

	it("shows no prefetch fold when nothing in the build reads the draw", () => {
		render_();

		expect(screen.queryByText("Prefetch")).not.toBeInTheDocument();
	});

	it("names the categories the draw holds when a config reveals them", () => {
		render_({
			view: createMockRunView({
				...view,
				upcomingCategories: ["ts", "js"],
				nextGateCategories: ["git"],
			}),
		});

		expect(screen.getByText("TypeScript")).toBeInTheDocument();
		expect(screen.getByText("Git")).toBeInTheDocument();
	});

	it("leaves the gate from the start button and the run from the other two", async () => {
		const onStart = vi.fn();
		const onBackToShop = vi.fn();
		const onCommunity = vi.fn();
		render_({ onStart, onBackToShop, onCommunity });

		await userEvent.click(
			screen.getByRole("button", { name: "Start Lavender gate →" })
		);
		await userEvent.click(
			screen.getByRole("button", { name: "← Back to shop" })
		);
		await userEvent.click(screen.getByRole("button", { name: "Community →" }));

		expect(onStart).toHaveBeenCalledOnce();
		expect(onBackToShop).toHaveBeenCalledOnce();
		expect(onCommunity).toHaveBeenCalledOnce();
	});

	// Today's polls are spent, so the gate cannot be attempted until tomorrow.
	it("shuts the gate behind the window when the polls run out", () => {
		render_({ view: createMockRunView({ ...view, pollsExhausted: true }) });

		expect(
			screen.getByRole("button", { name: "opens with the next window" })
		).toBeDisabled();
	});

	it("badges each installed config's headline figure", () => {
		render_();

		// .js and .ts are both focus configs at v1.
		expect(screen.getAllByText("×1.25")).toHaveLength(2);
	});
});
