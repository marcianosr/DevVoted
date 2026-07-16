import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { CONFIGS } from "~/modules/session-run/configs/configRoster.model";
import type { CheckStatus } from "~/modules/session-run/configs/effect.model";
import { GateRequirementList } from "./GateRequirementList.ui";

const configs = [CONFIGS.coverageGain, CONFIGS.js, CONFIGS.coldStart];

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
		sourceConfigId: "coverage-gain",
	},
	{
		label: ".js mastery",
		progress: "not seen",
		current: 0,
		target: 1,
		state: "skipped",
		sourceConfigId: "js",
		description: "get one right if js appears",
	},
	{
		label: "Cold start",
		progress: "0/2",
		current: 0,
		target: 2,
		state: "failed",
		sourceConfigId: "cold-start",
	},
];

describe(GateRequirementList, () => {
	it("renders the checks and the total reward", () => {
		render(
			<GateRequirementList
				checks={checks}
				configs={configs}
				gateNumber={2}
				pollsToGate={4}
				gateReward={180}
			/>
		);
		expect(screen.getByText("Correct")).toBeInTheDocument();
		expect(screen.getByText(/\+180 KB storage/)).toBeInTheDocument();
	});

	it("renders each check with its progress, colored by state", () => {
		render(
			<GateRequirementList
				checks={checks}
				configs={configs}
				gateNumber={1}
				pollsToGate={5}
				gateReward={120}
			/>
		);
		expect(screen.getByText("3/3")).toHaveClass("text-viridian");
		expect(screen.getByText("2%/4%")).toHaveClass("text-saffron");
		expect(screen.getByText("not seen")).toHaveClass("text-pewter");
		expect(screen.getByText("0/2")).toHaveClass("text-cinnabar");
	});

	it("ties each config-derived check to its source config chip", () => {
		render(
			<GateRequirementList
				checks={checks}
				configs={configs}
				gateNumber={1}
				pollsToGate={5}
				gateReward={120}
			/>
		);
		expect(screen.getByText(".js")).toBeInTheDocument(); // the .js config chip
	});

	it("shows each source config's full description inline (no tooltip needed)", () => {
		render(
			<GateRequirementList
				checks={checks}
				configs={configs}
				gateNumber={1}
				pollsToGate={5}
				gateReward={120}
			/>
		);
		expect(
			screen.getByText(/JavaScript polls earn 1\.5× coverage/)
		).toBeInTheDocument();
	});
});
