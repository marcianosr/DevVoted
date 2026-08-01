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
	description: "+32KB storage on gate clear.",
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

	it("labels a linter conditional — its check only bites when the lint is used", () => {
		const eslint = config({
			id: "eslint",
			label: "ESLint",
			check: "lint-correct",
		});
		expect(roleOf(eslint, [check({ label: "ESLint linted" })])).toBe(
			"conditional"
		);
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
		expect(row.status).toBeUndefined();
		expect(row.note).toBe("skipped");
		expect(row.state).toBe("skipped");
	});

	it("shows live progress for an active requirement", () => {
		const [row] = roleRows([unitTests], [correctCheck]);
		expect(row.status).toBe("0/1");
		expect(row.state).toBe("running");
	});

	it("carries the authored gives and needs onto the row", () => {
		const indexed = config({
			id: "indexed-db",
			label: "IndexedDB",
			check: "min-correct",
			gives: "+8KB per correct answer",
			needs: "3 correct answers this window",
		});
		const [row] = roleRows(
			[indexed],
			[check({ label: "IndexedDB", sourceConfigId: "indexed-db" })]
		);
		expect(row.gives).toBe("+8KB per correct answer");
		expect(row.needs).toBe("3 correct answers this window");
	});

	it("falls back to the live check demand when needs is not authored, so escalation stays visible", () => {
		const escalated = check({
			label: "Correct",
			sourceConfigId: "unit-tests",
			description: "3 correct answers",
		});
		const [row] = roleRows([unitTests], [escalated]);
		expect(row.needs).toBe("3 correct answers");
	});

	it("prefers the roster's authored needs over the live check demand", () => {
		const authored = config({
			id: "ts",
			label: ".ts",
			focusCategory: "ts",
			gives: "TypeScript polls earn 1.5× coverage",
			needs: "1 correct TypeScript poll",
		});
		const mastery = check({
			label: ".ts mastery",
			sourceConfigId: "ts",
			state: "skipped",
			description: ".ts: get one right if ts appears",
		});
		const [row] = roleRows([authored], [mastery]);
		expect(row.gives).toBe("TypeScript polls earn 1.5× coverage");
		expect(row.needs).toBe("1 correct TypeScript poll");
	});

	it("drops wordy progress under the description instead of the value slot", () => {
		const breadth = check({
			label: "Breadth",
			sourceConfigId: "unit-tests",
			progress: "0/2 categories",
		});
		const [row] = roleRows([unitTests], [breadth]);
		expect(row.status).toBeUndefined();
		expect(row.note).toBe("0/2 categories");
	});

	it("states the escalated demand on a requirement row, not the base config text", () => {
		const escalated = check({
			label: "Correct",
			sourceConfigId: "unit-tests",
			target: 3,
			progress: "2/3",
			description: "3 correct answers",
		});
		const [row] = roleRows([unitTests], [escalated]);
		expect(row.description).toBe(
			"Requires 3 correct answers to pass the gate."
		);
	});

	it("keeps the config's own description when the check carries no demand", () => {
		const [row] = roleRows([unitTests], [correctCheck]);
		expect(row.description).toBe("+32KB storage on gate clear.");
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
