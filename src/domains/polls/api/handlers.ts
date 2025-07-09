import {
	fetchAllPolls,
	fetchPollById,
	fetchPollByIdWithOptions,
	hasUserAnsweredPoll,
} from "~/domains/polls/api/queries";
import {
	pollSubmissionSchema,
	type PollSubmissionInput,
} from "~/domains/polls/validation/schemas";
import { processPollAnswer } from "~/services/pollAnswerService";
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
		const validatedData = pollSubmissionSchema.parse(data);
		const { pollId, selectedOptions, userId } = validatedData;

		const hasAnswered = await hasUserAnsweredPoll(pollId, userId);
		if (hasAnswered) {
			throw new Error("You have already answered this poll");
		}

		const poll = await fetchPollById(pollId);

		if (!poll) {
			throw new Error("Poll not found");
		}

		const selectedOptionIds = selectedOptions.map((option) =>
			Number(option)
		);

		const allCorrectOptions = await db
			.select()
			.from(pollOptionsTable)
			.where(
				and(
					eq(pollOptionsTable.poll_id, pollId),
					eq(pollOptionsTable.correct, true)
				)
			);

		const selectedOptionRecords = await db
			.select()
			.from(pollOptionsTable)
			.where(
				and(
					eq(pollOptionsTable.poll_id, pollId),
					inArray(pollOptionsTable.id, selectedOptionIds)
				)
			);

		const nCorrect = selectedOptionRecords.filter(
			(option) => option.correct
		).length;
		const nWrong = selectedOptionRecords.filter(
			(option) => !option.correct
		).length;
		const nTotal = allCorrectOptions.length;

		const isCorrect =
			selectedOptionRecords.length > 0 &&
			selectedOptionRecords.every((option) => option.correct);

		const { xpEarned, runEnded, thresholdInfo } = await processPollAnswer({
			pollId,
			userId,
			selectedOptionIds,
			categoryCode: poll.categoryCode,
			nCorrect,
			nTotal,
			nWrong,
		});

		return {
			success: true,
			message: "Options submitted successfully",
			data: {
				isCorrect,
				runEnded,
				xpEarned,
				thresholdInfo,
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
