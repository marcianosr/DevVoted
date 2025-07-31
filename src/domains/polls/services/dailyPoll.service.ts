import { selectSeededRandom } from "~/lib/seededRandom";
import { getTodayDateString } from "~/lib/dateUtils";
import {
	fetchPollByIdWithOptions,
	manageDailyPollTransition,
} from "~/domains/polls/api/queries";
import type { Poll } from "~/domains/polls/models/poll";

export const getTodayDateSeed = () => getTodayDateString();

export const getDateSeed = (date?: string): string => {
	return date || getTodayDateSeed();
};

/**
 * Select daily poll using deterministic seeded selection with race condition protection
 * The same date will always return the same poll for all users
 * Uses database transaction to prevent multiple polls from being opened simultaneously
 */
export const selectDailyPoll = async (date?: string): Promise<Poll | null> => {
	const dateSeed = getDateSeed(date);

	const selectPollForDate = (polls: Poll[]) =>
		selectSeededRandom(polls, dateSeed);

	const result = await manageDailyPollTransition(selectPollForDate);

	if (result) {
		console.log("selectDailyPoll called with date:", date);
		console.log("Final dateSeed used:", dateSeed);
		console.log("Selected poll ID:", result.id);
	} else {
		console.log("No polls available to open");
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
