import { selectSeededRandom } from "~/lib/seededRandom";
import { getTodayDateString } from "~/lib/dateUtils";
import { fetchPollByIdWithOptions } from "~/domains/polls/api/queries";
import type { Poll } from "~/domains/polls/models/poll";
import { pollFactory } from "~/domains/polls/models/poll";
import { db } from "~/database/db";
import { pollsTable } from "~/database/schema";
import { eq } from "drizzle-orm";

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
 * Select daily poll using deterministic seeded selection with race condition protection
 * The same date will always return the same poll for all users
 * Uses database transaction to prevent multiple polls from being opened simultaneously
 */
export const selectDailyPoll = async (date?: string): Promise<Poll | null> => {
	// Use provided date or today's date as seed for deterministic selection
	const dateSeed = getDateSeed(date);

	return await db.transaction(async (tx) => {
		// Get all polls within transaction for consistent state
		const allPollRecords = await tx.select().from(pollsTable);
		const allPolls = pollFactory.toDTOs(allPollRecords);
		const openPolls = allPolls.filter((poll) => poll.status === "open");

		// If there's already an open poll, use seeded selection to find today's poll
		if (openPolls.length > 0) {
			const todaysOpenPoll = selectSeededRandom(openPolls, dateSeed);
			if (todaysOpenPoll) {
				console.log(
					"Found existing open poll for today:",
					todaysOpenPoll.id
				);
				return todaysOpenPoll;
			}
		}

		// No open polls found, select a new one from all closed polls
		const closedPolls = allPolls.filter((poll) => poll.status === "closed");

		if (closedPolls.length === 0) {
			console.log("No closed polls available to open");
			return null;
		}

		// Select one poll deterministically based on the date
		const selectedPoll = selectSeededRandom(closedPolls, dateSeed);

		if (!selectedPoll) {
			return null;
		}

		// Open the selected poll atomically within transaction
		await tx
			.update(pollsTable)
			.set({ status: "open" })
			.where(eq(pollsTable.id, selectedPoll.id));

		console.log("selectDailyPoll called with date:", date);
		console.log("Final dateSeed used:", dateSeed);
		console.log("Number of closed polls:", closedPolls.length);
		console.log("Selected and opened poll ID:", selectedPoll.id);

		return selectedPoll;
	});
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
