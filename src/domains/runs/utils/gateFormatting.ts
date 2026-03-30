import {
	GateDefinition,
	GateRequirement,
} from "../services/thresholdCalculator.service";

const formatSingleRequirement = (req: GateRequirement): string => {
	switch (req.type) {
		case "coverage":
			return `${req.threshold}% in ${req.requiredCategories} ${req.requiredCategories === 1 ? "category" : "categories"}`;
		case "correct-answers":
			return `Answer ${req.count} polls correctly`;
	}
};

export const formatGateRequirements = (
	gateDefinition: GateDefinition | null
): string => {
	if (!gateDefinition) return "";

	const { requirements, evaluationMode } = gateDefinition;

	if (requirements.length === 1) {
		return formatSingleRequirement(requirements[0]);
	}

	// Special AND formatting for 2 coverage requirements
	if (
		evaluationMode === "AND" &&
		requirements.length === 2 &&
		requirements[0].type === "coverage" &&
		requirements[1].type === "coverage"
	) {
		return `${requirements[0].threshold}% in 1 AND ${requirements[1].threshold}% in another`;
	}

	return requirements.map(formatSingleRequirement).join(` ${evaluationMode} `);
};
