import {
	fetchAllPolls,
	fetchPollById,
	fetchPollByIdWithOptions,
	createPollResponse,
	hasUserAnsweredPoll,
} from "~/domains/polls/api/queries";
import {
	pollSubmissionSchema,
	type PollSubmissionInput,
} from "~/domains/polls/validation/schemas";
import {
	getActiveRunByUserId,
	awardXpToRun,
	checkXpThreshold,
	endRunForThresholdFailure,
} from "~/domains/runs/api/queries";
import { calculateMultipleChoiceXP } from "~/domains/userPerformance/constants/xpSystem";
import { db } from "~/database/db";
import { pollOptionsTable } from "~/database/schema";
import { eq, and, inArray } from "drizzle-orm";

export const getPollByIdWithOptionsHandler = async ({
	data,
}: {
	data: { id: number; userId?: string };
}) => {
	try {
		const { id, userId } = data;

		const { poll, options } = await fetchPollByIdWithOptions(id);
		const hasAnswered = userId
			? await hasUserAnsweredPoll(id, userId)
			: false;

		return { success: true, data: { poll, options, hasAnswered } };
	} catch (error) {
		console.error("Error fetching poll:", error);
		const message =
			error instanceof Error ? error.message : "Something went wrong";
		return { success: false, error: message };
	}
};

export const getPollByIdHandler = async ({
	data,
}: {
	data: { id: number };
}) => {
	try {
		const poll = await getPollOrError(data.id);

		return {
			success: true,
			data: poll,
		};
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Something went wrong";
		return { success: false, error: message };
	}
};

export const getAllPollsHandler = async () => {
	try {
		const polls = await fetchAllPolls();

		return {
			success: true,
			data: polls,
		};
	} catch (error) {
		console.error("Error fetching polls:", error);
		const message =
			error instanceof Error ? error.message : "Something went wrong";
		return { success: false, error: message };
	}
};

export const postPollOptionsHandler = async ({
	data,
}: {
	data: PollSubmissionInput;
}) => {
	try {
		// Validate input data
		const validatedData = pollSubmissionSchema.parse(data);
		const { pollId, selectedOptions, userId } = validatedData;

		// Check if user has already answered this poll
		const hasAnswered = await hasUserAnsweredPoll(pollId, userId);
		if (hasAnswered) {
			throw new Error("You have already answered this poll");
		}

		// Verify the poll exists
		const poll = await fetchPollById(pollId);

		if (!poll) {
			throw new Error("Poll not found");
		}

		// Convert string option IDs to numbers for the DB
		const selectedOptionIds = selectedOptions.map((option) =>
			Number(option)
		);

		// Get all correct options for this poll to calculate total possible correct answers
		const allCorrectOptions = await db
			.select()
			.from(pollOptionsTable)
			.where(
				and(
					eq(pollOptionsTable.poll_id, pollId),
					eq(pollOptionsTable.correct, true)
				)
			);

		// Get selected options from database to validate and calculate XP
		const selectedOptionRecords = await db
			.select()
			.from(pollOptionsTable)
			.where(
				and(
					eq(pollOptionsTable.poll_id, pollId),
					inArray(pollOptionsTable.id, selectedOptionIds)
				)
			);

		// Calculate XP using multiple choice formula
		const nCorrect = selectedOptionRecords.filter(
			(option) => option.correct
		).length;
		const nWrong = selectedOptionRecords.filter(
			(option) => !option.correct
		).length;
		const nTotal = allCorrectOptions.length; // Total correct answers available, not selected
		const xpEarned = calculateMultipleChoiceXP(nCorrect, nTotal, nWrong);

		// Determine if answer is completely correct (all selected options are correct)
		const isCorrect =
			selectedOptionRecords.length > 0 &&
			selectedOptionRecords.every((option) => option.correct);

		// Create the poll response and link it to the selected options
		await createPollResponse({
			pollId,
			userId,
			selectedOptionIds,
		});

		// Handle XP based on answer correctness
		let runEnded = false;
		let thresholdInfo = null;

		try {
			// Get user's active run
			const activeRun = await getActiveRunByUserId(userId);

			if (activeRun) {
				// Always award XP (even if 0) to increment polls_answered count
				await awardXpToRun(
					activeRun.id,
					poll.categoryCode,
					xpEarned
				);

				// Check threshold after awarding XP
				thresholdInfo = await checkXpThreshold(activeRun.id);
				
				// End run if threshold is not met
				if (!thresholdInfo.meetsThreshold) {
					await endRunForThresholdFailure(activeRun.id);
					runEnded = true;
				}
			}
		} catch (xpError) {
			console.error("Error handling XP:", xpError);
			// Don't fail the whole operation if XP handling fails
		}

		return {
			success: true,
			message: "Options submitted successfully",
			data: { 
				isCorrect, 
				runEnded, 
				xpEarned, 
				thresholdInfo 
			},
		};
	} catch (error) {
		console.error("Error submitting poll options:", error);
		const message =
			error instanceof Error ? error.message : "Something went wrong";
		return { success: false, error: message };
	}
};

async function getPollOrError(id: number) {
	const poll = await fetchPollById(id);
	if (!poll) throw new Error("Poll not found");
	return poll;
}
