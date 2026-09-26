import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { kantoAttackPanel } from "~/test/kantoIncidents.factory";
import { createMockGateStake, createMockRunView } from "~/test/runView.factory";

import { PrepView } from "./PrepView.component";

const view = createMockRunView({
	configs: [CONFIGS.js, CONFIGS.unitTests],
	storage: 640,
	gatesCleared: 4,
	upcomingCategories: ["ts", "ts", "js", "css", "git"],
	nextGateCategories: ["git", "git", "js", "js", "ts"],
	answerTypesThisGate: { single: 4, multiple: 1 },
	optionCountsThisGate: [3, 4, 4, 5, 3],
	gateStake: createMockGateStake({
		gateNumber: 4,
		coverageLadder: { floor: 0, ok: 0, healthy: 60 },
	}),
});

const props = { view, onStart: () => {}, onBackToShop: () => {} };

describe("PrepView", () => {
	it("titles the window with the gate it is about to run", () => {
		render(<PrepView {...props} />);

		expect(screen.getByText("#4 - Lavender Gate")).toBeInTheDocument();
	});

	it("opens on what each band pays rather than on the build", () => {
		render(<PrepView {...props} />);

		expect(
			screen.getByRole("heading", { name: "Objectives and rewards" })
		).toBeInTheDocument();
	});

	describe("a ladder with every rung on it", () => {
		const laddered = createMockRunView({
			...view,
			gateStake: createMockGateStake({
				gateNumber: 4,
				coverageLadder: { floor: 20, ok: 40, healthy: 60 },
			}),
		});

		it("bills the holding band a peel drawn from the gate's own stake", () => {
			render(<PrepView {...props} view={laddered} />);

			expect(screen.getByText(/peel$/)).toHaveTextContent(/^−\d/);
		});

		it("ends the run under the floor rather than quoting it a payout", () => {
			render(<PrepView {...props} view={laddered} />);

			expect(screen.getByText("the run ends")).toBeInTheDocument();
		});
	});

	describe("the two configs that act in prep", () => {
		it("draws no picker and no list while neither config is installed", () => {
			render(<PrepView {...props} />);

			expect(screen.queryByText(/at least 3 of 5/)).toBeNull();
			expect(screen.queryByText("pick")).toBeNull();
		});

		it("offers Planning Poker's cards and sends the one pressed", async () => {
			const onEstimate = vi.fn();
			const betting = createMockRunView({
				...view,
				estimate: {
					configLabel: "Planning Poker",
					choices: [1, 2, 3, 4, 5].map((count) => ({
						count,
						units: count * 1.25,
					})),
				},
			});
			render(<PrepView {...props} view={betting} onEstimate={onEstimate} />);

			expect(screen.getByText("at least 3 of 5")).toBeInTheDocument();
			await userEvent.click(screen.getByRole("button", { name: "3" }));

			expect(onEstimate).toHaveBeenCalledWith(3);
		});

		it("lists the gate for git rebase -i and sends the move pressed", async () => {
			const onRebase = vi.fn();
			const reordering = createMockRunView({
				...view,
				configs: [CONFIGS.gitRebase],
				rebaseSlots: [
					{ id: "poll-0", category: "ts" },
					{ id: "poll-1", category: "css" },
				],
			});
			render(<PrepView {...props} view={reordering} onRebase={onRebase} />);

			expect(screen.getAllByText("pick")).toHaveLength(2);
			await userEvent.click(
				screen.getByRole("button", { name: "Move CSS earlier" })
			);

			expect(onRebase).toHaveBeenCalledWith(1, 0);
		});
	});

	it("seals the poll details while no prefetcher is installed", () => {
		render(<PrepView {...props} />);

		expect(screen.getByText("answer types")).toBeInTheDocument();
		expect(screen.getByText("options each")).toBeInTheDocument();
	});

	it("starts the gate from the footer", async () => {
		const onStart = vi.fn();
		render(<PrepView {...props} onStart={onStart} />);

		await userEvent.click(screen.getByRole("button", { name: /^Start/ }));
		expect(onStart).toHaveBeenCalled();
	});

	it("refuses the start when the run has no polls left", () => {
		render(
			<PrepView
				{...props}
				view={createMockRunView({ ...view, pollsExhausted: true })}
			/>
		);

		expect(screen.getByRole("button", { name: /^Start/ })).toBeDisabled();
	});

	it("goes back to the shop from the footer aside", async () => {
		const onBackToShop = vi.fn();
		render(<PrepView {...props} onBackToShop={onBackToShop} />);

		await userEvent.click(
			screen.getByRole("button", { name: /Back to the shop/ })
		);
		expect(onBackToShop).toHaveBeenCalled();
	});
});

