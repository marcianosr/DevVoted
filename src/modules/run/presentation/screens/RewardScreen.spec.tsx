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

	it("names the badge this clear just earned, in the report itself", () => {
		render(<RewardScreen {...base} />);
		// Gate 1 is Boulder's gate, so its clear is what awards Boulder.
		expect(screen.getByTestId("earned-swatch")).toHaveTextContent(
			"Boulder Swatch earned"
		);
	});

	it("names every swatch the run holds, the fresh one included", () => {
		render(<RewardScreen {...base} clearedGate={2} />);
		expect(screen.getByText("Swatches collected")).toBeInTheDocument();
		// Clearing gate 2 banks gates 0 through 2 — Pallet, Boulder, Cascade.
		for (const name of ["Pallet Swatch", "Boulder Swatch", "Cascade Swatch"])
			expect(screen.getAllByText(name).length).toBeGreaterThan(0);
		expect(screen.queryByText("Thunder Swatch")).not.toBeInTheDocument();
	});

	it("gives gate 0's clear Pallet and nothing else", () => {
		render(<RewardScreen {...base} clearedGate={0} />);
		expect(screen.getAllByText("Pallet Swatch").length).toBeGreaterThan(0);
		expect(screen.queryByText("Boulder Swatch")).not.toBeInTheDocument();
	});

	it("headlines every clear as a clear — the climb never holds", () => {
		render(<RewardScreen {...base} clearedGate={3} />);
		expect(screen.getByText("Gate 3 cleared!")).toBeInTheDocument();
		expect(screen.queryByText(/still gate 3/)).not.toBeInTheDocument();
	});
});
