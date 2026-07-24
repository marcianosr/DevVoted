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
				configs={[CONFIGS.js, CONFIGS.copilot]}
				checks={checks}
				answered={[]}
				onStrip={() => {}}
			/>
		);
		expect(screen.getByText("Gate 2 failed!")).toBeInTheDocument();
		expect(
			screen.getByText("Remove 2 configs to continue")
		).toBeInTheDocument();
	});

	it("collapses the answers behind a review bar", () => {
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
		expect(screen.queryByText("typeof null?")).not.toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: /Review answers/ }));
		expect(screen.getByText("typeof null?")).toBeInTheDocument();
	});

	it("names the fixed config that can't be removed", () => {
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
		expect(screen.getByText(/Unit Tests can't be removed/)).toBeInTheDocument();
		// The fixed config never gets a Remove chip.
		expect(
			screen.queryByRole("button", { name: /Unit Tests/ })
		).not.toBeInTheDocument();
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

	it("peels the chosen config", () => {
		const onStrip = vi.fn();
		render(
			<StripScreen
				stripsRemaining={1}
				gateNumber={2}
				configs={[CONFIGS.js, CONFIGS.copilot]}
				checks={checks}
				answered={[]}
				onStrip={onStrip}
			/>
		);
		// Click on the copilot row to remove it
		const copilotRows = screen.getAllByRole("button");
		const copilotRow = copilotRows.find((button) =>
			button.textContent?.includes("Copilot")
		);
		fireEvent.click(copilotRow!);
		expect(onStrip).toHaveBeenCalledWith("copilot");
	});

	it("locks the peel chips once the quota is met", () => {
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
		// When stripsRemaining is 0, rows are not clickable (no role="button")
		const pipelineRows = screen.queryAllByRole("button");
		expect(pipelineRows).toHaveLength(0);
	});
});
