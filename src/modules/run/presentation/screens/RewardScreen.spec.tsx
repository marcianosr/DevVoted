import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import type { AnsweredPoll } from "~/modules/run/climb/run.model";
import { CONFIGS } from "~/modules/run/configs/configRoster.model";
import { RewardScreen } from "./RewardScreen.ui";

const answered: AnsweredPoll[] = [
	{
		id: "js1",
		question: "typeof null?",
		category: "js",
		outcome: "correct",
		picked: ['"object"'],
	},
	{
		id: "js2",
		question: "at(-1)?",
		category: "js",
		outcome: "wrong",
		picked: ["pop()"],
	},
];

const base = {
	clearedGate: 1,
	gateReward: 80,
	coverageGainedByCategory: { js: 8, css: 3.5 },
	answered,
	passedChecks: [
		{
			label: "Correct",
			progress: "2/2",
			current: 2,
			target: 2,
			state: "success" as const,
			sourceConfigId: "unit-tests",
		},
	],
	configs: [CONFIGS.unitTests],
};

describe(RewardScreen, () => {
	it("shows the cleared gate, the reward report, and the answer results", () => {
		render(<RewardScreen {...base} />);
		// The report headlines success and names the gate.
		expect(screen.getByText(/Gate 1 cleared!/)).toBeInTheDocument();
		// Unit Tests pays its flat clear payout in its row.
		expect(screen.getByText("+32KB")).toBeInTheDocument();
		// The totals footer frames the sums as the gate's winnings.
		expect(screen.getByText(/you won/)).toBeInTheDocument();
		// Every answered question lists as a row right away.
		expect(screen.getByText("typeof null?")).toBeInTheDocument();
		expect(screen.getByText("1 of 2 correct")).toBeInTheDocument();
		// Coverage badges name each category the gate's polls came from.
		expect(screen.getByText("JavaScript")).toBeInTheDocument();
		expect(screen.getByText("+8%")).toBeInTheDocument();
		expect(screen.getByText("+3.5%")).toBeInTheDocument();
	});

	it("names the swatches the run has collected", () => {
		render(<RewardScreen {...base} slots={5} />);
		expect(screen.getByText("Swatches collected")).toBeInTheDocument();
		expect(screen.getByText("Boulder Swatch")).toBeInTheDocument();
		expect(screen.getByText("Cascade Swatch")).toBeInTheDocument();
	});

	it("holds Pallet from the starting width — every run begins there", () => {
		render(<RewardScreen {...base} slots={3} />);
		expect(screen.getByText("Swatches collected")).toBeInTheDocument();
		expect(screen.getByText("Pallet Swatch")).toBeInTheDocument();
		expect(screen.queryByText("Boulder Swatch")).not.toBeInTheDocument();
	});

	it("says the climb held when the pipeline is too narrow for the next gate", () => {
		// Running gate 3 already took 5 slots, so the hold is always one claim
		// away — here slot 6, the Thunder Swatch, which opens gate 4.
		render(<RewardScreen {...base} clearedGate={3} slots={5} heldAtGate />);
		expect(
			screen.getByText("Gate 3 cleared — still gate 3")
		).toBeInTheDocument();
		expect(
			screen.getByText(/Unlock slot 6 in the shop — the Thunder Swatch/)
		).toBeInTheDocument();
		// The clear was real, so the payout still reads as winnings.
		expect(screen.getByText(/you won/)).toBeInTheDocument();
	});

	it("headlines a plain clear without the held warning", () => {
		render(<RewardScreen {...base} clearedGate={3} slots={5} />);
		expect(screen.getByText("Gate 3 cleared!")).toBeInTheDocument();
		expect(screen.queryByText(/still gate 3/)).not.toBeInTheDocument();
	});
});
