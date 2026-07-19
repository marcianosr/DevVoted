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
		expect(
			screen.getByRole("heading", { name: /Gate failed/ })
		).toBeInTheDocument();
		expect(
			screen.getByRole("heading", { name: /Remove 2 configs to continue/ })
		).toBeInTheDocument();
		expect(
			screen.getByText(
				"This is the only thing standing between you and gate 2."
			)
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

	it("shows which check broke the gate", () => {
		render(
			<StripScreen
				stripsRemaining={1}
				gateNumber={2}
				configs={[CONFIGS.js]}
				checks={checks}
				answered={[]}
				onStrip={() => {}}
			/>
		);
		expect(screen.getByText("Correct")).toBeInTheDocument();
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
		fireEvent.click(screen.getByRole("button", { name: /Copilot/ }));
		expect(onStrip).toHaveBeenCalledWith("copilot");
	});

	it("locks the peel chips once the quota is met", () => {
		render(
			<StripScreen
				stripsRemaining={0}
				gateNumber={2}
				configs={[CONFIGS.js]}
				checks={checks}
				answered={[]}
				onStrip={() => {}}
			/>
		);
		expect(screen.getByRole("button", { name: /Remove/ })).toBeDisabled();
	});
});
