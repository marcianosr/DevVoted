import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import type { CheckStatus } from "~/modules/session-run/configs/effect.model";
import { GateRequirementList } from "./GateRequirementList.ui";

const checks: CheckStatus[] = [
	{
		label: "Correct",
		progress: "3/3",
		current: 3,
		target: 3,
		state: "success",
	},
	{
		label: "Coverage",
		progress: "2%/4%",
		current: 2,
		target: 4,
		state: "running",
	},
	{
		label: ".js mastery",
		progress: "not seen",
		current: 0,
		target: 1,
		state: "skipped",
	},
	{
		label: "Speed",
		progress: "0/2 fast",
		current: 0,
		target: 2,
		state: "failed",
	},
];

describe("GateRequirementList", () => {
	it("renders the CI Pipelines header with gate number, poll count, and reward", () => {
		render(
			<GateRequirementList
				checks={checks}
				gateNumber={2}
				pollsToGate={4}
				gateReward={180}
			/>
		);
		expect(
			screen.getByRole("heading", { name: "Pipelines" })
		).toBeInTheDocument();
		expect(screen.getByText("Gate #2")).toBeInTheDocument();
		expect(screen.getByText(/4 polls left/)).toBeInTheDocument();
		expect(screen.getByText(/\+180 KB storage/)).toBeInTheDocument();
	});

	it("renders each check with its progress, colored by state", () => {
		render(
			<GateRequirementList
				checks={checks}
				gateNumber={1}
				pollsToGate={5}
				gateReward={120}
			/>
		);
		expect(screen.getByText("3/3")).toHaveClass("text-viridian");
		expect(screen.getByText("2%/4%")).toHaveClass("text-vermillion");
		expect(screen.getByText("not seen")).toHaveClass("text-pewter");
		expect(screen.getByText("0/2 fast")).toHaveClass("text-cinnabar");
	});
});
