import {
	fetchAllPolls,
	fetchPollById,
	fetchPollByIdWithOptions,
	hasUserAnsweredPoll,
} from "~/domains/polls/api/queries";
import { getDailyPollWithOptions } from "~/domains/polls/services/dailyPoll.service";
import {
	pollSubmissionSchema,
	type PollSubmissionInput,
} from "~/domains/polls/validation/schemas";
import { processPollAnswer } from "~/domains/polls/services/processPollAnswer.service";
import { handleApiOperation } from "~/utils/errorHandling";
import { db } from "~/database/db";
import { pollOptionsTable } from "~/database/schema";
import { eq, and, inArray } from "drizzle-orm";

export const getPollByIdWithOptionsHandler = async ({
	data,
}: {
	data: { id: number; userId?: string };
}) => {
	return handleApiOperation(async () => {
		const { id, userId } = data;

		const { poll, options } = await fetchPollByIdWithOptions(id);
		const hasAnswered = userId
			? await hasUserAnsweredPoll(id, userId)
			: false;

		return { poll, options, hasAnswered };
	});
};

export const getPollByIdHandler = async ({
	data,
}: {
	data: { id: number };
}) => {
	return handleApiOperation(async () => {
		return await getPollOrError(data.id);
	});
};

export const getAllPollsHandler = async () => {
	return handleApiOperation(async () => {
		return await fetchAllPolls();
	});
};

export const getDailyPollHandler = async ({
	data,
}: {
	data: { userId?: string; date?: string };
}) => {
	return handleApiOperation(async () => {
		const { userId, date } = data;

		const { poll, options } = await getDailyPollWithOptions(date);
		const hasAnswered = userId
			? await hasUserAnsweredPoll(poll.id, userId)
			: false;

		return { poll, options, hasAnswered };
	});
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
