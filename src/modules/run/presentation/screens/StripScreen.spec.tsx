import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { CONFIGS } from "~/modules/run/configs/configRoster.model";
import type { CheckStatus } from "~/modules/run/configs/effect.model";
import { StripScreen } from "./StripScreen.ui";

const checks: CheckStatus[] = [
	{
		label: "Correct",
		progress: "1/2",
		current: 1,
		target: 2,
		state: "failed",
		sourceConfigId: "unit-tests",
	},
	{
		label: "Coverage",
		progress: "2%/4%",
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
