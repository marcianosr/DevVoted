import type { RunCategoryCoverage } from "~/domains/runs/models/runCategoryCoverage";

// ─── Requirement types ────────────────────────────────────────────────────────

export type CoverageRequirement = {
	type: "coverage";
	threshold: number;
	requiredCategories: number;
};

export type CorrectAnswersRequirement = {
	type: "correct-answers";
	count: number; // minimum total correct polls in the run
};

export type GateRequirement = CoverageRequirement | CorrectAnswersRequirement;

// ─── Gate definition ──────────────────────────────────────────────────────────

/**
 * CI Gate definition with flexible OR/AND conditions
 * - OR mode: At least one requirement must be met
 * - AND mode: All requirements must be met (using different categories for coverage requirements)
 */
export type GateDefinition = {
	gate: number;
	requirements: GateRequirement[];
	evaluationMode: "OR" | "AND";
	pollsPerGate: number;
};

// ─── Evaluation context ───────────────────────────────────────────────────────

export type EvaluationContext = {
	readonly categoryCoverageData: readonly RunCategoryCoverage[];
	readonly totalPollsSeen: number;
	readonly correctPollsCount: number;
};

// ─── Evaluation results ───────────────────────────────────────────────────────

type RequirementEvaluation = {
	requirement: GateRequirement;
	met: boolean;
	qualifyingCategories: readonly string[]; // populated only for coverage type
};

/**
 * Threshold calculation result
 */
export type ThresholdInfo = {
	readonly meetsThreshold: boolean;
	readonly maxCoverage: number;
	readonly pollNumber: number;
	readonly currentGate: number;
	readonly pollInRound: number;
	readonly isThresholdCheckPoll: boolean;
	readonly gateDefinition: GateDefinition | null;
	readonly requirementEvaluations: readonly RequirementEvaluation[];
	readonly qualifyingCategories: readonly string[];
};

// ─── Post-victory scaling ─────────────────────────────────────────────────────

const POST_VICTORY_THRESHOLD_INCREMENT = 5;

/**
 * Generates a virtual gate for post-victory mode.
 * Only scales `coverage` requirement thresholds — other requirement types pass through unchanged.
 */
export const generatePostVictoryGate = (
	lastDefinedGate: GateDefinition,
	gateNumber: number
): GateDefinition => {
	const gatesBeyondLast = gateNumber - lastDefinedGate.gate;
	const thresholdIncrease = gatesBeyondLast * POST_VICTORY_THRESHOLD_INCREMENT;

	return {
		gate: gateNumber,
		requirements: lastDefinedGate.requirements.map((req): GateRequirement => {
			if (req.type === "coverage") {
				return {
					...req,
					threshold: Math.min(req.threshold + thresholdIncrease, 100),
				};
			}
			return req;
		}),
		evaluationMode: lastDefinedGate.evaluationMode,
		pollsPerGate: lastDefinedGate.pollsPerGate,
	};
};

// ─── Gate lookup ──────────────────────────────────────────────────────────────

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

	const lastGate = gates[gates.length - 1];
	const pollsBeyondDefined = totalPollsSeen - pollsAccumulated;
	const postVictoryGateNumber =
		lastGate.gate + Math.floor(pollsBeyondDefined / lastGate.pollsPerGate) + 1;

	return generatePostVictoryGate(lastGate, postVictoryGateNumber);
};

export const getPollInRound = (
	totalPollsSeen: number,
	gate: GateDefinition
): number => {
	if (totalPollsSeen === 0) return 1;
	return ((totalPollsSeen - 1) % gate.pollsPerGate) + 1;
};

export const isThresholdCheckPoll = (
	totalPollsSeen: number,
	gate: GateDefinition
): boolean => {
	return totalPollsSeen > 0 && totalPollsSeen % gate.pollsPerGate === 0;
};

