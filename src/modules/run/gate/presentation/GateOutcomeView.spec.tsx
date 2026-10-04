import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import type { AnsweredPoll } from "~/modules/run/run/domain/runPoll.model";
import type { GateCloseView } from "~/modules/run/run/application/gateClose.viewmodel";
import type { RunStatus } from "~/modules/run/run/domain/run.model";
import {
	createMockGateClose,
	createMockGatePayout,
	createMockGateStake,
	createMockRunView,
} from "~/test/runView.factory";
import { COVERAGE_BAND_COLOR } from "~/ui/kanto-theme/CoverageBar.ui";

import { toRunView } from "~/modules/run/run/application/runView.viewmodel";
import { clearGate, started } from "~/modules/run/run/domain/run.factory";

import { GateOutcomeView } from "./GateOutcomeView.component";

const answer = (
	overrides: Partial<AnsweredPoll> & Pick<AnsweredPoll, "id" | "category">
): AnsweredPoll => ({
	question: `question ${overrides.id}`,
	outcome: "correct",
	picked: ["A"],
	correct: ["A"],
	options: ["A", "B"],
	coverageEarned: 1,
	...overrides,
});

const answered: readonly AnsweredPoll[] = [
	answer({ id: "a", category: "js" }),
	answer({ id: "b", category: "ts" }),
	answer({ id: "c", category: "css", outcome: "wrong", coverageEarned: 0 }),
];

const GATE_4_LADDER = { floor: 5, ok: 15, healthy: 25 };
const PEEL_SLOTS_OWED = 1;

type Verdict = "cleared" | "held" | "fatal" | "won";

const STATUS_OF = {
	cleared: "rewarding",
	won: "won",
	held: "awaiting-strip",
	fatal: "dead",
} satisfies Record<Verdict, RunStatus>;

const CLOSE_OF = {
	cleared: { closing: "cleared", cleared: true, band: "healthy", held: 30 },
	won: { closing: "cleared", cleared: true, band: "healthy", held: 30 },
	held: {
		closing: "held",
		cleared: false,
		band: "shaky",
		held: 10,
		heldBy: "band",
	},
	fatal: { closing: "fatal", cleared: false, band: "danger", held: 2 },
} satisfies Record<Verdict, Partial<GateCloseView>>;

const closeAt = (verdict: Verdict, over: Partial<GateCloseView> = {}) =>
	createMockGateClose({
		gate: 4,
		ladder: GATE_4_LADDER,
		...CLOSE_OF[verdict],
		...over,
	});

const viewAt = (
	verdict: Verdict,
	overrides: Parameters<typeof createMockRunView>[0] = {}
) =>
	createMockRunView({
		status: STATUS_OF[verdict],
		answeredThisGate: answered,
		configs: [CONFIGS.js, CONFIGS.unitTests],
		gatesCleared: 4,
		storage: 640,
		peelSlotsRemaining: verdict === "held" ? PEEL_SLOTS_OWED : 0,
		gateStake: createMockGateStake({
			gateNumber: 4,
			coverageLadder: GATE_4_LADDER,
			coverageHeld: verdict === "cleared" || verdict === "won" ? 30 : 10,
		}),
		lastClose: closeAt(verdict),
		gatePayout: createMockGatePayout({
			clearedGateNumber: 4,
			gateRewardPaidKb: 256,
			storageBeforeClearKb: 384,
		}),
		...overrides,
	});

const renderAt = (verdict: Verdict, props = {}) =>
	render(
		<GateOutcomeView
			view={viewAt(verdict)}
			onReview={() => {}}
			onNext={() => {}}
			{...props}
		/>
	);

