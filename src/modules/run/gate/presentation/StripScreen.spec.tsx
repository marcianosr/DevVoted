import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { StripScreen } from "~/modules/run/gate/presentation/StripScreen.ui";
import { createMockGateStake } from "~/test/runView.factory";

describe(StripScreen, () => {
	it("tells the player how many slots to free — the debt is slots", () => {
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
		// The subtitle badges its numbers, so the text is split across spans.
		expect(
			screen.getByText(
				(_, element) => element?.textContent === "Free up 2 slots to continue"
			)
		).toBeTruthy();
	});

	// A waived peel (ADR-057) must say so: hiding the banner leaves the screen
	// silent about why nothing is removable.
	it("says the Pallet gate took nothing, rather than showing an empty list", () => {
		render(
			<StripScreen
				peelSlotsRemaining={0}
				peelWaived
				gateNumber={0}
				configs={[CONFIGS.js, CONFIGS.agentsMd]}
				answered={[]}
				onStrip={() => {}}
			/>
		);

		expect(screen.getByText(/This gate takes nothing/)).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /Remove/ })
		).not.toBeInTheDocument();
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

	it("quotes what dropping each config pays while a collector is installed", () => {
		render(
			<StripScreen
				peelSlotsRemaining={8}
				gateNumber={2}
				configs={[CONFIGS.garbageCollection, CONFIGS.agentsMd, CONFIGS.js]}
				answered={[]}
				onStrip={() => {}}
			/>
		);
		expect(screen.getByText("+128KB")).toBeInTheDocument();
		expect(screen.getByText("+16KB")).toBeInTheDocument();
	});

	it("quotes no price on a build with no collector", () => {
		render(
			<StripScreen
				peelSlotsRemaining={8}
				gateNumber={2}
				configs={[CONFIGS.agentsMd, CONFIGS.js]}
				answered={[]}
				onStrip={() => {}}
			/>
		);
		expect(screen.queryByText(/^\+\d+KB$/)).not.toBeInTheDocument();
	});

	it("shows the collector what the peel has recovered so far", () => {
		render(
			<StripScreen
				peelSlotsRemaining={1}
				gateNumber={2}
				configs={[CONFIGS.garbageCollection, CONFIGS.js]}
				answered={[]}
				peelRefundKb={128}
				onStrip={() => {}}
			/>
		);
		expect(screen.getByText("+128KB")).toBeInTheDocument();
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
