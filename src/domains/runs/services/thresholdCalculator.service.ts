import type { RunCategoryCoverage } from "~/domains/runs/models/runCategoryCoverage";

/**
 * Gate requirement definition
 * Specifies threshold percentage and how many categories must meet it
 */
export type GateRequirement = {
	threshold: number;
	requiredCategories: number;
};

/**
 * CI Gate definition with flexible OR/AND conditions
 * - OR mode: At least one requirement must be met
 * - AND mode: All requirements must be met (using different categories)
 */
export type GateDefinition = {
	gate: number;
	requirements: GateRequirement[];
	evaluationMode: "OR" | "AND";
	pollsPerGate: number;
};

/**
 * Result of evaluating a single gate requirement
 */
type RequirementEvaluation = {
	requirement: GateRequirement;
	met: boolean;
	qualifyingCategories: readonly string[];
};

/**
 * Threshold calculation result
 */
export type ThresholdInfo = {
	readonly meetsThreshold: boolean;
	readonly maxCoverage: number; // Highest coverage achieved in any category
	readonly pollNumber: number;
	readonly currentGate: number;
	readonly pollInRound: number; // Position within the current round (1, 2, or 3)
	readonly isThresholdCheckPoll: boolean; // True for every 3rd poll (polls 3, 6, 9, etc.)
	readonly gateDefinition: GateDefinition | null; // Current gate requirements
	readonly requirementEvaluations: readonly RequirementEvaluation[]; // Detailed evaluation of each requirement
	readonly qualifyingCategories: readonly string[]; // All categories that helped pass the gate
};

/**
 * Determines the current round based on total polls seen
 * Rounds are organized in sets of POLLS_PER_ROUND polls (CI gates at polls 5, 10, 15, etc.)
 *
 * @param totalPollsSeen - Total unique polls seen in current run (from run_poll_history)
 * @returns Current round number (1-based, minimum 1)
 */
export const getCurrentRound = (
	totalPollsSeen: number,
	gate: GateDefinition
): number => {
	if (totalPollsSeen === 0) return 1;
	return Math.floor((totalPollsSeen - 1) / gate.pollsPerGate) + 1;
};

export const getCurrentGate = (
	totalPollsSeen: number,
	gates: GateDefinition[]
): GateDefinition => {
	let pollsAccumulated = 0;

	for (const gate of gates) {
		pollsAccumulated += gate.pollsPerGate;
		if (totalPollsSeen <= pollsAccumulated) {
			return gate;
		}
	}

	// Beyond all defined gates - return last gate
	return gates[gates.length - 1];
};

/**
 * Determines the position within the current round (1-POLLS_PER_ROUND)
 *
 * @param totalPollsSeen - Total unique polls seen in current run (from run_poll_history)
 * @returns Poll position within round (1-5)
 */
export const getPollInRound = (
	totalPollsSeen: number,
	gate: GateDefinition
): number => {
	if (totalPollsSeen === 0) return 1;
	return ((totalPollsSeen - 1) % gate.pollsPerGate) + 1;
};

/**
 * Checks if the current poll is a threshold check poll (every POLLS_PER_ROUND poll)
 *
 * @param totalPollsSeen - Total unique polls seen in current run (from run_poll_history)
 * @returns True if this is a threshold check poll (polls 5, 10, 15, etc.)
 */
export const isThresholdCheckPoll = (
	totalPollsSeen: number,
	gate: GateDefinition
): boolean => {
	return totalPollsSeen > 0 && totalPollsSeen % gate.pollsPerGate === 0;
};

/**
 * Gets the gate definition for a given round
 * Returns null if round exceeds defined gates (uses last gate pattern)
 *
 * @param round - Current round number
 * @param gates - Optional custom gates array (defaults to CI_GATES)
 * @returns Gate definition or null
 */
export const getGateDefinition = (
	round: number,
	gates: GateDefinition[]
): GateDefinition | null => {
	if (round <= 0 || gates.length === 0) return null;

	// If we have a defined gate, return it
	if (round <= gates.length) {
		return gates[round - 1];
	}

	// For rounds beyond defined gates, extrapolate from last gate pattern
	const lastGate = gates[gates.length - 1];
	const roundsBeyond = round - gates.length;
	const incrementPerRound = 5; // TODO: What is this value?

	return {
		gate: round,
		requirements: lastGate.requirements.map((req) => ({
			threshold: req.threshold + roundsBeyond * incrementPerRound,
			requiredCategories: req.requiredCategories,
		})),
		evaluationMode: lastGate.evaluationMode,
		pollsPerGate: lastGate.pollsPerGate,
	};
};

