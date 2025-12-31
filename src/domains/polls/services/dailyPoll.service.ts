import {
	fetchPollByIdWithOptions,
	getOrCreateDailyPoll,
	snapshotDailyWeights,
} from "~/domains/polls/api/queries";
import type { Poll } from "~/domains/polls/models/poll";
import {
	calculateCategoryWeights,
	type CategoryWeights,
} from "~/domains/polls/services/categoryWeight.service";
import { getAllActiveConfigIds } from "~/domains/runs/api/queries";
import { getTodayDateString } from "~/lib/dateUtils";
import {
	selectSeededRandom,
	selectWeightedSeededRandom,
} from "~/lib/seededRandom";

export const getTodayDateSeed = () => getTodayDateString();

export const getDateSeed = (date?: string): string => {
	return date || getTodayDateSeed();
};

/**
 * Select daily poll using deterministic seeded selection with category weights
 * The same date will always return the same poll for all users
 * Uses daily_polls table for O(1) lookup on subsequent requests
 *
 * If category_weights were snapshotted at midnight, uses weighted selection.
 * Otherwise falls back to equal probability selection.
 */
export const selectDailyPoll = async (date?: string): Promise<Poll | null> => {
	const dateSeed = getDateSeed(date);

	// Unweighted fallback selection
	const selectPollForDate = (polls: Poll[]) =>
		selectSeededRandom(polls, dateSeed);

	// Weighted selection using stored category weights
	const selectWeightedPollForDate = (
		polls: { id: number; categoryCode: string }[],
		weights: CategoryWeights
	) => {
		const weightedPolls = polls.map((poll) => ({
			item: poll,
			weight: weights[poll.categoryCode as keyof CategoryWeights] ?? 1.0,
		}));
		return selectWeightedSeededRandom(weightedPolls, dateSeed);
	};

	const result = await getOrCreateDailyPoll(
		dateSeed,
		selectPollForDate,
		selectWeightedPollForDate
	);

	if (process.env.NODE_ENV === "development") {
		if (result) {
			console.info("selectDailyPoll called with date:", date);
			console.info("Final dateSeed used:", dateSeed);
			console.info("Selected poll ID:", result.id);
		} else {
			console.info("No polls available to open");
		}
	}

	return result;
};

/**
 * Get daily poll with its options for a specific date
 * Returns the complete poll data needed for display
 */
export const getDailyPollWithOptions = async (date?: string) => {
	const dailyPoll = await selectDailyPoll(date);

	if (!dailyPoll) {
		throw new Error("No daily poll available");
	}
	// Get the poll with its options using existing function
	const pollWithOptions = await fetchPollByIdWithOptions(dailyPoll.id);

	return pollWithOptions;
};

/**
 * Snapshot global category weights for a specific date.
 * Intended to be called at midnight (via cron) for the next day.
 *
 * Aggregates all active configs across all active runs and calculates
 * combined category weights. These weights affect poll selection probability.
 *
 * @param targetDate - The date to snapshot weights for (format: "YYYY-MM-DD")
 * @returns The calculated weights that were stored
 */
export const snapshotGlobalWeightsForDate = async (
	targetDate: string
): Promise<CategoryWeights> => {
	const allActiveConfigIds = await getAllActiveConfigIds();
	const weights = calculateCategoryWeights(allActiveConfigIds);

	await snapshotDailyWeights(targetDate, weights);

	if (process.env.NODE_ENV === "development") {
		console.info("Snapshotted weights for date:", targetDate);
		console.info("Active configs count:", allActiveConfigIds.length);
		console.info("Calculated weights:", weights);
	}

	return weights;
};
