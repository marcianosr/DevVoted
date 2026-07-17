import { describe, expect, it } from "vitest";

import type { Config } from "../configs/config.model";
import type { CheckStatus } from "../configs/effect.model";
import {
	extraGateRequirements,
	roleOf,
	roleRows,
	stakesRequirement,
} from "./configRole.model";

const config = (
	over: Partial<Config> & Pick<Config, "id" | "label">
): Config => ({
	family: "check",
	description: "",
	requirementDelta: 0,
	rewardMultiplier: 1,
	...over,
});

const check = (
	over: Partial<CheckStatus> & Pick<CheckStatus, "label">
): CheckStatus => ({
	progress: "0/1",
	current: 0,
	target: 1,
	state: "running",
	...over,
});

const unitTests = config({
	id: "unit-tests",
	label: "Unit Tests",
	check: "correct",
});
const focusTs = config({ id: "ts", label: ".ts", focusCategory: "ts" });
const coverageGain = config({
	id: "coverage-gain",
	label: "Code Coverage",
	family: "economy",
});

const correctCheck = check({ label: "Correct", sourceConfigId: "unit-tests" });

describe("roleOf", () => {
	it("labels a Focus config conditional", () => {
		expect(roleOf(focusTs, [])).toBe("conditional");
	});

	it("labels a check-backing config a requirement", () => {
		expect(roleOf(unitTests, [correctCheck])).toBe("requirement");
	});

	it("labels a config that backs no check a perk", () => {
		expect(roleOf(coverageGain, [correctCheck])).toBe("perk");
	});
});

describe("roleRows", () => {
	it("orders rows requirement, then conditional, then perk", () => {
		const rows = roleRows([coverageGain, focusTs, unitTests], [correctCheck]);
		expect(rows.map((row) => row.role)).toEqual([
			"requirement",
			"conditional",
			"perk",
		]);
	});

	it("mutes a conditional whose category has not shown yet", () => {
		const dormantMastery = check({
			label: ".ts mastery",
			sourceConfigId: "ts",
			state: "skipped",
			progress: "not seen",
		});
		const [row] = roleRows([focusTs], [dormantMastery]);
		expect(row.status).toBe("not triggered yet");
		expect(row.state).toBe("skipped");
	});

	it("shows live progress for an active requirement", () => {
		const [row] = roleRows([unitTests], [correctCheck]);
		expect(row.status).toBe("0/1");
		expect(row.state).toBe("running");
	});
});

describe("stakesRequirement", () => {
	it("reads the count from the Correct check and the label from its config", () => {
		const raised = check({
			label: "Correct",
			sourceConfigId: "unit-tests",
			target: 2,
		});
		expect(stakesRequirement([unitTests], [raised])).toEqual({
			count: 2,
			label: "Unit Tests",
		});
	});

	it("falls back to a single correct answer when no check exists yet", () => {
		expect(stakesRequirement([unitTests], [])).toEqual({
			count: 1,
			label: "Unit Tests",
		});
	});
});

describe("extraGateRequirements", () => {
	const coverageCheck = check({
		label: "Coverage",
		sourceConfigId: "coverage-gain",
		description: "+4% coverage this window",
	});
	const masteryCheck = check({
		label: ".ts mastery",
		sourceConfigId: "ts",
		state: "skipped",
	});

	it("lists always-on requirements beyond the fixed correct one", () => {
		const demands = extraGateRequirements(
			[unitTests, coverageGain],
			[correctCheck, coverageCheck]
		);
		expect(demands).toEqual(["+4% coverage this window"]);
	});

	it("excludes conditional Focus checks — they only bite when the category shows", () => {
		const demands = extraGateRequirements(
			[unitTests, focusTs],
			[correctCheck, masteryCheck]
		);
		expect(demands).toEqual([]);
	});
});
