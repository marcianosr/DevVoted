import {
	fetchAllPolls,
	fetchPollById,
	fetchPollByIdWithOptions,
	hasUserAnsweredPoll,
	countUserPollAnswers,
	getAllPollsWithUserStats,
} from "~/domains/polls/api/queries";
import { getDailyPollWithOptions } from "~/domains/polls/services/dailyPoll.service";
import {
	pollSubmissionSchema,
	type PollSubmissionInput,
} from "~/domains/polls/validation/schemas";
import { processPollAnswer } from "~/domains/polls/services/processPollAnswer.service";
import { handleApiOperation } from "~/utils/errorHandling";

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
		const timesAnswered = userId
			? await countUserPollAnswers(id, userId)
			: 0;

		console.log("timesAnswered", timesAnswered);

		return { poll, options, hasAnswered, timesAnswered };
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
		const timesAnswered = userId
			? await countUserPollAnswers(poll.id, userId)
			: 0;

		return { poll, options, hasAnswered, timesAnswered };
	});
};

export const postPollOptionsHandler = async ({
	data,
}: {
	data: PollSubmissionInput;
}) => {
	return handleApiOperation(async () => {
		const validatedData = await validatePollSubmission(data);

		// TODO: The start of posting to the DB (answers)
		const {
			breakdown,
			runEnded,
			thresholdInfo,
			selectedOptionIds,
			correctOptionIds,
			outcome,
		} = await processPollAnswer({
			pollId: validatedData.pollId,
			userId: validatedData.userId,
			selectedOptionIds: validatedData.selectedOptionIds,
			categoryCode: validatedData.poll.categoryCode,
		});

		console.log("Poll options submitted:", {
			breakdown,
		});

		return {
			message: "Options submitted successfully",
			selectOptions: selectedOptionIds,
			correctOptions: correctOptionIds,
			isCorrect: outcome === "full",
			runEnded,
			breakdown,
			thresholdInfo,
		};
	});
};

async function getPollOrError(id: number) {
	const poll = await fetchPollById(id);
	if (!poll) throw new Error("Poll not found");
	return poll;
}

type ValidatedPollSubmission = {
	pollId: number;
	selectedOptions: string[];
	userId: string;
	selectedOptionIds: number[];
	poll: NonNullable<Awaited<ReturnType<typeof fetchPollById>>>;
};

const validatePollSubmission = async (
	data: PollSubmissionInput
): Promise<ValidatedPollSubmission> => {
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

	const selectedOptionIds = selectedOptions.map((option) => Number(option));

	return {
		pollId,
		selectedOptions,
		userId,
		selectedOptionIds,
		poll,
	};
};

export const getAllPollsWithUserStatsHandler = async ({
	data,
}: {
	data: { userId: string };
}) => {
	return handleApiOperation(async () => {
		const { userId } = data;
		return await getAllPollsWithUserStats(userId);
	});
};
