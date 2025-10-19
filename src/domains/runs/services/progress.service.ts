import {
	orchestrateScoreCalculation,
	ScoreCalculation,
} from "~/domains/score/services/score.service";
import { awardCoverageToRun } from "../api/queries";
import { Run } from "../models/run";
import { CategoryCode } from "~/domains/shared/categories";
import { applyEffects } from "~/domains/configs/data/configs";
import type { PollWithOptionsResponse } from "~/domains/polls/models/poll";

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
 * Increments run progress after answering a poll.
 *
 * Complete Flow:
 * 1. Apply config effects to get coverage modifiers (e.g., +0.5% from .js config)
 * 2. Calculate coverage earned based on correctness (1% per correct, up to 1.5% for perfect multi-choice)
 * 3. Apply coverage modifiers from configs (multiplicative then additive)
 * 4. Update database with new coverage and streak values
 *
 * @param categoryCode - The category of the answered poll
 * @param run - Current run with category data and active configs
 * @param correctnessFactor - How well the poll was answered (0-1.5)
 * @param poll - The poll that was answered
 * @param options - The poll's options
 * @param hasAnswered - Whether the user has already answered
 * @returns Score breakdown and updated totals
 */
export const incrementRunProgress = async ({
	categoryCode,
	run,
	correctnessFactor,
	poll,
	options,
	hasAnswered,
}: IncrementProgress): Promise<IncrementRunProgressResult> => {
	const currentCategoryXP = run.categoryCoverage.find(
		(xp) => xp.categoryCode === categoryCode
	);

	if (!currentCategoryXP) {
		throw new Error(`Category ${categoryCode} not found`);
	}

	// Calculate total polls answered across all categories
	const totalPollsAnswered = run.categoryCoverage.reduce(
		(sum, xp) => sum + xp.pollsAnswered,
		0
	);

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

	// Step 2-3: Calculate coverage with config modifiers applied
	const {
		breakdown,
		newBestStreak,
		newStreak,
		newPollsAnswered,
		newTotalCoverage,
	} = orchestrateScoreCalculation({
		correctnessFactor,
		currentBestStreak: currentCategoryXP.bestStreak,
		currentCoverage: currentCategoryXP.currentCoverage,
		currentStreak: currentCategoryXP.currentStreak,
		totalPollsAnswered,
		coverageAdd: coverageMods.coverageAdd ?? 0,
		coverageMult: coverageMods.coverageMult ?? 1,
	});

	// Step 4: Persist updated values to database
	await awardCoverageToRun(
		run.id,
		categoryCode,
		newTotalCoverage, // New total coverage for the category
		newStreak, // Current streak (0 if wrong answer)
		newBestStreak, // Best streak ever achieved
		currentCategoryXP.pollsAnswered + 1 // Increment poll count
	);

	return {
		breakdown,
		newTotalCoverage,
		newStreak,
		newBestStreak,
		newPollsAnswered,
	};
};