describe("rivals' audits and the attack in hand (ADR-099)", () => {
	it("names the rival who fired an incoming audit", () => {
		render(
			<PrepView
				{...props}
				view={createMockRunView({
					...view,
					gateStake: createMockGateStake({
						gateNumber: 4,
						coverageLadder: { floor: 0, ok: 0, healthy: 60 },
						audits: [
							{
								id: "not-found",
								code: 404,
								name: "Not Found",
								description: "No poll names its category.",
								suppressed: false,
								sentBy: { id: "misty", name: "Misty" },
							},
						],
					}),
				})}
			/>
		);

		expect(screen.getByText("from")).toBeInTheDocument();
		expect(screen.getByText("Misty")).toBeInTheDocument();
	});

	it("fires the pressed payload once its rival is open", async () => {
		const onFire = vi.fn();
		render(<PrepView {...props} attack={kantoAttackPanel()} onFire={onFire} />);

		await userEvent.click(
			screen.getByRole("button", { name: "inspect Misty" })
		);
		await userEvent.click(
			screen.getByRole("button", { name: "Fire 404 at Misty" })
		);

		expect(onFire).toHaveBeenCalledWith(2, "not-found");
	});

	it("answers an audit by opening the row of whoever sent it", async () => {
		render(
			<PrepView
				{...props}
				attack={kantoAttackPanel()}
				view={createMockRunView({
					...view,
					gateStake: createMockGateStake({
						gateNumber: 4,
						coverageLadder: { floor: 0, ok: 0, healthy: 60 },
						audits: [
							{
								id: "not-found",
								code: 404,
								name: "Not Found",
								description: "No poll names its category.",
								suppressed: false,
								sentBy: { id: "misty", name: "Misty" },
							},
						],
					}),
				})}
			/>
		);

		await userEvent.click(screen.getByRole("button", { name: "respond" }));

		expect(
			screen.getByRole("button", { name: "Fire 404 at Misty" })
		).toBeInTheDocument();
	});

	it("refuses to answer a sender who is not a target you were offered", () => {
		render(
			<PrepView
				{...props}
				attack={kantoAttackPanel()}
				view={createMockRunView({
					...view,
					gateStake: createMockGateStake({
						gateNumber: 4,
						coverageLadder: { floor: 0, ok: 0, healthy: 60 },
						audits: [
							{
								id: "not-found",
								code: 404,
								name: "Not Found",
								description: "No poll names its category.",
								suppressed: false,
								sentBy: { id: "koga", name: "Koga" },
							},
						],
					}),
				})}
			/>
		);

		expect(
			screen.getByRole("button", {
				name: "Koga is not a target you were offered",
			})
		).toBeDisabled();
	});

	it("sends nobody to an incident log of its own: the board carries it now", () => {
		render(<PrepView {...props} />);

		expect(
			screen.queryByRole("button", { name: /Incidents/ })
		).not.toBeInTheDocument();
	});
});

describe("a prep-time config holding the gate", () => {
	const betOwed = createMockRunView({
		...view,
		estimate: {
			configLabel: "Planning Poker",
			choices: [
				{ count: 1, units: 0.25 },
				{ count: 2, units: 0.5 },
			],
		},
		estimatedCorrect: null,
	});

	const startPress = () => screen.getByRole("button", { name: /^Start/ });

	it("holds the start and names the config still waiting", () => {
		render(<PrepView {...props} view={betOwed} />);

		expect(startPress()).toBeDisabled();
		expect(screen.getByText(/Planning Poker has no bet/)).toBeInTheDocument();
	});

	it("frees the start once the bet is on the record", () => {
		render(
			<PrepView
				{...props}
				view={createMockRunView({ ...betOwed, estimatedCorrect: 2 })}
			/>
		);

		expect(startPress()).toBeEnabled();
	});

	it("names both configs when both are still waiting", () => {
		render(
			<PrepView
				{...props}
				view={createMockRunView({
					...betOwed,
					sla: {
						configLabel: "SLA",
						choices: [{ band: "ok", label: "OK", uplift: 0.1 }],
					},
					slaBand: null,
				})}
			/>
		);

		expect(screen.getByText(/Planning Poker has no bet/)).toBeInTheDocument();
		expect(screen.getByText(/SLA has no promise/)).toBeInTheDocument();
	});

	it("states the wait for tomorrow's polls ahead of the call it could take now", () => {
		render(
			<PrepView {...props} view={betOwed} startRefusal="Next polls at 09:00" />
		);

		expect(screen.getByText("Next polls at 09:00")).toBeInTheDocument();
		expect(screen.queryByText(/Planning Poker has no bet/)).toBeNull();
	});

	it("states the vendor's unnamed target ahead of the call", () => {
		render(
			<PrepView
				{...props}
				view={createMockRunView({
					...betOwed,
					vendorLock: { offered: true },
				})}
			/>
		);

		expect(startPress()).toBeDisabled();
		expect(screen.getByText(/vendor lock-in names nobody/)).toBeInTheDocument();
		expect(screen.queryByText(/Planning Poker has no bet/)).toBeNull();
	});
});
