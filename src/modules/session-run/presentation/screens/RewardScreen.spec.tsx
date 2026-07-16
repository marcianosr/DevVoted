import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { CONFIGS } from "~/modules/session-run/configs/configRoster.model";
import { RewardScreen } from "./RewardScreen.ui";

const base = {
	gatesCleared: 1,
	gateReward: 120,
	coverageGainedByCategory: { js: 8, css: 3.5 },
	answered: [
		{
			id: "js1",
			question: "typeof null?",
			category: "js" as const,
			correct: true,
			picked: ['"object"'],
		},
		{
			id: "js2",
			question: "at(-1)?",
			category: "js" as const,
			correct: false,
			picked: ["pop()"],
		},
	],
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

describe("RewardScreen", () => {
	it("shows the cleared gate, the pipelines breakdown, and the answer results", () => {
		render(<RewardScreen {...base} />);
		expect(
			screen.getByRole("heading", { name: /Gate #1 cleared/ })
		).toBeInTheDocument();
		expect(screen.getByText("typeof null?")).toBeInTheDocument();
		// The pipelines row reuses RoleList — its cleared progress is shown.
		expect(screen.getByText("2/2")).toBeInTheDocument();
	});
});
