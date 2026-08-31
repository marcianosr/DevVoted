import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { StripScreen } from "~/modules/run/gate/presentation/StripScreen.ui";
import { createMockGateStake } from "~/test/runView.factory";

describe(StripScreen, () => {
	it("tells the player how many configs to peel", () => {
		render(
			<StripScreen
				peelSlotsRemaining={2}
				gateNumber={2}
				configs={[CONFIGS.js, CONFIGS.agentsMd]}
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

	it("states the redo's demand against the attempt's own meter", () => {
		render(
			<StripScreen
				peelSlotsRemaining={1}
				gateNumber={2}
				configs={[CONFIGS.js, CONFIGS.agentsMd]}
				answered={[]}
				retryStake={createMockGateStake({
					gateNumber: 2,
					coverageDemand: 25,
					coverageHeld: 20,
				})}
				onStrip={() => {}}
			/>
		);
		expect(screen.getByText("Retry")).toBeInTheDocument();
		expect(screen.getByText("20% / 25%")).toHaveClass("text-cinnabar");
	});

	it("keeps the gate's questions off the repair screen", () => {
		render(
			<StripScreen
				peelSlotsRemaining={1}
				gateNumber={2}
				configs={[CONFIGS.js]}
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
				peelSlotsRemaining={1}
				gateNumber={2}
				configs={[CONFIGS.unitTests, CONFIGS.js]}
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

	it("peels the chosen config via its remove button", () => {
		const onStrip = vi.fn();
		render(
			<StripScreen
				peelSlotsRemaining={1}
				gateNumber={2}
				configs={[CONFIGS.js, CONFIGS.agentsMd]}
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
				peelSlotsRemaining={0}
				gateNumber={2}
				configs={[CONFIGS.js]}
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
