import type { RunCategoryCoverage } from "~/domains/runs/models/runCategoryCoverage";

/**
 * Number of polls per round (CI gate interval)
 */
export const POLLS_PER_ROUND = 5;

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
};

/**
 * CI Gate Configuration
 * Progressive difficulty system that accommodates random poll selection
 *
 * Phase 1 (Gates 1-4): OR conditions provide flexibility (specialize OR diversify)
 * Phase 2 (Gates 5-7): AND conditions require category breadth (2 categories)
 * Phase 3 (Gates 8-10): AND conditions with 3 categories for mastery
 *
 * Total Duration: 50 polls = ~7 weeks of daily play
 */
export const CI_GATES: GateDefinition[] = [
	// Phase 1: Learning & Strategy (Gates 1-4)
	{
		gate: 1,
		requirements: [{ threshold: 2, requiredCategories: 1 }],
		evaluationMode: "OR",
	},
	{
		gate: 2,
		requirements: [
			{ threshold: 4, requiredCategories: 1 },
			{ threshold: 2, requiredCategories: 2 },
		],
		evaluationMode: "OR",
	},
	{
		gate: 3,
		requirements: [
			{ threshold: 8, requiredCategories: 1 },
			{ threshold: 4, requiredCategories: 2 },
		],
		evaluationMode: "OR",
	},
	{
		gate: 4,
		requirements: [
			{ threshold: 12, requiredCategories: 1 },
			{ threshold: 6, requiredCategories: 2 }, // Fixed: was 12, now rewards diversification
		],
		evaluationMode: "OR",
	},
	// Phase 2: Mastery - Two Categories (Gates 5-7)
	{
		gate: 5,
		requirements: [
			{ threshold: 25, requiredCategories: 1 },
			{ threshold: 15, requiredCategories: 1 },
		],
		evaluationMode: "AND",
	},
	{
		gate: 6,
		requirements: [
			{ threshold: 35, requiredCategories: 1 },
			{ threshold: 20, requiredCategories: 1 },
		],
		evaluationMode: "AND",
	},
	{
		gate: 7,
		requirements: [
			{ threshold: 40, requiredCategories: 1 },
			{ threshold: 25, requiredCategories: 1 },
		],
		evaluationMode: "AND",
	},
	// Phase 3: Ultimate Challenge - Three Categories (Gates 8-10)
	{
		gate: 8,
		requirements: [
			{ threshold: 45, requiredCategories: 1 },
			{ threshold: 30, requiredCategories: 1 },
			{ threshold: 15, requiredCategories: 1 },
		],
		evaluationMode: "AND",
	},
	{
		gate: 9,
		requirements: [
			{ threshold: 50, requiredCategories: 1 },
			{ threshold: 35, requiredCategories: 1 },
			{ threshold: 20, requiredCategories: 1 },
		],
		evaluationMode: "AND",
	},
	{
		gate: 10,
		requirements: [
			{ threshold: 55, requiredCategories: 1 },
			{ threshold: 40, requiredCategories: 1 },
			{ threshold: 25, requiredCategories: 1 },
		],
		evaluationMode: "AND",
	},
];

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
	readonly currentRound: number;
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
 * @param totalPollsSeen - Total unique polls seen by user (from polls_history)
 * @returns Current round number (1-based, minimum 1)
 */
export const getCurrentRound = (totalPollsSeen: number): number => {
	if (totalPollsSeen === 0) return 1;
	return Math.floor((totalPollsSeen - 1) / POLLS_PER_ROUND) + 1;
};

/**
 * Determines the position within the current round (1-POLLS_PER_ROUND)
 *
 * @param totalPollsSeen - Total unique polls seen by user (from polls_history)
 * @returns Poll position within round (1-5)
 */
export const getPollInRound = (totalPollsSeen: number): number => {
	if (totalPollsSeen === 0) return 1;
	return ((totalPollsSeen - 1) % POLLS_PER_ROUND) + 1;
};

/**
 * Checks if the current poll is a threshold check poll (every POLLS_PER_ROUND poll)
 *
 * @param totalPollsSeen - Total unique polls seen by user (from polls_history)
 * @returns True if this is a threshold check poll (polls 5, 10, 15, etc.)
 */
export const isThresholdCheckPoll = (totalPollsSeen: number): boolean => {
	return totalPollsSeen > 0 && totalPollsSeen % POLLS_PER_ROUND === 0;
};

/**
 * Gets the gate definition for a given round
 * Returns null if round exceeds defined gates (uses last gate pattern)
 *
 * @param round - Current round number
 * @returns Gate definition or null
 */
export const getGateDefinition = (round: number): GateDefinition | null => {
	if (round <= 0) return null;

	// If we have a defined gate, return it
	if (round <= CI_GATES.length) {
		return CI_GATES[round - 1];
	}

	// For rounds beyond defined gates, extrapolate from last gate pattern
	const lastGate = CI_GATES[CI_GATES.length - 1];
	const roundsBeyond = round - CI_GATES.length;
	const incrementPerRound = 5;

	return {
		gate: round,
		requirements: lastGate.requirements.map((req) => ({
			threshold: req.threshold + roundsBeyond * incrementPerRound,
			requiredCategories: req.requiredCategories,
		})),
		evaluationMode: lastGate.evaluationMode,
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
 * @param totalPollsSeen - Total unique polls seen by user (from polls_history)
 * @returns Threshold information
 */
export const calculateThresholdInfo = (
	categoryCoverageData: readonly RunCategoryCoverage[],
	totalPollsSeen: number
): ThresholdInfo => {
	// Find the maximum coverage across all categories
	const maxCoverage = Math.max(
		...categoryCoverageData.map((coverage) => coverage.currentCoverage),
		0
	);

	// Calculate total polls answered (still used for pollNumber tracking)
	const totalPollsAnswered = categoryCoverageData.reduce(
		(sum, coverage) => sum + coverage.pollsAnswered,
		0
	);

	// Determine current round and gate based on SEEN polls
	const currentRound = getCurrentRound(totalPollsSeen);
	const pollInRound = getPollInRound(totalPollsSeen);
	const isThresholdCheck = isThresholdCheckPoll(totalPollsSeen);
	const gateDefinition = getGateDefinition(currentRound);

	// If no gate definition or not a threshold check, always pass
	if (!gateDefinition || !isThresholdCheck) {
		return {
			meetsThreshold: true,
			maxCoverage,
			pollNumber: totalPollsAnswered,
			currentRound,
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
		currentRound,
		pollInRound,
		isThresholdCheckPoll: isThresholdCheck,
		gateDefinition,
		requirementEvaluations,
		qualifyingCategories,
	};
};

/**
 * Get current threshold status from category data
 * @param categoryCoverage - Array of category coverage data
 * @param totalPollsSeen - Total unique polls seen by user (from polls_history)
 * @returns Threshold information
 */
export const getCurrentThresholdInfo = (
	categoryCoverage: readonly RunCategoryCoverage[],
	totalPollsSeen: number
): ThresholdInfo => {
	return calculateThresholdInfo(categoryCoverage, totalPollsSeen);
};
