import { selectSeededRandom } from "~/lib/seededRandom";
import { getTodayDateString } from "~/lib/dateUtils";
import {
	fetchAllPolls,
	fetchPollByIdWithOptions,
} from "~/domains/polls/api/queries";
import type { Poll } from "~/domains/polls/models/poll";

/**
 * Get today's date in YYYY-MM-DD format for consistent daily seeding
 */
export const getTodayDateSeed = () => getTodayDateString();

/**
 * Get date seed from provided date or fallback to today
 */
export const getDateSeed = (date?: string): string => {
	return date || getTodayDateSeed();
};

/**
 * Select daily poll using deterministic seeded selection
 * The same date will always return the same poll for all users
 */
export const selectDailyPoll = async (date?: string): Promise<Poll | null> => {
	// Get all polls that are currently "open"
	const allPolls = await fetchAllPolls();
	const openPolls = allPolls.filter((poll) => poll.status === "open");

	if (openPolls.length === 0) {
		return null;
	}

	// Use provided date or today's date as seed for deterministic selection
	const dateSeed = getDateSeed(date);

	// Select one poll deterministically based on the date
	const selectedPoll = selectSeededRandom(openPolls, dateSeed);

	return selectedPoll;
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
