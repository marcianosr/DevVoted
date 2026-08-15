import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import type { CheckStatus } from "~/modules/run/config/domain/effect.model";
import { StripScreen } from "~/modules/run/gate/presentation/StripScreen.ui";
import { createMockGateStake } from "~/test/runView.factory";

const checks: CheckStatus[] = [
	{
		label: "Correct",
		progress: { kind: "answers", current: 1, target: 2 },
		current: 1,
		target: 2,
		state: "failed",
		sourceConfigId: "unit-tests",
	},
	{
		label: "Coverage",
		progress: { kind: "coverage", current: 2, target: 4 },
		current: 2,
		target: 4,
		state: "success",
		sourceConfigId: "coverage-gain",
	},
];

describe(StripScreen, () => {
	it("tells the player how many configs to peel", () => {
		render(
			<StripScreen
				stripsRemaining={2}
				gateNumber={2}
				configs={[CONFIGS.js, CONFIGS.agentsMd]}
				checks={checks}
				answered={[]}
				onStrip={() => {}}
			/>
		);
		// Named after its gate, like a clear — but the FAIL badge keeps the red.
		expect(
			screen.getByRole("heading", { name: /Cascade gate failed!/ })
		).toBeInTheDocument();
		expect(screen.getByText("FAIL")).toBeInTheDocument();
		expect(
			screen.getByText("Remove 2 configs to continue")
		).toBeInTheDocument();
	});

	it("states the redo's demand and reads its config floor against the build left standing", () => {
		render(
			<StripScreen
				stripsRemaining={1}
				gateNumber={2}
				configs={[CONFIGS.js, CONFIGS.agentsMd]}
				checks={checks}
				answered={[]}
				retryStake={createMockGateStake({
					gateNumber: 2,
					coverageDemand: 24,
					coverageHeld: 20,
					stripsOnFailure: 2,
				})}
				onStrip={() => {}}
			/>
		);
		expect(screen.getByText("Retry")).toBeInTheDocument();
		expect(screen.getByText("20% / 24%")).toHaveClass("text-cinnabar");
		// Two configs against a two-config peel: the redo is already fatal, and
		// the screen says so while the player still chooses what to give up.
		expect(
			screen.getByText(
				"Your pipeline holds 2 configs — missing this gate removes 2 and ends the run."
			)
		).toBeInTheDocument();
	});

	it("keeps the gate's questions off the repair screen", () => {
		render(
			<StripScreen
				stripsRemaining={1}
				gateNumber={2}
				configs={[CONFIGS.js]}
				checks={checks}
				answered={[
					{
						id: "js1",
						question: "typeof null?",
						category: "js",
						outcome: "wrong",
						picked: ['"null"'],
						correct: ['"object"'],
						options: ['"object"', '"null"'],
						answerType: "single",
					},
				]}
				onStrip={() => {}}
			/>
		);
		// The answers belong to /run/review now — this screen asks for one decision
		// and shows only what that decision needs.
		expect(screen.queryByText("typeof null?")).not.toBeInTheDocument();
		expect(screen.queryByText("Review your answers")).not.toBeInTheDocument();
	});

	it("offers every config for removal — Unit Tests included", () => {
		render(
			<StripScreen
				stripsRemaining={1}
				gateNumber={2}
				configs={[CONFIGS.unitTests, CONFIGS.js]}
				checks={checks}
				answered={[]}
				onStrip={() => {}}
			/>
		);
		expect(
			screen.getByRole("button", { name: "Remove Unit Tests" })
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Remove .js" })
		).toBeInTheDocument();
	});

	it("shows which check broke the gate as a failed row", () => {
		render(
			<StripScreen
				stripsRemaining={1}
				gateNumber={2}
				configs={[CONFIGS.unitTests, CONFIGS.js]}
				checks={checks}
				answered={[]}
				onStrip={() => {}}
			/>
		);
		// The failed Unit Tests check surfaces its unmet progress in the report.
		expect(screen.getByText("1/2")).toBeInTheDocument();
	});

	it("peels the chosen config via its remove button", () => {
		const onStrip = vi.fn();
		render(
			<StripScreen
				stripsRemaining={1}
				gateNumber={2}
				configs={[CONFIGS.js, CONFIGS.agentsMd]}
				checks={checks}
				answered={[]}
				onStrip={onStrip}
			/>
		);
		fireEvent.click(screen.getByRole("button", { name: "Remove AGENTS.md" }));
		expect(onStrip).toHaveBeenCalledWith("agents-md");
	});

	it("offers no removal once the quota is met — rows only expand", () => {
		const onStrip = vi.fn();
		render(
			<StripScreen
				stripsRemaining={0}
				gateNumber={2}
				configs={[CONFIGS.js]}
				checks={checks}
				answered={[]}
				onStrip={onStrip}
			/>
		);
		expect(
			screen.queryByRole("button", { name: /Remove/ })
		).not.toBeInTheDocument();
		// A row tap folds detail open, never strips.
		fireEvent.click(screen.getByRole("button", { name: /^\.js/ }));
		expect(onStrip).not.toHaveBeenCalled();
	});
});
