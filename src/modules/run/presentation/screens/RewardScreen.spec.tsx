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
	gateReward: 120,
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
	it("shows the cleared gate, the pipelines breakdown, and the answer results", () => {
		render(<RewardScreen {...base} />);
		expect(
			screen.getByRole("heading", { name: /Gate #1 cleared/ })
		).toBeInTheDocument();
		// Answers now render as outcome tiles — the question shows after expanding.
		expect(screen.getByRole("button", { name: /Poll 1/ })).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: /Poll 1/ }));
		expect(screen.getByText("typeof null?")).toBeInTheDocument();
		// The pipelines row reuses RoleList — its cleared progress is shown.
		expect(screen.getByText("2/2")).toBeInTheDocument();
	});
});
