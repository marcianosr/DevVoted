import { applyEffects } from "~/domains/configs/data/configs";
import { getCurrentGateWithType } from "~/domains/gates/api/queries";
import type { GateModifierConfig } from "~/domains/gates/models/gateType";
import { getPollsSeenInRun } from "~/domains/polls/api/queries";
import type { PollWithOptionsResponse } from "~/domains/polls/models/poll";
import { handleUserSelectedOptionsByPollType } from "~/domains/polls/services/processPollAnswer.service";
import {
	orchestrateScoreCalculation,
	ScoreCalculation,
} from "~/domains/score/services/score.service";
import { CategoryCode } from "~/domains/shared/categories";

import { awardCoverageToRun } from "../api/queries";
import { Run } from "../models/run";

type IncrementProgress = {
	categoryCode: CategoryCode;
	run: Run;
	correctnessFactor: number;
	poll: PollWithOptionsResponse["poll"];
	options: PollWithOptionsResponse["options"];
	hasAnswered: boolean;
};
type IncrementRunProgressResult = ScoreCalculation;

/**
 * Checks if a category is allowed to earn coverage based on gate modifiers.
 * If categoryWhitelist is set, only listed categories earn coverage.
 */
const isCategoryAllowedByGate = (
	categoryCode: CategoryCode,
	modifierConfig: GateModifierConfig
): boolean => {
	if (!modifierConfig.categoryWhitelist) return true;
	return modifierConfig.categoryWhitelist.includes(categoryCode);
};

/**
 * Increments run progress after answering a poll.
 *
 * Complete Flow:
 * 1. Check if category is allowed by gate modifiers (e.g., 418 teapot whitelist)
 * 2. Apply config effects to get coverage modifiers (e.g., +0.5% from .js config)
 * 3. Calculate coverage earned based on correctness (1% per correct, up to 1.5% for perfect multi-choice)
 * 4. Apply gate modifiers (correctAnswerCoverageMult, extendedStreak bonuses)
 * 5. Update database with new coverage and streak values
 */
export const incrementRunProgress = async ({
	categoryCode,
	run,
	correctnessFactor,
	poll,
	options,
	hasAnswered,
}: IncrementProgress): Promise<IncrementRunProgressResult> => {
	const currentCategoryCoverage = run.categoryCoverage.find(
		(coverage) => coverage.categoryCode === categoryCode
	);

	if (!currentCategoryCoverage) {
		throw new Error(`Category ${categoryCode} not found`);
	}

	// Calculate total polls answered across all categories
	const totalPollsAnswered = run.categoryCoverage.reduce(
		(sum, coverage) => sum + coverage.pollsAnswered,
		0
	);

	// Get total polls seen in current run for round calculation
	const totalPollsSeen = await getPollsSeenInRun(run.id);

	// Step 1: Apply config effects to get coverage modifiers
	const effectCtx = {
		poll,
		options,
		hasAnswered,
		run,
	};

	const { coverage: coverageMods } = applyEffects(
		effectCtx,
		run.activeConfigIds
	);

	// Get gate info including all modifier config
	const currentGate = await getCurrentGateWithType(run.id);
	const { modifierConfig } = currentGate.gateType;
	const pollsPerGate = currentGate.gateType.pollsPerGate;

	// Check category whitelist — if category is blocked, zero out the coverage
	const categoryAllowed = isCategoryAllowedByGate(categoryCode, modifierConfig);

	// Calculate coverage with config modifiers applied
	const {
		breakdown,
		newBestStreak,
		newStreak,
		newPollsAnswered,
		newTotalCoverage,
	} = orchestrateScoreCalculation({
		correctnessFactor: categoryAllowed ? correctnessFactor : 0,
		currentBestStreak: currentCategoryCoverage.bestStreak,
		currentCoverage: currentCategoryCoverage.currentCoverage,
		currentStreak: currentCategoryCoverage.currentStreak,
		totalPollsAnswered,
		totalPollsSeen,
		pollsPerGate,
		gateModifiers: modifierConfig,
		coverageAdd: coverageMods.coverageAdd ?? 0,
		coverageMult: coverageMods.coverageMult ?? 1,
	});

	// Persist updated values to database
	await awardCoverageToRun(
		run.id,
		categoryCode,
		newTotalCoverage, // New total coverage for the category
		newStreak, // Current streak (0 if wrong answer)
		newBestStreak, // Best streak ever achieved
		currentCategoryCoverage.pollsAnswered + 1 // Increment poll count
	);

	return {
		breakdown,
		newTotalCoverage,
		newStreak,
		newBestStreak,
		newPollsAnswered,
	};
};

// NEW Progress function

type GetRunProgressParams = {
	selectedOptions: string[];
	poll: PollWithOptionsResponse["poll"];
	options: PollWithOptionsResponse["options"];
	hasAnswered: boolean;
	run: Run;
};
export const getRunProgress = async ({
	selectedOptions,
	poll,
	options,
	hasAnswered,
	run,
}: GetRunProgressParams) => {
	const currentCategoryCoverage = run.categoryCoverage.find(
		(coverage) => coverage.categoryCode === poll.categoryCode
	);

	const { correctnessFactor } = await handleUserSelectedOptionsByPollType({
		pollId: poll.id,
		selectedOptionIds: selectedOptions.map((id) => Number(id)),
	});

	const totalPollsSeen = await getPollsSeenInRun(run.id);

	const effectCtx = {
		poll,
		options,
		hasAnswered,
		run,
	};

	const { coverage: coverageMods } = applyEffects(
		effectCtx,
		run.activeConfigIds
	);

	// Get gate info including all modifier config
	const currentGate = await getCurrentGateWithType(run.id);
	const { modifierConfig } = currentGate.gateType;
	const pollsPerGate = currentGate.gateType.pollsPerGate;

	// Check category whitelist
	const categoryAllowed = isCategoryAllowedByGate(
		poll.categoryCode as CategoryCode,
		modifierConfig
	);

	// When already answered, the DB has been updated with the new values.
	// Use the previous streak (before the answer) to avoid double-incrementing.
	const streakBeforeAnswer = hasAnswered
		? Math.max(0, (currentCategoryCoverage?.currentStreak ?? 1) - 1)
		: (currentCategoryCoverage?.currentStreak ?? 0);

	const result = orchestrateScoreCalculation({
		correctnessFactor: categoryAllowed ? correctnessFactor : 0,
		currentBestStreak: currentCategoryCoverage
			? currentCategoryCoverage.bestStreak
			: 0,
		currentCoverage: currentCategoryCoverage
			? currentCategoryCoverage.currentCoverage
			: 0,
		currentStreak: streakBeforeAnswer,
		totalPollsAnswered: 0, // Placeholder until we fetch actual data
		totalPollsSeen,
		pollsPerGate,
		gateModifiers: modifierConfig,
		coverageAdd: coverageMods.coverageAdd ?? 0,
		coverageMult: coverageMods.coverageMult ?? 1,
	});

	return result;
};
