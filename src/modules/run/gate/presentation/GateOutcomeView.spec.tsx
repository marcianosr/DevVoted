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

import { GateOutcomeView, type GateVerdict } from "./GateOutcomeView.component";

const answer = (
	overrides: Partial<AnsweredPoll> & Pick<AnsweredPoll, "id" | "category">
): AnsweredPoll => ({
	question: `question ${overrides.id}`,
	outcome: "correct",
	picked: ["A"],
	correct: ["A"],
	options: ["A", "B"],
	coverageEarned: 12,
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
					gateStake: createMockGateStake({
						gateNumber: 4,
						coverageLadder: { floor: 0, ok: 0, healthy: 60 },
						coverageHeld: 200,
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