describe("GateOutcomeView", () => {
	it("keeps a window-held gate's HEALTHY reading and says why it held", () => {
		render(
			<GateOutcomeView
				view={viewAt("held", {
					answeredThisGate: [
						answer({ id: "a", category: "js" }),
						answer({ id: "b", category: "ts", outcome: "wrong" }),
						answer({ id: "c", category: "css", outcome: "wrong" }),
					],
					gateStake: createMockGateStake({
						gateNumber: 4,
						coverageLadder: GATE_4_LADDER,
						coverageHeld: 30,
					}),
					lastClose: closeAt("held", {
						heldBy: "unscored",
						band: "healthy",
						held: 30,
					}),
				})}
				onReview={() => {}}
				onNext={() => {}}
				onRemove={() => {}}
			/>
		);

		expect(
			screen.getByRole("heading", { name: "Lavender holds" })
		).toBeInTheDocument();
		expect(
			screen.getByLabelText("30% of 25% needed \u00b7 HEALTHY")
		).toBeInTheDocument();
		expect(
			screen.getByText(/the window came up short · 5 fresh polls on the retry/)
		).toBeInTheDocument();
	});

	it("reports a cleared gate as cleared, not as a hold", () => {
		renderAt("cleared");

		expect(screen.queryByText(/Run over/)).not.toBeInTheDocument();
		expect(
			screen.queryByRole("heading", { name: /to retry/ })
		).not.toBeInTheDocument();
	});

	it("offers a held gate storage as the first way to pay its peel", () => {
		renderAt("held", { onRemove: () => {} });

		expect(
			screen.getByRole("heading", { level: 3, name: /to retry/ })
		).toHaveTextContent("Pay 16 KB to retry");
		expect(
			screen.getByRole("radio", { name: "Pay the peel from storage" })
		).toBeChecked();
	});

	it("pays the peel from storage, dropping nothing", async () => {
		const onRemove = vi.fn();
		renderAt("held", { onRemove });

		await userEvent.click(
			screen.getByRole("button", { name: /^Pay from storage/ })
		);

		expect(onRemove).toHaveBeenCalledWith([], true);
	});

	it("pays the peel with the one config picked instead", async () => {
		const onRemove = vi.fn();
		renderAt("held", { onRemove });

		await userEvent.click(
			screen.getByRole("radio", { name: `Drop ${CONFIGS.js.label}` })
		);
		await userEvent.click(
			screen.getByRole("button", {
				name: new RegExp(`^Drop ${CONFIGS.js.label}`),
			})
		);

		expect(onRemove).toHaveBeenCalledWith([CONFIGS.js.id], false);
	});

	it("ends the run from the refusal arm of a held gate", async () => {
		const onRefuse = vi.fn();
		renderAt("held", { onRemove: () => {}, onRefuse });

		await userEvent.click(screen.getByRole("button", { name: "End the run" }));
		expect(onRefuse).toHaveBeenCalled();
	});

	it("ends the run on a fatal miss and wears the danger colour", () => {
		const { container } = renderAt("fatal");

		expect(screen.getByText(/Run over/)).toBeInTheDocument();
		expect(container.firstElementChild).toHaveAttribute(
			"data-screen-theme",
			COVERAGE_BAND_COLOR.danger
		);
	});

	it("closes a won run without pointing at a gate that never comes", () => {
		renderAt("won");

		expect(
			screen.getByRole("heading", { name: "The climb is done" })
		).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /^Retry gate/ })
		).not.toBeInTheDocument();
	});

	it("never shows a perfect bonus the engine did not pay", () => {
		render(
			<GateOutcomeView
				view={viewAt("cleared", {
					lastClose: closeAt("cleared", {
						ladder: { floor: 0, ok: 0, healthy: 60 },
						held: 200,
						band: "perfect",
					}),
				})}
				onReview={() => {}}
				onNext={() => {}}
			/>
		);

		expect(
			screen.queryByRole("heading", { name: "Perfect bonus" })
		).not.toBeInTheDocument();
	});

	it("reads a cleared gate off the settled run coverage, not a sum of units", () => {
		renderAt("cleared");

		expect(
			screen.getByLabelText("30% of 25% needed \u00b7 HEALTHY")
		).toBeInTheDocument();
	});

	it("bands a flawless opening gate PERFECT rather than on its healthy line", () => {
		render(
			<GateOutcomeView
				view={viewAt("cleared", {
					lastClose: closeAt("cleared", {
						gate: 0,
						ladder: { floor: 0, ok: 40, healthy: 60 },
						held: 100,
						band: "perfect",
					}),
				})}
				onReview={() => {}}
				onNext={() => {}}
			/>
		);

		expect(
			screen.getByLabelText("100% of 60% needed \u00b7 PERFECT")
		).toBeInTheDocument();
	});

	it("states the gate's earn as a share of the window, not as raw units", () => {
		renderAt("cleared");

		expect(screen.getAllByText("+28.6%").length).toBeGreaterThan(0);
		expect(screen.queryByText("+2%")).not.toBeInTheDocument();
	});

	it("renders a real flawless opening gate as a full window", () => {
		render(
			<GateOutcomeView
				view={toRunView(clearGate(started([])))}
				onReview={() => {}}
				onNext={() => {}}
			/>
		);

		expect(
			screen.getByLabelText("100% of 64% needed \u00b7 PERFECT")
		).toBeInTheDocument();
		expect(
			screen.queryByLabelText(/^64% of 64% needed/)
		).not.toBeInTheDocument();
	});

	it("lists what a single and a multiple choice are worth at the next gate, so the re-base is no surprise", () => {
		render(
			<GateOutcomeView
				view={toRunView(clearGate(started([])))}
				onReview={() => {}}
				onNext={() => {}}
			/>
		);

		const list = screen.getByText("At Pewter").nextElementSibling;

		expect(list).toHaveTextContent("single choice+20%");
		expect(list).toHaveTextContent("multiple choice+40%");
	});

	it("points at no gate beyond the summit", () => {
		renderAt("won");

		expect(screen.queryByText(/single choice/)).not.toBeInTheDocument();
	});

	it("keeps quiet about the next gate on a gate that did not clear", () => {
		renderAt("held", { onRemove: () => {} });

		expect(screen.queryByText(/single choice/)).not.toBeInTheDocument();
	});

	it("opens the answer review from the panel", async () => {
		const onReview = vi.fn();
		renderAt("cleared", { onReview });

		await userEvent.click(
			screen.getByRole("button", { name: /Review answers/ })
		);
		expect(onReview).toHaveBeenCalled();
	});

	it("carries the run on from the footer", async () => {
		const onNext = vi.fn();
		renderAt("cleared", { onNext });

		await userEvent.click(screen.getByRole("button", { name: /To the shop/ }));
		expect(onNext).toHaveBeenCalled();
	});
});