/**
 * Evaluates a single gate requirement against category coverage data
 *
 * @param requirement - The requirement to evaluate
 * @param categoryCoverageData - Array of category coverage data
 * @param excludeCategories - Categories to exclude (for AND evaluation)
 * @returns Requirement evaluation result
 */
const evaluateRequirement = (
	requirement: GateRequirement,
	categoryCoverageData: readonly RunCategoryCoverage[],
	excludeCategories: Set<string> = new Set()
): RequirementEvaluation => {
	// Find categories that meet the threshold and aren't excluded
	const qualifyingCategories = categoryCoverageData
		.filter(
			(coverage) =>
				coverage.currentCoverage >= requirement.threshold &&
				!excludeCategories.has(coverage.categoryCode)
		)
		.map((coverage) => coverage.categoryCode);

	const met = qualifyingCategories.length >= requirement.requiredCategories;

	return {
		requirement,
		met,
		qualifyingCategories,
	};
};

/**
 * Core threshold calculation logic
 * Evaluates gate requirements with OR/AND logic
 *
 * @param categoryCoverageData - Array of category coverage data (for gate evaluation)
 * @param totalPollsSeen - Total unique polls seen in current run (from run_poll_history)
 * @param gates - Optional custom gates array (defaults to CI_GATES)
 * @returns Threshold information
 */
export const calculateThresholdInfo = (
	categoryCoverageData: readonly RunCategoryCoverage[],
	totalPollsSeen: number,
	gates: GateDefinition[]
): ThresholdInfo => {
	// Find the maximum coverage across all categories
	const maxCoverage = Math.max(
		...categoryCoverageData.map((xp) => xp.currentCoverage),
		0
	);

	// Calculate total polls answered (still used for pollNumber tracking)
	const totalPollsAnswered = categoryCoverageData.reduce(
		(sum, xp) => sum + xp.pollsAnswered,
		0
	);

	const currentGate = getCurrentGate(totalPollsSeen, gates);
	// Determine current round and gate based on SEEN polls
	const pollInRound = getPollInRound(totalPollsSeen, currentGate);
	const isThresholdCheck = isThresholdCheckPoll(totalPollsSeen, currentGate);
	const gateDefinition = getGateDefinition(currentGate.gate, gates);

	// If no gate definition or not a threshold check, always pass
	if (!gateDefinition || !isThresholdCheck) {
		return {
			meetsThreshold: true,
			maxCoverage,
			pollNumber: totalPollsAnswered,
			currentGate: currentGate.gate,
			pollInRound,
			isThresholdCheckPoll: isThresholdCheck,
			gateDefinition,
			requirementEvaluations: [],
			qualifyingCategories: [],
		};
	}

	let meetsThreshold = false;
	let requirementEvaluations: RequirementEvaluation[] = [];
	let qualifyingCategories: string[] = [];

	if (gateDefinition.evaluationMode === "OR") {
		// OR mode: At least one requirement must be met
		requirementEvaluations = gateDefinition.requirements.map((req) =>
			evaluateRequirement(req, categoryCoverageData)
		);

		meetsThreshold = requirementEvaluations.some(
			(evaluation) => evaluation.met
		);

		// Collect qualifying categories from the first met requirement
		const firstMetRequirement = requirementEvaluations.find(
			(evaluation) => evaluation.met
		);
		qualifyingCategories = firstMetRequirement
			? [...firstMetRequirement.qualifyingCategories]
			: [];
	} else {
		// AND mode: All requirements must be met using different categories
		const usedCategories = new Set<string>();

		for (const requirement of gateDefinition.requirements) {
			const evaluation = evaluateRequirement(
				requirement,
				categoryCoverageData,
				usedCategories
			);
			requirementEvaluations.push(evaluation);

			if (evaluation.met) {
				// Mark the first N qualifying categories as used
				const categoriesToUse = evaluation.qualifyingCategories.slice(
					0,
					requirement.requiredCategories
				);
				categoriesToUse.forEach((cat) => usedCategories.add(cat));
				qualifyingCategories.push(...categoriesToUse);
			}
		}

		// All requirements must be met for AND mode
		meetsThreshold = requirementEvaluations.every(
			(evaluation) => evaluation.met
		);
	}

	return {
		meetsThreshold,
		maxCoverage,
		pollNumber: totalPollsAnswered,
		currentGate: currentGate.gate,
		pollInRound,
		isThresholdCheckPoll: isThresholdCheck,
		gateDefinition,
		requirementEvaluations,
		qualifyingCategories,
	};
};
