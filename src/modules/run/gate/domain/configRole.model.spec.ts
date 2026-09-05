import { describe, expect, it } from "vitest";

import type { Config } from "~/modules/run/config/domain/config.model";
import { roleOf, roleRows } from "~/modules/run/gate/domain/configRole.model";

const config = (
	over: Partial<Config> & Pick<Config, "id" | "label">
): Config => ({
	description: "",
	rewardMultiplier: 1,
	...over,
});

const unitTests = config({
	id: "unit-tests",
	label: "Unit Tests",
	description: "+32KB storage on gate clear.",
	storageOnClear: 32,
});
const focusTs = config({
	id: "ts",
	label: ".ts",
	focusCategory: "ts",
});
const eslint = config({
	id: "eslint",
	label: "ESLint",
	eliminatesWrongOptionsFor: ["js", "ts"],
	gives: "Cross out a wrong answer on JS/TS polls",
	costs: "The fee doubles each use",
});

describe("roleOf", () => {
	it("labels a Focus config conditional — its effect fires only on matching polls", () => {
		expect(roleOf(focusTs)).toBe("conditional");
	});

	it("labels a linter conditional for the same reason", () => {
		expect(roleOf(eslint)).toBe("conditional");
	});

	it("labels an always-on config passive", () => {
		expect(roleOf(unitTests)).toBe("passive");
	});
});

describe("roleRows", () => {
	it("orders rows conditional first, then passive", () => {
		const rows = roleRows([unitTests, focusTs]);
		expect(rows.map((row) => row.role)).toEqual(["conditional", "passive"]);
	});

	it("carries the config's gives and costs onto the row", () => {
		const [row] = roleRows([eslint]);
		expect(row.gives).toBe("Cross out a wrong answer on JS/TS polls");
		expect(row.costs).toBe("The fee doubles each use");
	});

	it("derives a focus config's gives from its level, so an upgrade reads on the row", () => {
		const [row] = roleRows([{ ...focusTs, level: 2 }]);
		expect(row.gives).toBe("TypeScript polls reward ×1.5 coverage");
	});

	it("always reads the config's own text — nothing is a requirement anymore (ADR-035)", () => {
		const rows = roleRows([unitTests, focusTs, eslint]);
		rows.forEach((row) => expect(row.reason).toEqual({ kind: "config" }));
	});
});
