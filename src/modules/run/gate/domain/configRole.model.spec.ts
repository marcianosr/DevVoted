import { describe, expect, it } from "vitest";

import type { Config } from "~/modules/run/config/domain/config.model";
import type { CheckStatus } from "~/modules/run/config/domain/effect.model";
import { roleOf, roleRows } from "~/modules/run/gate/domain/configRole.model";

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
	storageOnClear: 32,
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

	it("labels a config that backs no check passive", () => {
		expect(roleOf(coverageGain, [correctCheck])).toBe("passive");
	});

	it("labels a linter conditional — its check bites only when its category is drawn", () => {
		const eslint = config({
			id: "eslint",
			label: "ESLint",
			eliminatesWrongOptionsFor: ["js", "ts"],
		});
		expect(roleOf(eslint, [check({ label: "ESLint mastery" })])).toBe(
			"conditional"
		);
	});
});

describe("roleRows", () => {
	it("orders rows requirement, then conditional, then passive", () => {
		const rows = roleRows([coverageGain, focusTs, unitTests], [correctCheck]);
		expect(rows.map((row) => row.role)).toEqual([
			"requirement",
			"conditional",
			"passive",
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
		// The gray dot carries the skipped state alone — no counter, no note.
		expect(row.status).toBeUndefined();
		expect(row.note).toBeUndefined();
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

	it("derives a focus config's gives from its level, so an upgrade reads on the row", () => {
		const levelled = config({
			id: "ts",
			label: ".ts",
			focusCategory: "ts",
			level: 2,
		});
		const mastery = check({
			label: ".ts mastery",
			sourceConfigId: "ts",
			state: "skipped",
			description: ".ts: get one right if ts appears",
		});
		const [row] = roleRows([levelled], [mastery]);
		expect(row.gives).toBe("TypeScript polls reward ×1.5 coverage");
		expect(row.needs).toBe("Answer TypeScript polls correct when they show");
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

	it("derives the correct-check copy when the check carries no demand", () => {
		const [row] = roleRows([unitTests], [correctCheck]);
		expect(row.description).toBe(
			"+32KB storage on gate clear — demands 1 correct answer, rising as you climb."
		);
	});
});