describe("rivals' audits at the close (ADR-099)", () => {
	it("itemises what surviving a rival's incidents paid", () => {
		render(
			<GateOutcomeView
				view={viewAt("cleared", {
					gatePayout: createMockGatePayout({
						clearedGateNumber: 4,
						gateRewardPaidKb: 256,
						storageBeforeClearKb: 384,
						clearThisGateKb: 192,
						incidentSurvivalKb: 64,
					}),
				})}
				onReview={() => {}}
				onNext={() => {}}
			/>
		);

		expect(screen.getByText("Audits survived")).toBeInTheDocument();
		expect(screen.queryByText("audit earned")).not.toBeInTheDocument();
	});
});

describe("the audits a closed gate names", () => {
	it("names the audit the gate just ran, never the one waiting at the next gate", () => {
		render(
			<GateOutcomeView
				view={viewAt("cleared", {
					lastClose: closeAt("cleared", { auditIds: ["legal-hold"] }),
					gateStake: createMockGateStake({
						gateNumber: 5,
						audits: [
							{
								id: "memory-leak",
								code: 507,
								name: "Insufficient Storage",
								description: "Storage leaks every poll.",
								suppressed: false,
							},
						],
					}),
				})}
				onReview={() => {}}
				onNext={() => {}}
			/>
		);

		expect(screen.getAllByText(/451/).length).toBeGreaterThan(0);
		expect(screen.queryByText(/507/)).not.toBeInTheDocument();
	});
});

describe("GateOutcomeView's outcome reveal", () => {
	beforeEach(() => {
		window.sessionStorage.clear();
	});

	it("plays the reveal over the screen when a gate has just closed", () => {
		renderAt("cleared");

		expect(screen.getByRole("dialog")).toBeInTheDocument();
	});

	it("does not replay the reveal for the same close after a remount", () => {
		renderAt("cleared").unmount();
		renderAt("cleared");

		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});

	it("skips to the final frame on the first press and dismisses on the second", async () => {
		const user = userEvent.setup();
		renderAt("fatal");

		await user.click(screen.getByRole("button", { name: "Skip" }));
		await user.click(screen.getByRole("button", { name: "Continue" }));

		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});

	it("dismisses on Escape once the reveal has reached its final frame", async () => {
		const user = userEvent.setup();
		renderAt("held");

		await user.keyboard("{Escape}");
		await user.keyboard("{Escape}");

		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});
});