export const getGateDefinition = (
	round: number,
	gates: GateDefinition[]
): GateDefinition | null => {
	if (round <= 0 || gates.length === 0) return null;

	if (round <= gates.length) {
		return gates[round - 1];
	}

	const lastGate = gates[gates.length - 1];
	const roundsBeyond = round - gates.length;
	const incrementPerRound = 5;

	return {
		gate: round,
		requirements: lastGate.requirements.map((req): GateRequirement => {
			if (req.type === "coverage") {
				return {
					...req,
					threshold: req.threshold + roundsBeyond * incrementPerRound,
				};
			}
			return req;
		}),
		evaluationMode: lastGate.evaluationMode,
		pollsPerGate: lastGate.pollsPerGate,
	};
};

// ─── Per-type evaluators ──────────────────────────────────────────────────────

const evaluateCoverageRequirement = (
	req: CoverageRequirement,
	context: EvaluationContext,
	excludeCategories: Set<string>
): RequirementEvaluation => {
	const qualifyingCategories = context.categoryCoverageData
		.filter(
			(coverage) =>
				coverage.currentCoverage >= req.threshold &&
				!excludeCategories.has(coverage.categoryCode)
		)
		.map((coverage) => coverage.categoryCode);

	return {
		requirement: req,
		met: qualifyingCategories.length >= req.requiredCategories,
		qualifyingCategories,
	};
};

const evaluateCorrectAnswersRequirement = (
	req: CorrectAnswersRequirement,
	context: EvaluationContext
): RequirementEvaluation => ({
	requirement: req,
	met: context.correctPollsCount >= req.count,
	qualifyingCategories: [],
});

const evaluateRequirement = (
	requirement: GateRequirement,
	context: EvaluationContext,
	excludeCategories: Set<string> = new Set()
): RequirementEvaluation => {
	switch (requirement.type) {
		case "coverage":
			return evaluateCoverageRequirement(
				requirement,
				context,
				excludeCategories
			);
		case "correct-answers":
			return evaluateCorrectAnswersRequirement(requirement, context);
	}
};

// ─── Core threshold calculation ───────────────────────────────────────────────

/**
 * Core threshold calculation logic.
 * Evaluates gate requirements with OR/AND logic.
 */
export const calculateThresholdInfo = (
	context: EvaluationContext,
	gates: GateDefinition[]
): ThresholdInfo => {
	const { categoryCoverageData, totalPollsSeen } = context;

	const maxCoverage = Math.max(
		...categoryCoverageData.map((xp) => xp.currentCoverage),
		0
	);

	const totalPollsAnswered = categoryCoverageData.reduce(
		(sum, xp) => sum + xp.pollsAnswered,
		0
	);

	const currentGate = getCurrentGate(totalPollsSeen, gates);
	const pollInRound = getPollInRound(totalPollsSeen, currentGate);
	const isThresholdCheck = isThresholdCheckPoll(totalPollsSeen, currentGate);
	const gateDefinition = getGateDefinition(currentGate.gate, gates);

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
		requirementEvaluations = gateDefinition.requirements.map((req) =>
			evaluateRequirement(req, context)
		);

		meetsThreshold = requirementEvaluations.some(
			(evaluation) => evaluation.met
		);

		const firstMetRequirement = requirementEvaluations.find(
			(evaluation) => evaluation.met
		);
		qualifyingCategories = firstMetRequirement
			? [...firstMetRequirement.qualifyingCategories]
			: [];
	} else {
		// AND mode: all requirements must be met.
		// For coverage requirements, categories are excluded once used.
		// Non-coverage requirements evaluate independently.
		const usedCategories = new Set<string>();

		for (const requirement of gateDefinition.requirements) {
			const evaluation = evaluateRequirement(
				requirement,
				context,
				usedCategories
			);
			requirementEvaluations.push(evaluation);

			if (evaluation.met && requirement.type === "coverage") {
				const categoriesToUse = evaluation.qualifyingCategories.slice(
					0,
					requirement.requiredCategories
				);
				categoriesToUse.forEach((cat) => usedCategories.add(cat));
				qualifyingCategories.push(...categoriesToUse);
			}
		}

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
