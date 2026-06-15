import { STORAGE_UNITS } from "~/lib/storage";

import {
	TechDebtTemplate,
	TechDebtTemplateId,
} from "~/domains/techDebt/models/techDebt.model";

/**
 * MVP Tech Debt pool. Templates are code-defined (not DB-stored) so iteration
 * doesn't require migrations. Instances live in the `active_tech_debts` table
 * and reference these templates by id.
 *
 * Note on Stale Cache: its debuff (`configUpgradesBlocked`) targets a system
 * that doesn't exist yet — config upgrades are a future surface (DVTD-7oa7).
 * The template ships now so the pool is complete, but its debuff applicator
 * will no-op until config upgrades land.
 */
export const techDebtTemplates: TechDebtTemplate[] = [
	{
		id: "legacy-module",
		name: "Legacy Module",
		description: "Brittle code from a forgotten era taxes every pipeline.",
		debuff: { kind: "pipelineGradeModifier", delta: 1 },
		clearCondition: { kind: "coverageGain", targetPercent: 15 },
	},
	{
		id: "lost-docs",
		name: "Lost Docs",
		description: "No README, no JSDoc — you can't tell what you're picking.",
		debuff: { kind: "hideCategoryInPipelinePicks" },
		clearCondition: { kind: "firstAnswers", target: 3 },
	},
	{
		id: "flaky-suite",
		name: "Flaky Suite",
		description: "CI keeps failing on you. The shop won't trust your build.",
		debuff: { kind: "shopLocked" },
		// Two paths out: a 5-streak proves the suite isn't flaky, or 15 correct
		// in the run proves it on volume. Whichever lands first.
		clearCondition: {
			kind: "correctAnswerStreakOrTotal",
			streakTarget: 5,
			totalTarget: 15,
		},
	},
	{
		id: "scope-creep",
		name: "Scope Creep",
		description: "Every ticket grew. Now you must take two pipelines per gate.",
		debuff: { kind: "forcedPipelinePickCount", count: 2 },
		clearCondition: { kind: "pipelinesCompleted", target: 1 },
	},
	{
		id: "stale-cache",
		name: "Stale Cache",
		description: "Build cache poisoned. Config upgrades refuse to run.",
		debuff: { kind: "configUpgradesBlocked" },
		clearCondition: { kind: "singleCategoryCoverageGain", targetPercent: 10 },
	},
	{
		id: "obfuscated-imports",
		name: "Obfuscated Imports",
		description:
			"Minified mess. Shop offerings show as `???` until you re-fetch.",
		debuff: { kind: "obfuscateShopItems" },
		clearCondition: {
			kind: "rerollStorageSpent",
			targetBytes: 3 * STORAGE_UNITS.KB,
		},
	},
];

const templateIndex = new Map<TechDebtTemplateId, TechDebtTemplate>(
	techDebtTemplates.map((template) => [template.id, template])
);

export const getTechDebtTemplate = (
	id: TechDebtTemplateId
): TechDebtTemplate => {
	const template = templateIndex.get(id);
	if (!template) throw new Error(`Unknown Tech Debt template: ${id}`);
	return template;
};
