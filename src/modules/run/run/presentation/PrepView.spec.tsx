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
			onRebase={() => {}}
			onEstimate={() => {}}
			{...overrides}
		/>
	);

const rowFor = (label: string) => screen.getByText(label).closest("div");

describe("PrepView", () => {
	it("wears the gate it is about to run", () => {
		render_();

		expect(screen.getByText("Gate 4 · Lavender")).toBeInTheDocument();
	});

	it("names both build measurements rather than one ambiguous count", () => {
		render_();

		expect(rowFor("configs")?.textContent).toBe("configs2");
		expect(rowFor("slots")?.textContent).toBe("slots2 / 4");
	});

	it("states what the gate asks of the attempt", () => {
		render_();

		expect(screen.getByText("0 of 60%")).toBeInTheDocument();
	});

	it("reads the coverage held against the demand on a bar", () => {
		render_({
			view: createMockRunView({
				...view,
				gateStake: createMockGateStake({
					gateNumber: 4,
					coverageDemand: 60,
					coverageHeld: 74.25,
				}),
			}),
		});

		expect(screen.getByLabelText("74.3% of 60% needed")).toBeInTheDocument();
	});

	it("reads the coverage once, in the gate window rather than the header", () => {
		render_();

		expect(screen.queryByText("Coverage")).not.toBeInTheDocument();
		expect(screen.getByText("target")).toBeInTheDocument();
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

		expect(screen.getByText("408 Request Timeout")).toHaveClass("line-through");
		expect(screen.getByText("reported passing")).toBeInTheDocument();
	});

	it("reads none when the gate runs no audit at all", () => {
		render_({
			view: createMockRunView({
				...view,
				gateStake: createMockGateStake({ gateNumber: 4, audits: [] }),
			}),
		});

		expect(screen.getByText("none")).toBeInTheDocument();
	});

	it("counts the window's polls off as they are answered", () => {
		render_({
			view: createMockRunView({ ...view, pollsAnswered: 2 }),
		});

		expect(screen.getByText("2 / 5 answered")).toBeInTheDocument();
	});

	it("redacts the poll types and option counts nothing in the build reads", () => {
		render_();

		expect(screen.getAllByText("???")).toHaveLength(2);
	});

	it("blanks the hidden categories one per poll in the window", () => {
		render_();

		expect(screen.getAllByText("?")).toHaveLength(5);
	});

	it("credits the config that revealed the draw", () => {
		render_({
			view: createMockRunView({
				...view,
				configs: [CONFIGS.js, CONFIGS.prefetch],
				upcomingCategories: ["js", "js"],
			}),
		});

		expect(rowFor("categories")).toHaveTextContent("Prefetch");
	});

	it("counts the draw by category once a config reveals it", () => {
		render_({
			view: createMockRunView({
				...view,
				upcomingCategories: ["js", "ts", "js"],
				answerTypesThisGate: { single: 4, multiple: 1 },
				optionCountsThisGate: [4, 4, 5],
			}),
		});

		const categories = rowFor("categories");
		expect(categories).toHaveTextContent("javascript2");
		expect(categories).toHaveTextContent("typescript1");
		expect(screen.queryByText("???")).not.toBeInTheDocument();
	});

	it("leads the biggest category of the draw", () => {
		render_({
			view: createMockRunView({
				...view,
				upcomingCategories: ["ts", "js", "js"],
			}),
		});

		expect(rowFor("categories")?.textContent).toBe(
			"categoriesjavascript2·typescript1"
		);
	});

	it("reads the poll types out as counts once a config reveals them", () => {
		render_({
			view: createMockRunView({
				...view,
				answerTypesThisGate: { single: 4, multiple: 1 },
			}),
		});

		expect(rowFor("type")?.textContent).toBe("type4single·1multiple");
	});

	it("lists how many options each remaining poll offers, in play order", () => {
		render_({
			view: createMockRunView({
				...view,
				optionCountsThisGate: [4, 4, 6, 5],
			}),
		});

		expect(rowFor("options")?.textContent).toBe("options4·4·6·5");
	});

	it("redacts the option counts when today's polls are spent", () => {
		render_({
			view: createMockRunView({
				...view,
				optionCountsThisGate: [],
			}),
		});

		expect(rowFor("options")?.textContent).toBe("options???");
	});

	it("names only the answer type the window actually holds", () => {
		render_({
			view: createMockRunView({
				...view,
				answerTypesThisGate: { single: 5, multiple: 0 },
			}),
		});

		expect(rowFor("type")?.textContent).toBe("type5single");
	});

	it("counts the next gate's draw on its own line", () => {
		render_({
			view: createMockRunView({
				...view,
				upcomingCategories: ["ts", "js"],
				nextGateCategories: ["git", "git"],
			}),
		});

		expect(rowFor("next gate")?.textContent).toBe("next gategit2");
	});

	it("leaves the gate from the start button and the run from the other two", async () => {
		const onStart = vi.fn();
		const onBackToShop = vi.fn();
		const onCommunity = vi.fn();
		render_({ onStart, onBackToShop, onCommunity });

		await userEvent.click(
			screen.getByRole("button", { name: "Start Lavender →" })
		);
		await userEvent.click(screen.getByRole("button", { name: "Back to shop" }));
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

		await userEvent.click(
			screen.getByRole("button", { name: "opens with the next window" })
		);

		expect(onStart).not.toHaveBeenCalled();
	});

	it("hides the rebase panel when no config reorders the gate", () => {
		render_();

		expect(screen.queryByText("git rebase -i")).not.toBeInTheDocument();
	});

	it("lists the gate's polls by category and coverage once git rebase -i is in", () => {
		render_({
			view: createMockRunView({
				...view,
				coverageByCategory: { react: 74.2, java: 8 },
				rebaseSlots: [
					{ id: "p1", category: "java" },
					{ id: "p2", category: "react" },
				],
			}),
		});

		expect(screen.getByText("git rebase -i")).toBeInTheDocument();
		expect(rowFor("Java")?.textContent).toContain("8% coverage");
		expect(rowFor("React")?.textContent).toContain("74.2% coverage");
	});

	it("moves a poll down and reports the swap it wants", async () => {
		const onRebase = vi.fn();
		render_({
			view: createMockRunView({
				...view,
				rebaseSlots: [
					{ id: "p1", category: "java" },
					{ id: "p2", category: "react" },
				],
			}),
			onRebase,
		});

		await userEvent.click(
			screen.getByRole("button", { name: "Move Java down" })
		);

		expect(onRebase).toHaveBeenCalledWith(0, 1);
	});

	it("pins the ends — the first poll cannot rise and the last cannot fall", () => {
		render_({
			view: createMockRunView({
				...view,
				rebaseSlots: [
					{ id: "p1", category: "java" },
					{ id: "p2", category: "react" },
				],
			}),
		});

		expect(screen.getByRole("button", { name: "Move Java up" })).toBeDisabled();
		expect(
			screen.getByRole("button", { name: "Move React down" })
		).toBeDisabled();
	});

	it("prices what a miss takes", () => {
		render_();

		expect(
			screen.getByText(/^remove (\d+ configs?|\d+–\d+ configs)$/)
		).toBeInTheDocument();
	});

	describe("the estimate (DVTD-68jr)", () => {
		const estimating = (committed: number | null = null) =>
			createMockRunView({
				...view,
				estimate: {
					configLabel: CONFIGS.planningPoker.label,
					choices: [1, 2, 3, 4, 5],
					kbPerPoll: 32,
				},
				estimatedCorrect: committed,
			});

		it("offers a press per poll, and no press for a bet on nothing", () => {
			render_({ view: estimating() });

			expect(
				screen.getByRole("button", { name: /^Estimate 1 correct/ })
			).toBeInTheDocument();
			expect(
				screen.getByRole("button", { name: /^Estimate 5 correct/ })
			).toBeInTheDocument();
			expect(
				screen.queryByRole("button", { name: /^Estimate 0 correct/ })
			).not.toBeInTheDocument();
		});

		it("prices each press before it is taken", () => {
			render_({ view: estimating() });

			expect(
				screen.getByRole("button", {
					name: "Estimate 4 correct · pays 128KB if exact",
				})
			).toBeInTheDocument();
		});

		it("marks the committed number as the one standing", () => {
			render_({ view: estimating(4) });

			expect(
				screen.getByRole("button", { name: /^Estimate 4 correct/ })
			).toHaveAttribute("aria-pressed", "true");
			expect(
				screen.getByRole("button", { name: /^Estimate 2 correct/ })
			).toHaveAttribute("aria-pressed", "false");
		});

		it("says an uncommitted gate pays nothing rather than staying quiet", () => {
			render_({ view: estimating() });

			expect(
				screen.getByText(/an uncommitted gate pays nothing/)
			).toBeInTheDocument();
		});

		it("quotes the standing bet and what it pays if it lands", () => {
			render_({ view: estimating(4) });

			expect(
				screen.getByText(/Estimating 4 · pays 128KB if exactly 4 land/)
			).toBeInTheDocument();
		});

		it("commits the number the player pressed", async () => {
			const onEstimate = vi.fn();
			render_({ view: estimating(), onEstimate });

			await userEvent.click(
				screen.getByRole("button", { name: /^Estimate 3 correct/ })
			);

			expect(onEstimate).toHaveBeenCalledWith(3);
		});

		it("shows nothing at all without the config", () => {
			render_();

			expect(
				screen.queryByRole("button", { name: /^Estimate 3 correct/ })
			).not.toBeInTheDocument();
		});
	});
});
