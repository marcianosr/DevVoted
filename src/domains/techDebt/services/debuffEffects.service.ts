import {
	ActiveTechDebt,
	TechDebtTemplate,
} from "~/domains/techDebt/models/techDebt.model";
import { getTechDebtTemplate } from "~/domains/techDebt/data/techDebtTemplates";

/**
 * Resolves the debuff descriptor for each active Tech Debt by joining
 * instance → template. Centralised so consumers don't keep re-importing
 * the template lookup.
 */
const debuffsOf = (activeTds: ActiveTechDebt[]): TechDebtTemplate["debuff"][] =>
	activeTds.map((td) => getTechDebtTemplate(td.templateId).debuff);

/**
 * Flaky Suite: the shop refuses interactions (purchase, reroll). Skip
 * remains allowed — it is the escape hatch from a locked shop. Returns true
 * if any active Tech Debt has the shopLocked debuff.
 */
export const isShopLockedByTechDebt = (activeTds: ActiveTechDebt[]): boolean =>
	debuffsOf(activeTds).some((debuff) => debuff.kind === "shopLocked");
