import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import type { AnsweredPoll } from "~/modules/run/climb/run.model";
import { CONFIGS } from "~/modules/run/configs/configRoster.model";
import { RunSummary } from "./RunSummary.ui";

const answered: AnsweredPoll[] = [
	{
		id: "p1",
		question: "Q1?",
		category: "css",
		outcome: "correct",
		picked: [],
	},
	{ id: "p2", question: "Q2?", category: "js", outcome: "wrong", picked: [] },
];

describe(RunSummary, () => {
	it("celebrates a summit with every gate cleared and all storage carried", () => {
		render(
			<RunSummary
				won
				gatesCleared={5}
				victoryGate={5}
				coverage={24}
				storage={640}
			/>
		);
		expect(screen.getByRole("heading", { name: /green/ })).toBeInTheDocument();
		expect(screen.getByText("Gate 1 cleared")).toBeInTheDocument();
		expect(screen.getByText("Gate 5 cleared")).toBeInTheDocument();
		// Coverage reads as a score, not a reward.
		expect(screen.getByText("24%")).toBeInTheDocument();
		expect(screen.getByText(/all 640KB/)).toBeInTheDocument();
		expect(screen.getByText(/100% of 640KB/)).toBeInTheDocument();
		expect(screen.getByText("0KB lost")).toBeInTheDocument();
		expect(screen.queryByText(/broke here/)).not.toBeInTheDocument();
	});

	it("marks a dead run and banks storage proportional to gates cleared", () => {
		render(
			<RunSummary
				won={false}
				gatesCleared={2}
				victoryGate={5}
				coverage={9}
				storage={120}
			/>
		);
		expect(
			screen.getByRole("heading", { name: /Build broke/ })
		).toBeInTheDocument();
		expect(screen.getByText(/stalled at gate 3/)).toBeInTheDocument();
		expect(
			screen.getByText("Gate 3 — pipeline broke here")
		).toBeInTheDocument();
		expect(screen.getByText("Gate 4 — not reached")).toBeInTheDocument();
		// Coverage is the run score, shown separately from the storage reward.
		expect(screen.getByText("9%")).toBeInTheDocument();
		// 2 of 5 gates cleared → 40% of the 120KB built up banks, the rest is lost.
		expect(screen.getByText(/banks only 40%/)).toBeInTheDocument();
		expect(screen.getByText(/48KB carried/)).toBeInTheDocument();
		expect(screen.getByText("72KB lost")).toBeInTheDocument();
	});

	it("lists installed configs and offers a review of answered polls", () => {
		render(
			<RunSummary
				won={false}
				gatesCleared={1}
				victoryGate={5}
				coverage={4}
				storage={40}
				configs={[CONFIGS.css]}
				answered={answered}
			/>
		);
		expect(screen.getByText("Configs installed")).toBeInTheDocument();
		expect(screen.getAllByText(CONFIGS.css.label).length).toBeGreaterThan(0);
		expect(screen.getByText(/Review your 2 answers/)).toBeInTheDocument();
	});
});
