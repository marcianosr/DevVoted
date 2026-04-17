import { applyEffects } from "~/domains/configs/data/configs";
import { getPollsSeenInRun } from "~/domains/polls/api/queries";
import type { PollWithOptionsResponse } from "~/domains/polls/models/poll";
import { handleUserSelectedOptionsByPollType } from "~/domains/polls/services/processPollAnswer.service";
import { getWindowSize } from "~/domains/runs/services/pipelineEvaluator.service";
import {
	orchestrateScoreCalculation,
	ScoreCalculation,
} from "~/domains/score/services/score.service";
import { CategoryCode } from "~/domains/shared/categories";

import { awardCoverageToRun, drainStorage } from "../api/queries";
import { Run } from "../models/run";
import { getStorageDrain } from "./pipeline.service";

type IncrementProgress = {
	categoryCode: CategoryCode;
	run: Run;
	correctnessFactor: number;
	poll: PollWithOptionsResponse["poll"];
	options: PollWithOptionsResponse["options"];
	hasAnswered: boolean;
};
type IncrementRunProgressResult = ScoreCalculation & {
	storageDrained: number;
};

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

	const pollsPerGate = getWindowSize(run.pipelineSlots);

	// Step 2-3: Calculate coverage with config modifiers applied
	const {
		breakdown,
		newBestStreak,
		newStreak,
		newPollsAnswered,
		newTotalCoverage,
	} = orchestrateScoreCalculation({
		correctnessFactor,
		currentBestStreak: currentCategoryCoverage.bestStreak,
		currentCoverage: currentCategoryCoverage.currentCoverage,
		currentStreak: currentCategoryCoverage.currentStreak,
		totalPollsAnswered,
		totalPollsSeen,
		pollsPerGate,
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
		currentCategoryCoverage.pollsAnswered + 1 // Increment poll count
	);

	// Step 5: Apply storage drain if wrong answer and drain slot is active
	const storageDrained = getStorageDrain(
		run.pipelineSlots,
		correctnessFactor === 0
	);

	if (storageDrained > 0) {
		await drainStorage(run.id, storageDrained);
	}

	return {
		breakdown,
		newTotalCoverage,
		newStreak,
		newBestStreak,
		newPollsAnswered,
		storageDrained,
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

	const pollsPerGate = getWindowSize(run.pipelineSlots);

	// When already answered, the DB has been updated with the new values.
	// Use the previous streak (before the answer) to avoid double-incrementing.
	const streakBeforeAnswer = hasAnswered
		? Math.max(0, (currentCategoryCoverage?.currentStreak ?? 1) - 1)
		: (currentCategoryCoverage?.currentStreak ?? 0);

	const result = orchestrateScoreCalculation({
		correctnessFactor,
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
		coverageAdd: coverageMods.coverageAdd ?? 0,
		coverageMult: coverageMods.coverageMult ?? 1,
	});

	return result;
};
