import type { GateDefinition } from "~/domains/runs/services/thresholdCalculator.service";

/**
 * Format gate requirements for display
 * Examples:
 * - "10% in 1 category"
 * - "15% in 1 OR 10% in 2 categories"
 * - "30% in 1 AND 15% in another"
 */
export const formatGateRequirements = (
	gateDefinition: GateDefinition | null
): string => {
	if (!gateDefinition) return "";

	const { requirements, evaluationMode } = gateDefinition;

	if (requirements.length === 1) {
		const req = requirements[0];
		return `${req.threshold}% in ${req.requiredCategories} ${req.requiredCategories === 1 ? "category" : "categories"}`;
	}

	const formattedReqs = requirements.map(
		(req) =>
			`${req.threshold}% in ${req.requiredCategories} ${req.requiredCategories === 1 ? "category" : "categories"}`
	);

	if (evaluationMode === "AND" && requirements.length === 2) {
		// Special formatting for AND with 2 requirements
		return `${requirements[0].threshold}% in 1 AND ${requirements[1].threshold}% in another`;
	}

	return formattedReqs.join(` ${evaluationMode} `);
};
