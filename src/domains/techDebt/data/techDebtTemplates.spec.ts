import { describe, expect, it } from "vitest";

import { TechDebtTemplateId } from "~/domains/techDebt/models/techDebt.model";

import { getTechDebtTemplate, techDebtTemplates } from "./techDebtTemplates";

const expectedIds: TechDebtTemplateId[] = [
	"legacy-module",
	"lost-docs",
	"flaky-suite",
	"scope-creep",
	"stale-cache",
	"obfuscated-imports",
];

describe("techDebtTemplates", () => {
	it("ships exactly the MVP pool of six templates", () => {
		expect(techDebtTemplates).toHaveLength(6);
	});

	it("contains every MVP template id once", () => {
		const ids = techDebtTemplates.map((template) => template.id).sort();
		expect(ids).toEqual([...expectedIds].sort());
	});

	it("has no duplicate template ids", () => {
		const ids = techDebtTemplates.map((template) => template.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it("returns Flaky Suite by id with shop-lock debuff and streak-or-total clear condition", () => {
		const template = getTechDebtTemplate("flaky-suite");
		expect(template.debuff).toEqual({ kind: "shopLocked" });
		expect(template.clearCondition).toEqual({
			kind: "correctAnswerStreakOrTotal",
			streakTarget: 5,
			totalTarget: 15,
		});
	});

	it("throws when asked for an unknown template id", () => {
		expect(() =>
			// @ts-expect-error — exercising the runtime guard with an invalid id
			getTechDebtTemplate("banjo-kazooie")
		).toThrow(/Unknown Tech Debt template/);
	});
});
