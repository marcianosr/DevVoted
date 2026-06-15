import {
	fetchActiveTechDebtsByRun,
	insertActiveTechDebt,
} from "~/domains/techDebt/api/queries";
import { TECH_DEBT_SOFT_CAP } from "~/domains/techDebt/config";
import {
	getTechDebtTemplate,
	techDebtTemplates,
} from "~/domains/techDebt/data/techDebtTemplates";
import {
	ActiveTechDebt,
	TechDebtTemplate,
	TechDebtTemplateId,
} from "~/domains/techDebt/models/techDebt.model";
import { createInitialClearProgress } from "~/domains/techDebt/services/clearProgress.service";

/**
 * Pool selector. Returns templates the run doesn't already carry — matches
 * the "unique types only" stacking rule.
 */
const availableTemplates = (owned: ActiveTechDebt[]): TechDebtTemplate[] => {
	const ownedIds = new Set(owned.map((td) => td.templateId));
	return techDebtTemplates.filter((template) => !ownedIds.has(template.id));
};

/**
 * Picks a uniformly random template from a non-empty pool. Splits out so the
 * caller can test selection logic with a seeded picker if needed later.
 */
const pickRandomTemplate = (
	pool: TechDebtTemplate[],
	random: () => number
): TechDebtTemplate => pool[Math.floor(random() * pool.length)];

export type AcquireTechDebtResult =
	| { status: "acquired"; techDebt: ActiveTechDebt }
	| { status: "softCapReached" }
	| { status: "poolExhausted" };

export type AcquireTechDebtInput = {
	runId: number;
	/** Optional explicit template id — used by callers that pre-rolled the TD. */
	forceTemplateId?: TechDebtTemplateId;
	/** Injectable for deterministic tests. Defaults to Math.random. */
	random?: () => number;
};

/**
 * Spawns a Tech Debt instance on the run, picking a random template the run
 * doesn't already hold. Caller does not pass progress state — it's derived
 * from the template's clear condition by createInitialClearProgress.
 *
 * Returns a discriminated result rather than throwing for the "can't acquire"
 * paths because both are legitimate game states the caller may want to handle
 * (soft cap full = silently skip; pool exhausted = same).
 */
export const acquireTechDebt = async (
	input: AcquireTechDebtInput
): Promise<AcquireTechDebtResult> => {
	const owned = await fetchActiveTechDebtsByRun(input.runId);

	if (owned.length >= TECH_DEBT_SOFT_CAP) {
		return { status: "softCapReached" };
	}

	const template = resolveTemplate({
		owned,
		forceTemplateId: input.forceTemplateId,
		random: input.random ?? Math.random,
	});

	if (!template) return { status: "poolExhausted" };

	const techDebt = await insertActiveTechDebt({
		runId: input.runId,
		templateId: template.id,
		progress: createInitialClearProgress(template),
	});

	return { status: "acquired", techDebt };
};

type ResolveTemplateInput = {
	owned: ActiveTechDebt[];
	forceTemplateId?: TechDebtTemplateId;
	random: () => number;
};

const resolveTemplate = ({
	owned,
	forceTemplateId,
	random,
}: ResolveTemplateInput): TechDebtTemplate | undefined => {
	if (forceTemplateId) {
		const ownedIds = new Set(owned.map((td) => td.templateId));
		if (ownedIds.has(forceTemplateId)) return undefined;
		return getTechDebtTemplate(forceTemplateId);
	}

	const pool = availableTemplates(owned);
	if (pool.length === 0) return undefined;
	return pickRandomTemplate(pool, random);
};
