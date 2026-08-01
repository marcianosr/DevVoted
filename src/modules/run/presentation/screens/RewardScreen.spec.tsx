import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

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
	gatesCleared: 1,
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
		expect(screen.getByText("Build pass!")).toBeInTheDocument();
		expect(screen.getByText(/Gate 1 cleared!/)).toBeInTheDocument();
		// Unit Tests pays its flat clear payout in its row.
		expect(screen.getByText("+32KB")).toBeInTheDocument();
		// Answers sit behind the review bar — expand it to reach the poll review.
		fireEvent.click(screen.getByRole("button", { name: /Review answers/ }));
		expect(screen.getByText("typeof null?")).toBeInTheDocument();
	});
});
