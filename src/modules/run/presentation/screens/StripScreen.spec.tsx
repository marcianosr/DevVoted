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
			screen.getByRole("button", { name: /Unit Tests/ })
		).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /.js/ })).toBeInTheDocument();
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
				configs={[CONFIGS.js, CONFIGS.copilot]}
				checks={checks}
				answered={[]}
				onStrip={onStrip}
			/>
		);
		fireEvent.click(screen.getByRole("button", { name: "Remove Copilot" }));
		expect(onStrip).toHaveBeenCalledWith("copilot");
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
