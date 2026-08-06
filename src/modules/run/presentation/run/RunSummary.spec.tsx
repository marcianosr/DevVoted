import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import type { AnsweredPoll } from "~/modules/run/climb/run.model";
import { CONFIGS } from "~/modules/run/configs/configRoster.model";
import { GATE_COUNT, VICTORY_GATE } from "~/modules/run/rules.model";
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
				gatesCleared={GATE_COUNT}
				victoryGate={VICTORY_GATE}
				coverage={24}
				storage={640}
			/>
		);
		expect(screen.getByRole("heading", { name: /green/ })).toBeInTheDocument();
		// Gates count from 0, so the ladder runs gate 0 through the summit.
		expect(screen.getByText("Gate 0 cleared")).toBeInTheDocument();
		expect(
			screen.getByText(`Gate ${VICTORY_GATE} cleared`)
		).toBeInTheDocument();
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
				victoryGate={VICTORY_GATE}
				coverage={9}
				storage={120}
			/>
		);
		expect(
			screen.getByRole("heading", { name: /Build broke/ })
		).toBeInTheDocument();
		expect(screen.getByText(/stalled at gate 2/)).toBeInTheDocument();
		expect(
			screen.getByText("Gate 2 — pipeline broke here")
		).toBeInTheDocument();
		expect(screen.getByText("Gate 3 — not reached")).toBeInTheDocument();
		// Coverage is the run score, shown separately from the storage reward.
		expect(screen.getByText("9%")).toBeInTheDocument();
		// 2 of 12 gates cleared → 17% of the 120KB built up banks, the rest is lost.
		expect(screen.getByText(/banks only 17%/)).toBeInTheDocument();
		expect(screen.getByText(/20KB carried/)).toBeInTheDocument();
		expect(screen.getByText("100KB lost")).toBeInTheDocument();
	});

	it("lists installed configs and offers a review of answered polls", () => {
		render(
			<RunSummary
				won={false}
				gatesCleared={1}
				victoryGate={VICTORY_GATE}
				coverage={4}
				storage={40}
				configs={[CONFIGS.css]}
				answered={answered}
			/>
		);
		expect(screen.getByText("Configs installed")).toBeInTheDocument();
		expect(screen.getAllByText(CONFIGS.css.label).length).toBeGreaterThan(0);
		// The review lists every question as a row, correct count up top.
		expect(screen.getByText("1 of 2 correct")).toBeInTheDocument();
		expect(screen.getByText("Q1?")).toBeInTheDocument();
	});
});
