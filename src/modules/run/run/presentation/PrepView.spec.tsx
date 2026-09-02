import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { createMockGateStake, createMockRunView } from "~/test/runView.factory";

import { PrepView, type PrepViewProps } from "./PrepView.component";

const view = createMockRunView({
	gatesCleared: 4,
	configs: [CONFIGS.js, CONFIGS.ts],
	slots: 4,
	slotsUsed: 2,
	slotsFree: 2,
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

		expect(screen.getByText("Gate 4 · Lavender")).toBeInTheDocument();
	});

	it("counts the build in slots against the width the gate grants", () => {
		render_();

		expect(screen.getByText("2 of 4 slots")).toBeInTheDocument();
	});

	it("states what the gate asks of the attempt", () => {
		render_();

		expect(screen.getByText("earn 60% in this window")).toBeInTheDocument();
	});

	it("lists the bill that waits for the clear", () => {
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

		expect(screen.getByText("Storage plan, tier 2")).toBeInTheDocument();
		expect(screen.getByText("billed pass or fail")).toBeInTheDocument();

		// PriceTag spells the unit into its own span, so the figure is split
		// across elements and only the row's textContent holds it whole.
		const total = screen.getByText("Total this gate").closest("div");
		expect(total?.textContent).toContain("−136 KB");
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

		expect(screen.getByText("short by 56 KB")).toBeInTheDocument();
	});

	it("shows no bills section when the build owes nothing", () => {
		render_();

		expect(screen.queryByText("Bills")).not.toBeInTheDocument();
	});

	// A defeat device turning an audit off is worth seeing: it is what the
	// config was bought for. Hiding the row hides the payoff.
	it("keeps a suppressed audit on the receipt, struck rather than hidden", () => {
		render_({
			view: createMockRunView({
				...view,
				gateStake: createMockGateStake({
					gateNumber: 4,
					audits: [
						{
							id: "timeout-4",
							code: 408,
							name: "Request Timeout",
							description: "On the clock.",
							suppressed: true,
						},
					],
				}),
			}),
		});

		expect(screen.getByText("Request Timeout")).toHaveClass("line-through");
		expect(screen.getByText("reported passing")).toBeInTheDocument();
	});

	it("leaves a suppressed audit out of the running count", () => {
		render_({
			view: createMockRunView({
				...view,
				gateStake: createMockGateStake({
					gateNumber: 4,
					audits: [
						{
							id: "timeout-4",
							code: 408,
							name: "Request Timeout",
							description: "On the clock.",
							suppressed: true,
						},
					],
				}),
			}),
		});

		expect(screen.getByText("none running")).toBeInTheDocument();
	});

	it("shows no prefetch section when nothing in the build reads the draw", () => {
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

		expect(screen.getByText("TypeScript · JavaScript")).toBeInTheDocument();
		expect(screen.getByText("Git")).toBeInTheDocument();
	});

	it("leaves the gate from the start button and the run from the other two", async () => {
		const onStart = vi.fn();
		const onBackToShop = vi.fn();
		const onCommunity = vi.fn();
		render_({ onStart, onBackToShop, onCommunity });

		const starts = screen.getAllByRole("button", { name: "Start Lavender →" });
		await userEvent.click(starts[0]);
		await userEvent.click(
			screen.getByRole("button", { name: "← change · 184 KB" })
		);
		await userEvent.click(screen.getByRole("button", { name: "Community" }));

		expect(onStart).toHaveBeenCalledOnce();
		expect(onBackToShop).toHaveBeenCalledOnce();
		expect(onCommunity).toHaveBeenCalledOnce();
	});

	it("shuts the gate behind the window when the polls run out", async () => {
		const onStart = vi.fn();
		render_({
			view: createMockRunView({ ...view, pollsExhausted: true }),
			onStart,
		});

		const locked = screen.getAllByRole("button", {
			name: "opens with the next window",
		});
		await userEvent.click(locked[0]);

		expect(onStart).not.toHaveBeenCalled();
	});

	it("prices what a miss takes", () => {
		render_();

		expect(screen.getByText(/^remove \d+ slots?$/)).toBeInTheDocument();
	});
});
