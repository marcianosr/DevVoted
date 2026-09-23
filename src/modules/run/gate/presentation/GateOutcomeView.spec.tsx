import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import type { AnsweredPoll } from "~/modules/run/run/domain/runPoll.model";
import {
	createMockGatePayout,
	createMockGateStake,
	createMockRunView,
} from "~/test/runView.factory";
import { COVERAGE_BAND_COLOR } from "~/ui/kanto-theme/CoverageBar.ui";

import { toRunView } from "~/modules/run/run/application/runView.viewmodel";
import { clearGate, started } from "~/modules/run/run/domain/run.factory";

import { GateOutcomeView, type GateVerdict } from "./GateOutcomeView.component";

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

const viewAt = (
	verdict: GateVerdict,
	overrides: Parameters<typeof createMockRunView>[0] = {}
) =>
	createMockRunView({
		answeredThisGate: answered,
		configs: [CONFIGS.js, CONFIGS.unitTests],
		gatesCleared: 4,
		storage: 640,
		gateStake: createMockGateStake({
			gateNumber: 4,
			coverageLadder: GATE_4_LADDER,
			coverageHeld: verdict === "cleared" || verdict === "won" ? 30 : 10,
		}),
		gatePayout: createMockGatePayout({
			clearedGateNumber: 4,
			clearedGateLadder: GATE_4_LADDER,
			clearedCoverageHeld: 30,
			gateRewardPaidKb: 256,
			storageBeforeClearKb: 384,
		}),
		...overrides,
	});

const renderAt = (verdict: GateVerdict, props = {}) =>
	render(
		<GateOutcomeView
			view={viewAt(verdict)}
			verdict={verdict}
			onReview={() => {}}
			onNext={() => {}}
			{...props}
		/>
	);

describe("GateOutcomeView", () => {
	it("keeps a floor-held gate's HEALTHY reading and says why it held", () => {
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
					gatePayout: createMockGatePayout({ heldBy: "floor" }),
				})}
				verdict="held"
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
		expect(screen.getByText(/1 of 5 right, 2 needed/)).toBeInTheDocument();
	});

	it("reports a cleared gate as cleared, not as a hold", () => {
		renderAt("cleared");

		expect(screen.queryByText(/Run over/)).not.toBeInTheDocument();
		expect(
			screen.queryByRole("heading", { name: /How this gate ends/ })
		).not.toBeInTheDocument();
	});

	it("asks a held gate to pay its peel before the retry opens", () => {
		renderAt("held", { onRemove: () => {} });

		expect(
			screen.getByRole("heading", { name: /How this gate ends/ })
		).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /^Retry gate/ })).toBeDisabled();
	});

	it("pays the peel in dropped configs, which opens the retry", async () => {
		const onRemove = vi.fn();
		renderAt("held", { onRemove });

		const drops = screen.getAllByRole("button", { name: /drop/i });
		for (const drop of drops) await userEvent.click(drop);

		const retry = screen.getByRole("button", { name: /^Retry gate/ });
		expect(retry).toBeEnabled();

		await userEvent.click(retry);
		expect(onRemove).toHaveBeenCalled();
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
					gatePayout: createMockGatePayout({
						clearedGateNumber: 4,
						clearedGateLadder: { floor: 0, ok: 0, healthy: 60 },
						clearedCoverageHeld: 200,
					}),
				})}
				verdict="cleared"
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
					gatePayout: createMockGatePayout({
						clearedGateNumber: 0,
						clearedGateLadder: { floor: 0, ok: 40, healthy: 60 },
						clearedCoverageHeld: 100,
					}),
				})}
				verdict="cleared"
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

		expect(screen.getAllByText("+8%").length).toBeGreaterThan(0);
		expect(screen.queryByText("+2%")).not.toBeInTheDocument();
	});

	it("renders a real flawless opening gate as a full window", () => {
		render(
			<GateOutcomeView
				view={toRunView(clearGate(started([])))}
				verdict="cleared"
				onReview={() => {}}
				onNext={() => {}}
			/>
		);

		expect(
			screen.getByLabelText("100% of 60% needed \u00b7 PERFECT")
		).toBeInTheDocument();
		expect(
			screen.queryByLabelText(/^60% of 60% needed/)
		).not.toBeInTheDocument();
	});

	it("names the slots the next gate scores out of, so the re-base is no surprise", () => {
		render(
			<GateOutcomeView
				view={toRunView(clearGate(started([])))}
				verdict="cleared"
				onReview={() => {}}
				onNext={() => {}}
			/>
		);

		expect(
			screen.getByText("Boulder scores out of 10 slots.")
		).toBeInTheDocument();
	});

	it("points at no gate beyond the summit", () => {
		renderAt("won");

		expect(screen.queryByText(/scores out of/)).not.toBeInTheDocument();
	});

	it("keeps quiet about the next gate on a gate that did not clear", () => {
		renderAt("held", { onRemove: () => {} });

		expect(screen.queryByText(/scores out of/)).not.toBeInTheDocument();
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
	it("itemises what surviving them paid and chips the attack the clear armed", () => {
		render(
			<GateOutcomeView
				view={viewAt("cleared", {
					gatePayout: createMockGatePayout({
						clearedGateNumber: 4,
						clearedGateLadder: GATE_4_LADDER,
						clearedCoverageHeld: 30,
						gateRewardPaidKb: 256,
						storageBeforeClearKb: 384,
						clearThisGateKb: 192,
						incidentSurvivalKb: 64,
						attackEarned: true,
					}),
				})}
				verdict="cleared"
				onReview={() => {}}
				onNext={() => {}}
			/>
		);

		expect(screen.getByText("audits survived")).toBeInTheDocument();
		expect(screen.getByText("attack earned")).toBeInTheDocument();
	});
});
