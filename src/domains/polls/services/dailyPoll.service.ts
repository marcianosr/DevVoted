import {
	fetchPollByIdWithOptions,
	getOrCreateDailyPoll,
} from "~/domains/polls/api/queries";
import type { Poll } from "~/domains/polls/models/poll";
import { type CategoryWeights } from "~/domains/polls/services/categoryWeight.service";
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
